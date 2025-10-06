import type { AirQualityReading, Station, CityInfo, AQIRating } from './types.js';
import { CITY_INFO } from './types.js';
import { asset } from '$app/paths';
/**
 * Load air quality data from Parquet file using WebAssembly
 * @returns Promise<AirQualityReading[]> Array of air quality readings
 */
export async function loadAirQualityData(): Promise<AirQualityReading[]> {
	try {
		console.log('Starting to load Parquet data...');
		const parquet = await import('parquet-wasm');
		await parquet.default();
		console.log('Parquet WASM loaded successfully');

		const response = await fetch(asset('/data/african_cities_air_quality_2024_2026.parquet'));
		if (!response.ok) {
			throw new Error(`HTTP error! status: ${response.status}`);
		}
		console.log('Parquet file fetched successfully, size:', response.headers.get('content-length') || 'unknown');

		const arrayBuffer = await response.arrayBuffer();
		const uint8Array = new Uint8Array(arrayBuffer);
		console.log('Parquet file converted to Uint8Array, size:', uint8Array.length, 'bytes');

		const table = parquet.readParquet(uint8Array);
		console.log('Parquet table parsed successfully');

		const result = await parseParquetTable(table);
		console.log('Parquet data parsing completed, records:', result.length);
		return result;
	} catch (error) {
		console.error('Failed to load Parquet data, trying CSV fallback:', error);

		// Fallback to CSV
		try {
			const response = await fetch(asset('/data/african_cities_air_quality_2024_2026.csv'));
			if (!response.ok) {
				throw new Error(`HTTP error! status: ${response.status}`);
			}
			const csvText = await response.text();
			console.log('CSV file loaded, size:', csvText.length);
			const data = parseCSV(csvText);
			console.log('CSV parsed, records:', data.length);
			return data;
		} catch (csvError) {
			console.error('Failed to load CSV data:', csvError);
			return [];
		}
	}
}

/**
 * Parse CSV text into AirQualityReading objects
 * @param csvText Raw CSV text content
 * @returns AirQualityReading[] Array of parsed readings
 */
function parseCSV(csvText: string): AirQualityReading[] {
	const lines = csvText.trim().split('\n');
	const headers = lines[0].split(',').map(h => h.trim());
	const data: AirQualityReading[] = [];

	for (let i = 1; i < lines.length; i++) {
		const values = lines[i].split(',').map(v => v.trim());
		if (values.length !== headers.length) continue;

		const reading: any = {};
		headers.forEach((header, index) => {
			const value = values[index];
			if (
				header === 'station_id' ||
				header === 'datetime' ||
				header === 'city' ||
				header === 'station_name' ||
				header.includes('rating')
			) {
				reading[header] = value;
			} else {
				reading[header] = parseFloat(value) || 0;
			}
		});
		data.push(reading as AirQualityReading);
	}

	return data;
}

/**
 * Parse Parquet table data into AirQualityReading objects
 * @param wasmTable Parquet table from parquet-wasm
 * @returns AirQualityReading[] Array of parsed readings
 */
