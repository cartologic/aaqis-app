export interface AirQualityReading {
	station_id: string;
	datetime: string;
	city: string;
	station_name: string;
	latitude: number;
	longitude: number;
	pm2_5: number;
	pm10: number;
	o3: number;
	no2: number;
	so2: number;
	co: number;
	pm2_5_aqi: number;
	pm10_aqi: number;
	o3_aqi: number;
	no2_aqi: number;
	so2_aqi: number;
	co_aqi: number;
	overall_aqi: number;
	overall_rating: AQIRating;
	pm2_5_rating: AQIRating;
	pm10_rating: AQIRating;
	o3_rating: AQIRating;
	no2_rating: AQIRating;
	so2_rating: AQIRating;
	co_rating: AQIRating;
}

export type AQIRating = 'good' | 'moderate' | 'unhealthy_sensitive' | 'unhealthy' | 'very_unhealthy' | 'hazardous';

export interface Station {
	id: string;
	name: string;
	city: string;
	latitude: number;
	longitude: number;
	country: Country;
}

export type Country = 'ethiopia' | 'kenya' | 'uganda' | 'rwanda' | 'botswana';

export interface CityInfo {
	name: string;
	displayName: string;
	country: Country;
	emoji: string;
	stations: Station[];
	center: [number, number];
	zoom: number;
}

export interface WHOGuideline {
	pollutant: string;
	averagingTime: string;
	guideline: number;
	unit: string;
}

export interface AirQualityMessage {
	target: 'public' | 'government' | 'practitioners';
	rating: AQIRating;
	message: string;
	recommendations?: string[];
}

export const WHO_GUIDELINES: WHOGuideline[] = [
	{ pollutant: 'PM2.5', averagingTime: 'Annual', guideline: 5, unit: 'µg/m³' },
	{ pollutant: 'PM2.5', averagingTime: '24-hour', guideline: 15, unit: 'µg/m³' },
	{ pollutant: 'PM10', averagingTime: 'Annual', guideline: 15, unit: 'µg/m³' },
	{ pollutant: 'PM10', averagingTime: '24-hour', guideline: 45, unit: 'µg/m³' },
	{ pollutant: 'O₃', averagingTime: 'Peak season', guideline: 60, unit: 'µg/m³' },
	{ pollutant: 'O₃', averagingTime: '8-hour', guideline: 100, unit: 'µg/m³' },
	{ pollutant: 'NO₂', averagingTime: 'Annual', guideline: 10, unit: 'µg/m³' },
	{ pollutant: 'NO₂', averagingTime: '24-hour', guideline: 25, unit: 'µg/m³' },
	{ pollutant: 'SO₂', averagingTime: '24-hour', guideline: 40, unit: 'µg/m³' },
	{ pollutant: 'CO', averagingTime: '24-hour', guideline: 4, unit: 'mg/m³' }
];

export const CITY_INFO: Record<string, CityInfo> = {
	addis_ababa: {
		name: 'addis_ababa',
		displayName: 'Addis Ababa',
		country: 'ethiopia',
		emoji: '🇪🇹',
		center: [38.7578, 9.0192],
		zoom: 11,
		stations: []
	},
	kampala: {
		name: 'kampala',
		displayName: 'Kampala',
		country: 'uganda',
		emoji: '🇺🇬',
		center: [32.5825, 0.3163],
		zoom: 11,
		stations: []
	},
	nairobi: {
		name: 'nairobi',
		displayName: 'Nairobi',
		country: 'kenya',
		emoji: '🇰🇪',
		center: [36.8219, -1.2921],
		zoom: 11,
		stations: []
	},
	gaborone: {
		name: 'gaborone',
		displayName: 'Gaborone',
		country: 'botswana',
		emoji: '🇧🇼',
		center: [25.9087, -24.6282],
		zoom: 11,
		stations: []
	},
	kigali: {
		name: 'kigali',
		displayName: 'Kigali',
		country: 'rwanda',
		emoji: '🇷🇼',
		center: [30.0588, -1.9403],
		zoom: 11,
		stations: []
	}
};

export const COUNTRY_THEMES: Record<Country, { primary: string; secondary: string; accent: string }> = {
	ethiopia: {
		primary: 'ethiopia-600',
		secondary: 'ethiopia-100',
		accent: 'ethiopia-800'
	},
	kenya: {
		primary: 'kenya-600',
		secondary: 'kenya-100',
		accent: 'kenya-800'
	},
	uganda: {
		primary: 'uganda-500',
		secondary: 'uganda-100',
		accent: 'uganda-800'
	},
	rwanda: {
		primary: 'rwanda-600',
		secondary: 'rwanda-100',
		accent: 'rwanda-800'
	},
	botswana: {
		primary: 'botswana-600',
		secondary: 'botswana-100',
		accent: 'botswana-800'
	}
};

// Country color palette for dynamic header backgrounds
export const COUNTRY_COLOR_PALETTE: Record<Country, string> = {
	ethiopia: 'linear-gradient(135deg, #22c55e 0%, #16a34a 50%, #15803d 100%)', // Green gradient (Ethiopian flag colors)
	kenya: 'linear-gradient(135deg, #dc2626 0%, #000000 50%, #22c55e 100%)', // Red, black, green gradient (Kenyan flag colors)
	uganda: 'linear-gradient(135deg, #000000 0%, #eab308 50%, #dc2626 100%)', // Black, yellow, red gradient (Ugandan flag colors)
	rwanda: 'linear-gradient(135deg, #3b82f6 0%, #eab308 50%, #22c55e 100%)', // Blue, yellow, green gradient (Rwandan flag colors)
	botswana: 'linear-gradient(135deg, #3b82f6 0%, #ffffff 50%, #3b82f6 100%)' // Blue and white gradient (Botswana flag colors)
};

export function getAQIColor(rating: AQIRating): string {
	switch (rating) {
		case 'good':
			return '#22c55e'; // green-500
		case 'moderate':
			return '#eab308'; // yellow-500
		case 'unhealthy_sensitive':
			return '#f97316'; // orange-500
		case 'unhealthy':
			return '#ef4444'; // red-500
		case 'very_unhealthy':
			return '#a855f7'; // purple-500
		case 'hazardous':
			return '#7c2d12'; // red-900
		default:
			return '#6b7280'; // gray-500
	}
}

export function getAQIDescription(rating: AQIRating): string {
	switch (rating) {
		case 'good':
			return 'Good';
		case 'moderate':
			return 'Moderate';
		case 'unhealthy_sensitive':
			return 'Unhealthy for Sensitive Groups';
		case 'unhealthy':
			return 'Unhealthy';
		case 'very_unhealthy':
			return 'Very Unhealthy';
		case 'hazardous':
			return 'Hazardous';
		default:
			return 'Unknown';
	}
}

export function formatPollutant(pollutant: string): string {
	switch (pollutant.toLowerCase()) {
		case 'pm2_5':
			return 'PM₂.₅';
		case 'pm10':
			return 'PM₁₀';
		case 'o3':
			return 'O₃';
		case 'no2':
			return 'NO₂';
		case 'so2':
			return 'SO₂';
		case 'co':
			return 'CO';
		default:
			return pollutant.toUpperCase();
	}
}