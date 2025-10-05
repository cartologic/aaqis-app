import type { Station, AirQualityReading } from './types.js';
import { getAirQualityMessage } from './messages.js';

export interface UserLocation {
	latitude: number;
	longitude: number;
	city?: string;
	country?: string;
}

export async function getUserLocation(): Promise<UserLocation | null> {
	// Try to get location from browser geolocation API
	if (navigator.geolocation) {
		try {
			const position = await new Promise<GeolocationPosition>((resolve, reject) => {
				navigator.geolocation.getCurrentPosition(resolve, reject, {
					timeout: 10000,
					enableHighAccuracy: true
				});
			});

			return {
				latitude: position.coords.latitude,
				longitude: position.coords.longitude
			};
		} catch (error) {
			console.log('Geolocation failed, trying IP-based location');
		}
	}

	// Fallback to IP-based location
	try {
		const response = await fetch('http://ip-api.com/json/');
		if (response.ok) {
			const data = await response.json();
			if (data.status === 'success') {
				return {
					latitude: data.lat,
					longitude: data.lon,
					city: data.city,
					country: data.country
				};
			}
		}
	} catch (error) {
		console.error('IP-based location failed:', error);
	}

	// Default to Nairobi if all fails
	return {
		latitude: -1.2921,
		longitude: 36.8219,
		city: 'Nairobi',
		country: 'Kenya'
	};
}

export function calculateDistance(lat1: number, lon1: number, lat2: number, lon2: number): number {
	const R = 6371; // Earth's radius in kilometers
	const dLat = ((lat2 - lat1) * Math.PI) / 180;
	const dLon = ((lon2 - lon1) * Math.PI) / 180;
	const a =
		Math.sin(dLat / 2) * Math.sin(dLat / 2) +
		Math.cos((lat1 * Math.PI) / 180) * Math.cos((lat2 * Math.PI) / 180) * Math.sin(dLon / 2) * Math.sin(dLon / 2);
	const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
	return R * c;
}

export function findNearestStation(userLocation: UserLocation, stations: Station[]): Station | null {
	if (!stations.length) return null;

	let nearestStation = stations[0];
	let minDistance = calculateDistance(
		userLocation.latitude,
		userLocation.longitude,
		nearestStation.latitude,
		nearestStation.longitude
	);

	for (const station of stations.slice(1)) {
		const distance = calculateDistance(
			userLocation.latitude,
			userLocation.longitude,
			station.latitude,
			station.longitude
		);

		if (distance < minDistance) {
			minDistance = distance;
			nearestStation = station;
		}
	}

	return nearestStation;
}

export function getStationReading(station: Station, readings: AirQualityReading[]): AirQualityReading | null {
	return readings.find(reading => reading.station_id === station.id) || null;
}

export function getLocationBasedMessage(aqi: number, rating: string, stakeholder: string = 'public'): string {
	// Use the centralized message system from messages.ts
	return getAirQualityMessage(rating, stakeholder);
}