async function parseParquetTable(wasmTable: any): Promise<AirQualityReading[]> {
	try {
		// Convert WASM table to JavaScript Arrow table using IPC stream
		const { tableFromIPC } = await import('apache-arrow');
		const ipcStream = wasmTable.intoIPCStream();
		const arrowTable = tableFromIPC(ipcStream);

		const data: AirQualityReading[] = [];
		const numRows = arrowTable.numRows;

		// Get column data from the Arrow table
		const columns = {
			station_id: arrowTable.getChild('station_id')?.toArray() || [],
			datetime: arrowTable.getChild('datetime')?.toArray() || [],
			city: arrowTable.getChild('city')?.toArray() || [],
			station_name: arrowTable.getChild('station_name')?.toArray() || [],
			latitude: arrowTable.getChild('latitude')?.toArray() || [],
			longitude: arrowTable.getChild('longitude')?.toArray() || [],
			pm2_5: arrowTable.getChild('pm2_5')?.toArray() || [],
			pm10: arrowTable.getChild('pm10')?.toArray() || [],
			o3: arrowTable.getChild('o3')?.toArray() || [],
			no2: arrowTable.getChild('no2')?.toArray() || [],
			so2: arrowTable.getChild('so2')?.toArray() || [],
			co: arrowTable.getChild('co')?.toArray() || [],
			pm2_5_aqi: arrowTable.getChild('pm2_5_aqi')?.toArray() || [],
			pm10_aqi: arrowTable.getChild('pm10_aqi')?.toArray() || [],
			o3_aqi: arrowTable.getChild('o3_aqi')?.toArray() || [],
			no2_aqi: arrowTable.getChild('no2_aqi')?.toArray() || [],
			so2_aqi: arrowTable.getChild('so2_aqi')?.toArray() || [],
			co_aqi: arrowTable.getChild('co_aqi')?.toArray() || [],
			overall_aqi: arrowTable.getChild('overall_aqi')?.toArray() || [],
			overall_rating: arrowTable.getChild('overall_rating')?.toArray() || [],
			pm2_5_rating: arrowTable.getChild('pm2_5_rating')?.toArray() || [],
			pm10_rating: arrowTable.getChild('pm10_rating')?.toArray() || [],
			o3_rating: arrowTable.getChild('o3_rating')?.toArray() || [],
			no2_rating: arrowTable.getChild('no2_rating')?.toArray() || [],
			so2_rating: arrowTable.getChild('so2_rating')?.toArray() || [],
			co_rating: arrowTable.getChild('co_rating')?.toArray() || []
		};

		// Convert columnar data to row-based objects
		for (let i = 0; i < numRows; i++) {
			// Convert datetime to ISO string
			const datetimeValue = columns.datetime[i];
			let datetimeString: string;

			if (datetimeValue === null || datetimeValue === undefined) {
				console.warn(`Null datetime at row ${i}`);
				continue;
			}

			// Debug: log the first few datetime values to understand the format
			if (i < 3) {
				console.log(`Row ${i} datetime:`, datetimeValue, typeof datetimeValue, datetimeValue?.constructor?.name);
			}

			// Handle different datetime formats from Apache Arrow
			if (datetimeValue instanceof Date) {
				datetimeString = datetimeValue.toISOString();
			} else if (typeof datetimeValue === 'number') {
				// Numbers could be in various formats - try different interpretations
				let date: Date;

				// Check if it's a reasonable year (2020-2030 range in seconds since epoch)
				if (datetimeValue > 1577836800 && datetimeValue < 1893456000) {
					// Looks like seconds since epoch
					date = new Date(datetimeValue * 1000);
				} else if (datetimeValue > 1577836800000 && datetimeValue < 1893456000000) {
					// Looks like milliseconds since epoch
					date = new Date(datetimeValue);
				} else {
					// Default: assume milliseconds
					date = new Date(datetimeValue);
				}

				datetimeString = date.toISOString();
			} else if (typeof datetimeValue === 'bigint') {
				// Handle BigInt timestamps (likely nanoseconds or microseconds)
				const valueNum = Number(datetimeValue);
				let date: Date;

				if (valueNum > 1577836800000000000) {
					// Nanoseconds since epoch
					date = new Date(valueNum / 1000000);
				} else if (valueNum > 1577836800000000) {
					// Microseconds since epoch
					date = new Date(valueNum / 1000);
				} else if (valueNum > 1577836800000) {
					// Milliseconds since epoch
					date = new Date(valueNum);
				} else {
					// Seconds since epoch
					date = new Date(valueNum * 1000);
				}

				datetimeString = date.toISOString();
			} else if (typeof datetimeValue === 'string') {
				// If it's already a string, parse it
				const parsedDate = new Date(datetimeValue);
				if (!isNaN(parsedDate.getTime())) {
					datetimeString = parsedDate.toISOString();
				} else {
					console.warn(`Invalid datetime string at row ${i}: ${datetimeValue}`);
					continue;
				}
			} else {
				console.warn(`Unknown datetime type at row ${i}:`, typeof datetimeValue, datetimeValue);
				continue;
			}

			const reading: AirQualityReading = {
				station_id: String(columns.station_id[i] || ''),
				datetime: datetimeString,
				city: String(columns.city[i] || ''),
				station_name: String(columns.station_name[i] || ''),
				latitude: Number(columns.latitude[i]) || 0,
				longitude: Number(columns.longitude[i]) || 0,
				pm2_5: Number(columns.pm2_5[i]) || 0,
				pm10: Number(columns.pm10[i]) || 0,
				o3: Number(columns.o3[i]) || 0,
				no2: Number(columns.no2[i]) || 0,
				so2: Number(columns.so2[i]) || 0,
				co: Number(columns.co[i]) || 0,
				pm2_5_aqi: Number(columns.pm2_5_aqi[i]) || 0,
				pm10_aqi: Number(columns.pm10_aqi[i]) || 0,
				o3_aqi: Number(columns.o3_aqi[i]) || 0,
				no2_aqi: Number(columns.no2_aqi[i]) || 0,
				so2_aqi: Number(columns.so2_aqi[i]) || 0,
				co_aqi: Number(columns.co_aqi[i]) || 0,
				overall_aqi: Number(columns.overall_aqi[i]) || 0,
				overall_rating: String(columns.overall_rating[i] || 'good') as AQIRating,
				pm2_5_rating: String(columns.pm2_5_rating[i] || 'good') as AQIRating,
				pm10_rating: String(columns.pm10_rating[i] || 'good') as AQIRating,
				o3_rating: String(columns.o3_rating[i] || 'good') as AQIRating,
				no2_rating: String(columns.no2_rating[i] || 'good') as AQIRating,
				so2_rating: String(columns.so2_rating[i] || 'good') as AQIRating,
				co_rating: String(columns.co_rating[i] || 'good') as AQIRating
			};
			data.push(reading);
		}

		return data;
	} catch (error) {
		console.error('Error parsing Parquet table:', error);
		throw error;
	}
}

