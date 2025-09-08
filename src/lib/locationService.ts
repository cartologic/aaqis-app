import type { Station, AirQualityReading } from './types.js';

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
	const messages = {
		public: {
			good: "It's a beautiful day to breathe! The air quality is excellent. Enjoy your outdoor activities without concern. Take a walk, go for a run, or enjoy a family picnic. Let's work together to keep our air this clean!",
			moderate:
				'The air is acceptable, but some people are sensitive to it. If you have asthma, allergies, or other respiratory conditions, take it easy on long or intense outdoor activities. Listen to your body—if you feel symptoms like coughing, move your activity indoors.',
			unhealthy_sensitive:
				'Air quality is unhealthy for sensitive groups. If you have heart or lung disease, are older, or have children, reduce prolonged or heavy outdoor exertion. Everyone else can continue normal outdoor activities.',
			unhealthy:
				'Red alert! Air quality is unhealthy today. Minimize time outdoors, especially strenuous activities like sports or jogging. If you must go out, consider wearing a high-quality mask (like an N95) to protect your lungs. Keep windows closed and use an air conditioner or purifier to keep indoor air clean.',
			very_unhealthy:
				'Air quality is very unhealthy. Everyone should avoid all outdoor exertion. Stay indoors with windows and doors closed. Use air purifiers if available. Wear N95 masks if you must go outside.',
			hazardous:
				'Emergency conditions! Air quality is hazardous to everyone. Remain indoors and avoid all outdoor activities. Seal windows and doors. Use air purifiers on high settings. Seek medical attention if you experience breathing difficulties.'
		},
		government: {
			good: 'Good air quality is a sign of our progress. Use this data to celebrate achievements and reinforce policies that contribute to clean air. Highlight this success as a model for other regions and a benefit to public health and tourism.',
			moderate:
				'Moderate air quality provides an opportunity for targeted action. We can use this data to promote cleaner transport and energy-saving measures to prevent conditions from worsening. This is the ideal time to launch public campaigns about sustainable practices.',
			unhealthy_sensitive:
				'Air quality is affecting sensitive groups. Consider issuing health advisories for vulnerable populations. Review emission sources and implement temporary measures to reduce pollution levels.',
			unhealthy:
				'Unhealthy air quality is a public health risk. We recommend issuing a public advisory to reduce outdoor activities. Consider activating community clean air shelters or encouraging the use of public transport to reduce traffic-related emissions.',
			very_unhealthy:
				'Very unhealthy air quality requires immediate action. Issue public health warnings and consider emergency measures such as traffic restrictions, industrial emission controls, and public shelter activation.',
			hazardous:
				'Hazardous air quality requires emergency response. Declare a health emergency, implement all available emission reduction measures, and coordinate with health services to manage public health impacts.'
		}
	};

	const ratingKey = rating.toLowerCase().replace(/ /g, '_').replace('for_sensitive_groups', '_sensitive');
	const messageSet = messages[stakeholder as keyof typeof messages] || messages.public;
	return messageSet[ratingKey as keyof typeof messageSet] || messageSet.moderate;
}