export function getStationsFromData(data: AirQualityReading[]): Station[] {
	const stationMap = new Map<string, Station>();

	data.forEach(reading => {
		if (!stationMap.has(reading.station_id)) {
			const cityInfo = CITY_INFO[reading.city];
			stationMap.set(reading.station_id, {
				id: reading.station_id,
				name: reading.station_name,
				city: reading.city,
				latitude: reading.latitude,
				longitude: reading.longitude,
				country: cityInfo?.country || 'ethiopia'
			});
		}
	});

	return Array.from(stationMap.values());
}

export function getLatestReadings(data: AirQualityReading[]): AirQualityReading[] {
	const latestMap = new Map<string, AirQualityReading>();

	data.forEach(reading => {
		const existing = latestMap.get(reading.station_id);
		if (!existing || new Date(reading.datetime) > new Date(existing.datetime)) {
			latestMap.set(reading.station_id, reading);
		}
	});

	return Array.from(latestMap.values());
}

export function filterDataByDateRange(data: AirQualityReading[], startDate: Date, endDate: Date): AirQualityReading[] {
	return data.filter(reading => {
		const readingDate = new Date(reading.datetime);
		return readingDate >= startDate && readingDate <= endDate;
	});
}

export function filterDataByCity(data: AirQualityReading[], city: string): AirQualityReading[] {
	return data.filter(reading => reading.city === city);
}

export function getDataForStation(data: AirQualityReading[], stationId: string): AirQualityReading[] {
	return data.filter(reading => reading.station_id === stationId);
}

export function calculateCityAverages(data: AirQualityReading[]): Record<string, AirQualityReading> {
	const cityGroups: Record<string, AirQualityReading[]> = {};

	data.forEach(reading => {
		if (!cityGroups[reading.city]) {
			cityGroups[reading.city] = [];
		}
		cityGroups[reading.city].push(reading);
	});

	const averages: Record<string, AirQualityReading> = {};

	Object.entries(cityGroups).forEach(([city, readings]) => {
		if (readings.length === 0) return;

		const avgReading: AirQualityReading = {
			station_id: `${city}_avg`,
			datetime: readings[0].datetime,
			city,
			station_name: `${city} Average`,
			latitude: readings.reduce((sum, r) => sum + r.latitude, 0) / readings.length,
			longitude: readings.reduce((sum, r) => sum + r.longitude, 0) / readings.length,
			pm2_5: readings.reduce((sum, r) => sum + r.pm2_5, 0) / readings.length,
			pm10: readings.reduce((sum, r) => sum + r.pm10, 0) / readings.length,
			o3: readings.reduce((sum, r) => sum + r.o3, 0) / readings.length,
			no2: readings.reduce((sum, r) => sum + r.no2, 0) / readings.length,
			so2: readings.reduce((sum, r) => sum + r.so2, 0) / readings.length,
			co: readings.reduce((sum, r) => sum + r.co, 0) / readings.length,
			pm2_5_aqi: readings.reduce((sum, r) => sum + r.pm2_5_aqi, 0) / readings.length,
			pm10_aqi: readings.reduce((sum, r) => sum + r.pm10_aqi, 0) / readings.length,
			o3_aqi: readings.reduce((sum, r) => sum + r.o3_aqi, 0) / readings.length,
			no2_aqi: readings.reduce((sum, r) => sum + r.no2_aqi, 0) / readings.length,
			so2_aqi: readings.reduce((sum, r) => sum + r.so2_aqi, 0) / readings.length,
			co_aqi: readings.reduce((sum, r) => sum + r.co_aqi, 0) / readings.length,
			overall_aqi: Math.max(...readings.map(r => r.overall_aqi)),
			overall_rating: getMostCommonRating(readings.map(r => r.overall_rating)),
			pm2_5_rating: getMostCommonRating(readings.map(r => r.pm2_5_rating)),
			pm10_rating: getMostCommonRating(readings.map(r => r.pm10_rating)),
			o3_rating: getMostCommonRating(readings.map(r => r.o3_rating)),
			no2_rating: getMostCommonRating(readings.map(r => r.no2_rating)),
			so2_rating: getMostCommonRating(readings.map(r => r.so2_rating)),
			co_rating: getMostCommonRating(readings.map(r => r.co_rating))
		};

		averages[city] = avgReading;
	});

	return averages;
}

function getMostCommonRating(ratings: any[]): any {
	const counts: Record<string, number> = {};
	ratings.forEach(rating => {
		counts[rating] = (counts[rating] || 0) + 1;
	});

	let mostCommon = ratings[0];
	let maxCount = 0;

	Object.entries(counts).forEach(([rating, count]) => {
		if (count > maxCount) {
			maxCount = count;
			mostCommon = rating;
		}
	});

	return mostCommon;
}

export function simulateCurrentTime(): Date {
	// Return actual current time instead of simulated time
	const now = new Date();
	console.log('Current simulated time:', now.toISOString());
	return now;
}

export function getDataUpToCurrentTime(data: AirQualityReading[]): AirQualityReading[] {
	const currentTime = simulateCurrentTime();
	const filteredData = data.filter(reading => new Date(reading.datetime) <= currentTime);

	console.log(
		`Filtered data from ${data.length} to ${filteredData.length} records (up to ${currentTime.toISOString()})`
	);

	// Log year distribution after filtering
	const yearCounts = filteredData.reduce(
		(acc, reading) => {
			const year = new Date(reading.datetime).getFullYear();
			acc[year] = (acc[year] || 0) + 1;
			return acc;
		},
		{} as Record<number, number>
	);

	console.log('Year distribution after current time filter:', yearCounts);

	return filteredData;
}

// Centralized emoji function for air quality ratings
export function getAQIEmoji(rating: string): string {
	switch (rating.toLowerCase()) {
		case 'good':
			return '😊';
		case 'moderate':
			return '😐';
		case 'unhealthy for sensitive groups':
			return '😷';
		case 'unhealthy':
			return '😨';
		case 'very unhealthy':
			return '🤢';
		case 'hazardous':
			return '☠️';
		default:
			return '❓';
	}
}

/**
 * Aggregate air quality data by time period (hourly, daily, etc.)
 * @param data Array of air quality readings
 * @param aggregationType Type of aggregation: 'hourly', 'daily', 'weekly'
 * @returns Aggregated air quality readings
 */
export function aggregateDataByTime(
	data: AirQualityReading[],
	aggregationType: 'hourly' | 'daily' | 'weekly' = 'daily'
): AirQualityReading[] {
	if (data.length === 0) return [];

	// Group data by time period
	const groupedData = new Map<string, AirQualityReading[]>();

	data.forEach(reading => {
		const date = new Date(reading.datetime);
		let groupKey: string;

		switch (aggregationType) {
			case 'hourly':
				groupKey = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}-${String(date.getDate()).padStart(2, '0')}-${String(date.getHours()).padStart(2, '0')}`;
				break;
			case 'daily':
				groupKey = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}-${String(date.getDate()).padStart(2, '0')}`;
				break;
			case 'weekly':
				const weekStart = new Date(date);
				weekStart.setDate(date.getDate() - date.getDay());
				groupKey = `${weekStart.getFullYear()}-W${String(Math.ceil(weekStart.getDate() / 7)).padStart(2, '0')}`;
				break;
			default:
				groupKey = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}-${String(date.getDate()).padStart(2, '0')}`;
		}

		if (!groupedData.has(groupKey)) {
			groupedData.set(groupKey, []);
		}
		groupedData.get(groupKey)!.push(reading);
	});

	// Calculate averages for each group
	const aggregatedData: AirQualityReading[] = [];

	groupedData.forEach((readings, groupKey) => {
		if (readings.length === 0) return;

		// Use the first reading as a template
		const template = readings[0];

		// Calculate averages for numeric fields
		const avgReading: AirQualityReading = {
			...template,
			datetime: readings[0].datetime, // Use first datetime as representative
			pm2_5: Number((readings.reduce((sum, r) => sum + Number(r.pm2_5), 0) / readings.length).toFixed(2)),
			pm10: Number((readings.reduce((sum, r) => sum + Number(r.pm10), 0) / readings.length).toFixed(2)),
			o3: Number((readings.reduce((sum, r) => sum + Number(r.o3), 0) / readings.length).toFixed(2)),
			no2: Number((readings.reduce((sum, r) => sum + Number(r.no2), 0) / readings.length).toFixed(2)),
			so2: Number((readings.reduce((sum, r) => sum + Number(r.so2), 0) / readings.length).toFixed(2)),
			co: Number((readings.reduce((sum, r) => sum + Number(r.co), 0) / readings.length).toFixed(2)),
			pm2_5_aqi: Number((readings.reduce((sum, r) => sum + Number(r.pm2_5_aqi), 0) / readings.length).toFixed(0)),
			pm10_aqi: Number((readings.reduce((sum, r) => sum + Number(r.pm10_aqi), 0) / readings.length).toFixed(0)),
			o3_aqi: Number((readings.reduce((sum, r) => sum + Number(r.o3_aqi), 0) / readings.length).toFixed(0)),
			no2_aqi: Number((readings.reduce((sum, r) => sum + Number(r.no2_aqi), 0) / readings.length).toFixed(0)),
			so2_aqi: Number((readings.reduce((sum, r) => sum + Number(r.so2_aqi), 0) / readings.length).toFixed(0)),
			co_aqi: Number((readings.reduce((sum, r) => sum + Number(r.co_aqi), 0) / readings.length).toFixed(0)),
			overall_aqi: Math.max(...readings.map(r => Number(r.overall_aqi))),
			// For ratings, use the most common rating
			overall_rating: getMostCommonRating(readings.map(r => r.overall_rating)),
			pm2_5_rating: getMostCommonRating(readings.map(r => r.pm2_5_rating)),
			pm10_rating: getMostCommonRating(readings.map(r => r.pm10_rating)),
			o3_rating: getMostCommonRating(readings.map(r => r.o3_rating)),
			no2_rating: getMostCommonRating(readings.map(r => r.no2_rating)),
			so2_rating: getMostCommonRating(readings.map(r => r.so2_rating)),
			co_rating: getMostCommonRating(readings.map(r => r.co_rating))
		};

		aggregatedData.push(avgReading);
	});

	// Sort by datetime
	return aggregatedData.sort((a, b) => new Date(a.datetime).getTime() - new Date(b.datetime).getTime());
}
