<script lang="ts">
	import { onMount } from 'svelte';
	import type { AirQualityReading, Station } from '$lib/types';
	import { loadAirQualityData, getStationsFromData, getLatestReadings, getDataUpToCurrentTime, simulateCurrentTime, getAQIEmoji, aggregateDataByTime } from '$lib/dataUtils';
	import { getUserLocation, findNearestStation, getStationReading, getLocationBasedMessage, type UserLocation } from '$lib/locationService';
	import { CITY_INFO, COUNTRY_COLOR_PALETTE } from '$lib/types';
	import MapComponent from '$lib/components/MapComponent.svelte';
	import AQIGauge from '$lib/components/AQIGauge.svelte';
	import FilterBar from '$lib/components/FilterBar.svelte';
	import LineChart from '$lib/components/LineChart.svelte';
	import AirQualityHeatmap from '$lib/components/AirQualityHeatmap.svelte';

	let allData: AirQualityReading[] = [];
	let filteredData: AirQualityReading[] = [];
	let stations: Station[] = [];
	let latestReadings: AirQualityReading[] = [];
	let userLocation: UserLocation | null = null;
	let nearestStation: Station | null = null;
	let selectedStation: Station | null = null;
	let currentReading: AirQualityReading | null = null;
	let selectedCity = 'all';
	let selectedPollutant = 'pm2_5';
	let startDate = '2024-01-01';
	let endDate = simulateCurrentTime().toISOString().split('T')[0];
	let selectedDateRange = 'now';
	let showRealTimeOnly = true;
	let selectedStakeholder = 'public';
	let mapComponent: MapComponent;
	let isLoading = true;
	let currentTime = simulateCurrentTime();
	let locationMessage = '';
	let isManualSelection = false;
	let locationName = 'Your Area';
	let headerBackgroundStyle = 'background: linear-gradient(135deg, #2563eb 0%, #16a34a 50%, #2563eb 100%)'; // Default gradient
	let filterMetadata = {
		availableCities: [] as string[],
		availableStations: [] as string[],
		dateRange: { min: new Date(), max: new Date() },
		totalRecords: 0,
		filtersApplied: [] as string[]
	};

	onMount(async () => {
		// Load location first
		userLocation = await getUserLocation();
		
		// Load air quality data
		allData = await loadAirQualityData();
		console.log(`Loaded ${allData.length} total records from Parquet file`);
		
		// Log date range of loaded data
		if (allData.length > 0) {
			const dates = allData.map(r => new Date(r.datetime)).sort((a, b) => a.getTime() - b.getTime());
			console.log('Data date range:', {
				first: dates[0].toISOString(),
				last: dates[dates.length - 1].toISOString(),
				years: [...new Set(dates.map(d => d.getFullYear()))]
			});
		}
		
		// If no data loaded, create sample data for testing
		if (allData.length === 0) {
			console.warn('No data loaded from Parquet file, using sample data');
			allData = createSampleData();
		}
		
		const currentData = getDataUpToCurrentTime(allData);
		stations = getStationsFromData(currentData);
		latestReadings = getLatestReadings(currentData);
		filteredData = currentData;
		
		// Find nearest station and get reading
		if (userLocation && stations.length > 0) {
			nearestStation = findNearestStation(userLocation, stations);
			if (nearestStation) {
				currentReading = getStationReading(nearestStation, latestReadings);
				if (currentReading) {
					locationMessage = getLocationBasedMessage(
						currentReading.overall_aqi,
						currentReading.overall_rating,
						selectedStakeholder
					);
				}
			}
		}
		
		// Fallback to overall data if no location-specific data
		if (!currentReading && latestReadings.length > 0) {
			currentReading = latestReadings[0];
			locationMessage = getLocationBasedMessage(
				currentReading.overall_aqi,
				currentReading.overall_rating,
				selectedStakeholder
			);
		}
		
		isLoading = false;

		// Update time every minute for simulation
		setInterval(() => {
			currentTime = new Date(currentTime.getTime() + 60000);
		}, 60000);
	});

	// Smart cross-filtering with auto-detection and dependency management
	$: {
		if (allData.length > 0) {
			let filtered = getDataUpToCurrentTime(allData);
			let availableCities = new Set<string>();
			let availableStations = new Set<string>();
			let dateRange = { min: new Date(), max: new Date(0) };
			
			// First pass: collect available options based on current filters
			let tempFiltered = [...filtered];
			
			// Apply date range filter first (most restrictive)
			if (selectedDateRange !== 'now') {
				// Use simulated current time instead of actual current date
				const now = currentTime;
				let startDateObj, endDateObj;
				
				switch (selectedDateRange) {
					case 'today':
						startDateObj = new Date(now.getFullYear(), now.getMonth(), now.getDate());
						endDateObj = new Date(now.getFullYear(), now.getMonth(), now.getDate(), 23, 59, 59);
						break;
					case 'week':
						startDateObj = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
						endDateObj = now;
						break;
					case 'month':
						startDateObj = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
						endDateObj = now;
						break;
					case 'custom':
						startDateObj = startDate ? new Date(startDate) : new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
						endDateObj = endDate ? new Date(endDate) : now;
						// Set end date to end of day
						endDateObj.setHours(23, 59, 59, 999);
						break;
					default:
						startDateObj = new Date(startDate);
						endDateObj = new Date(endDate);
						// Set end date to end of day
						endDateObj.setHours(23, 59, 59, 999);
				}
				
				tempFiltered = tempFiltered.filter(reading => {
					try {
						// Enhanced datetime parsing for Parquet data compatibility
						let readingDate: Date;
						
						if (typeof reading.datetime === 'string') {
							// Handle ISO string format from Parquet conversion
							readingDate = new Date(reading.datetime);
						} else if (typeof reading.datetime === 'number') {
							// Handle timestamp format
							readingDate = new Date(reading.datetime);
						} else {
							// Fallback for other formats
							readingDate = new Date(reading.datetime);
						}
						
						// Validate the parsed date
						if (isNaN(readingDate.getTime())) {
							console.warn('Invalid datetime value:', reading.datetime);
							return false;
						}
						
						return readingDate >= startDateObj && readingDate <= endDateObj;
					} catch (error) {
						console.warn('Error parsing datetime:', reading.datetime, error);
						return false;
					}
				});
			}
			
			// Apply city filter
			if (selectedCity !== 'all') {
				tempFiltered = tempFiltered.filter(reading => reading.city === selectedCity);
			}
			
			// Apply data aggregation for time-based filtering
			if (selectedDateRange !== 'now' && tempFiltered.length > 0) {
				let aggregationType: 'hourly' | 'daily' | 'weekly' = 'daily';
				
				// Choose aggregation type based on date range
				switch (selectedDateRange) {
					case 'today':
						aggregationType = 'hourly';
						break;
					case 'week':
						aggregationType = 'daily';
						break;
					case 'month':
						aggregationType = 'daily';
						break;
					case 'custom':
					// Determine aggregation based on date range length
					const startDateObj = startDate ? new Date(startDate) : null;
					const endDateObj = endDate ? new Date(endDate) : null;
					const daysDiff = endDateObj && startDateObj ? 
						(endDateObj.getTime() - startDateObj.getTime()) / (1000 * 60 * 60 * 24) : 7;
						if (daysDiff <= 1) {
							aggregationType = 'hourly';
						} else if (daysDiff <= 30) {
							aggregationType = 'daily';
						} else {
							aggregationType = 'weekly';
						}
						break;
				}
				
				tempFiltered = aggregateDataByTime(tempFiltered, aggregationType);
			}
			
			// Auto-detect available options after filtering
			tempFiltered.forEach(reading => {
				availableCities.add(reading.city);
				availableStations.add(reading.station_id);
				
				// Enhanced date range tracking with error handling
				try {
					let readingDate: Date;
					
					if (typeof reading.datetime === 'string') {
						readingDate = new Date(reading.datetime);
					} else if (typeof reading.datetime === 'number') {
						readingDate = new Date(reading.datetime);
					} else {
						readingDate = new Date(reading.datetime);
					}
					
					if (!isNaN(readingDate.getTime())) {
						if (readingDate < dateRange.min) dateRange.min = readingDate;
						if (readingDate > dateRange.max) dateRange.max = readingDate;
					}
				} catch (error) {
					console.warn('Error tracking date range for:', reading.datetime, error);
				}
			});
			
			// Smart station validation: auto-clear invalid station selection
			if (selectedStation && !availableStations.has(selectedStation.id)) {
				selectedStation = null;
				isManualSelection = false;
			}
			
			filteredData = tempFiltered;
			latestReadings = getLatestReadings(tempFiltered);
			
			// Update stations based on filtered data with smart dependency handling
			stations = getStationsFromData(tempFiltered);
			
			// Store filter metadata for UI feedback
			filterMetadata = {
				availableCities: Array.from(availableCities),
				availableStations: Array.from(availableStations),
				dateRange,
				totalRecords: tempFiltered.length,
				filtersApplied: [
					...(selectedCity !== 'all' ? ['city'] : []),
					...(selectedDateRange !== 'now' ? ['date'] : []),
					...(selectedStation ? ['station'] : [])
				]
			};
		}
	}

	// Calculate overall air quality status
	$: activeStation = selectedStation || nearestStation;
	$: currentReading = activeStation ? getStationReading(activeStation, latestReadings) : null;
	$: overallAQI = currentReading?.overall_aqi || 0;
	$: overallRating = currentReading?.overall_rating || 'Good';
	
	// Update header background and location name based on selected location
	$: {
		if (activeStation) {
			locationName = `${CITY_INFO[activeStation.city]?.displayName || activeStation.city} - ${activeStation.name}`;
			const country = CITY_INFO[activeStation.city]?.country;
			headerBackgroundStyle = country ? `background: ${COUNTRY_COLOR_PALETTE[country]}` : 'background: linear-gradient(135deg, #2563eb 0%, #16a34a 50%, #2563eb 100%)';
		} else if (selectedCity && selectedCity !== 'all') {
			locationName = CITY_INFO[selectedCity]?.displayName || selectedCity;
			const country = CITY_INFO[selectedCity]?.country;
			headerBackgroundStyle = country ? `background: ${COUNTRY_COLOR_PALETTE[country]}` : 'background: linear-gradient(135deg, #2563eb 0%, #16a34a 50%, #2563eb 100%)';
		} else {
			locationName = 'Your Area';
			headerBackgroundStyle = 'background: linear-gradient(135deg, #2563eb 0%, #16a34a 50%, #2563eb 100%)';
		}
	}
	
	// Update location message when stakeholder changes
	$: if (currentReading) {
		locationMessage = getLocationBasedMessage(
			currentReading.overall_aqi,
			currentReading.overall_rating,
			selectedStakeholder
		);
	}
	
	// Station selection handler
	function selectStation(station: Station) {
		selectedStation = station;
		isManualSelection = true;
		
		// Fly to station on map
		if (mapComponent) {
			mapComponent.flyToStation(station);
		}
	}
	
	// Filter event handlers
	function handleCityChange(event: CustomEvent<string>) {
		selectedCity = event.detail;
		// Reset station selection when city changes
		if (selectedCity !== 'all') {
			selectedStation = null;
			isManualSelection = false;
		}
	}
	
	function handleStationSelect(event: CustomEvent<Station | null>) {
		if (event.detail) {
			selectStation(event.detail);
		} else {
			selectedStation = null;
			isManualSelection = false;
		}
	}
	
	function handleDateRangeChange(event: CustomEvent<string>) {
		selectedDateRange = event.detail;
		
		// Set date ranges based on selection
		const now = new Date();
		switch (selectedDateRange) {
			case 'today':
				startDate = now.toISOString().split('T')[0];
				endDate = now.toISOString().split('T')[0];
				break;
			case 'week':
				const weekAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
				startDate = weekAgo.toISOString().split('T')[0];
				endDate = now.toISOString().split('T')[0];
				break;
			case 'month':
				const monthAgo = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
				startDate = monthAgo.toISOString().split('T')[0];
				endDate = now.toISOString().split('T')[0];
				break;
			case 'now':
			default:
				// Use current data
				break;
		}
	}
	
	function handleCustomDateChange(event: CustomEvent<{startDate: string, endDate: string}>) {
		startDate = event.detail.startDate;
		endDate = event.detail.endDate;
	}
	
	function handleClearFilters() {
		selectedCity = 'all';
		selectedStation = null;
		selectedDateRange = 'now';
		isManualSelection = false;
	}
	
	function handleClearAllFilters() {
		selectedCity = 'all';
		selectedStation = null;
		selectedDateRange = 'now';
		startDate = '';
		endDate = '';
		isManualSelection = false;
		selectedPollutant = 'pm2_5';
		selectedStakeholder = 'public';
	}
	
	// Reset to user location
	function resetToUserLocation() {
		selectedStation = null;
		isManualSelection = false;
	}

	function getAQIRating(aqi: number): string {
		if (aqi <= 50) return 'Good';
		if (aqi <= 100) return 'Moderate';
		if (aqi <= 150) return 'Unhealthy for Sensitive Groups';
		if (aqi <= 200) return 'Unhealthy';
		if (aqi <= 300) return 'Very Unhealthy';
		return 'Hazardous';
	}

	function getAQIColor(rating: string | number): string {
		const aqi = typeof rating === 'string' ? 0 : rating;
		const ratingStr = typeof rating === 'string' ? rating.toLowerCase() : '';
		
		if (ratingStr.includes('good') || aqi <= 50) return '#22c55e';
		if (ratingStr.includes('moderate') || aqi <= 100) return '#eab308';
		if (ratingStr.includes('sensitive') || ratingStr.includes('unhealthy') || aqi <= 150) return '#f97316';
		if (ratingStr.includes('unhealthy') || aqi <= 200) return '#ef4444';
		if (ratingStr.includes('very') || aqi <= 300) return '#a855f7';
		return '#7f1d1d';
	}

	function formatTime(date: Date): string {
		return date.toLocaleString('en-US', {
			month: 'short',
			day: 'numeric',
			hour: '2-digit',
			minute: '2-digit'
		});
	}
	
	function formatRating(rating: string): string {
		return rating
			.replace(/_/g, ' ')
			.replace(/\b\w/g, l => l.toUpperCase());
	}
	

	
	function getCityStats() {
		const cityGroups: Record<string, AirQualityReading[]> = {};
		
		latestReadings.forEach(reading => {
			if (!cityGroups[reading.city]) {
				cityGroups[reading.city] = [];
			}
			cityGroups[reading.city].push(reading);
		});
		
		return Object.entries(cityGroups).map(([city, readings]) => {
			const avgAQI = readings.reduce((sum, r) => sum + r.overall_aqi, 0) / readings.length;
			const avgPM25 = readings.reduce((sum, r) => sum + r.pm2_5, 0) / readings.length;
			const cityInfo = CITY_INFO[city];
			
			return {
				name: cityInfo?.displayName || city,
				emoji: cityInfo?.emoji || '🌆',
				aqi: avgAQI,
				pm25: avgPM25,
				rating: readings[0]?.overall_rating || 'good',
				stationCount: readings.length
			};
		}).sort((a, b) => b.aqi - a.aqi);
	}
	
	function getStationsByCity() {
		const cityGroups: Record<string, {station: Station, reading: AirQualityReading}[]> = {};
		
		stations.forEach(station => {
			const reading = latestReadings.find(r => r.station_id === station.id);
			if (reading) {
				if (!cityGroups[station.city]) {
					cityGroups[station.city] = [];
				}
				cityGroups[station.city].push({ station, reading });
			}
		});
		
		return Object.entries(cityGroups).map(([city, stationData]) => {
			const cityInfo = CITY_INFO[city];
			return {
				name: cityInfo?.displayName || city,
				emoji: cityInfo?.emoji || '🌆',
				stations: stationData.sort((a, b) => b.reading.overall_aqi - a.reading.overall_aqi)
			};
		}).sort((a, b) => {
			const avgAQIA = a.stations.reduce((sum, s) => sum + s.reading.overall_aqi, 0) / a.stations.length;
			const avgAQIB = b.stations.reduce((sum, s) => sum + s.reading.overall_aqi, 0) / b.stations.length;
			return avgAQIB - avgAQIA;
		});
	}
	
	function createSampleData(): AirQualityReading[] {
		return [
			{
				station_id: 'AA001',
				datetime: '2024-06-15 12:00:00',
				city: 'addis_ababa',
				station_name: 'Bole Station',
				latitude: 9.0227,
				longitude: 38.7465,
				pm2_5: 25,
				pm10: 45,
				o3: 80,
				no2: 35,
				so2: 20,
				co: 1.5,
				pm2_5_aqi: 75,
				pm10_aqi: 65,
				o3_aqi: 70,
				no2_aqi: 60,
				so2_aqi: 55,
				co_aqi: 50,
				overall_aqi: 75,
				overall_rating: 'moderate',
				pm2_5_rating: 'moderate',
				pm10_rating: 'moderate',
				o3_rating: 'moderate',
				no2_rating: 'moderate',
				so2_rating: 'moderate',
				co_rating: 'good'
			},
			{
				station_id: 'KA001',
				datetime: '2024-06-15 12:00:00',
				city: 'kampala',
				station_name: 'Central Station',
				latitude: 0.3177,
				longitude: 32.5825,
				pm2_5: 30,
				pm10: 50,
				o3: 85,
				no2: 40,
				so2: 25,
				co: 2,
				pm2_5_aqi: 85,
				pm10_aqi: 75,
				o3_aqi: 80,
				no2_aqi: 70,
				so2_aqi: 65,
				co_aqi: 60,
				overall_aqi: 85,
				overall_rating: 'moderate',
				pm2_5_rating: 'moderate',
				pm10_rating: 'moderate',
				o3_rating: 'moderate',
				no2_rating: 'moderate',
				so2_rating: 'moderate',
				co_rating: 'moderate'
			}
		];
	}
</script>

<svelte:head>
	<title>Africa Air Quality Information System (AAQIS)</title>
	<meta name="description" content="Real-time air quality monitoring for African cities - supporting public health, policy decisions, and environmental research." />
</svelte:head>

<!-- Header -->
<header class="text-white shadow-xl" style="{headerBackgroundStyle}">
	<div class="container mx-auto px-4 py-4">
		<div class="flex flex-col md:flex-row md:items-center md:justify-between">
			<div class="flex items-center space-x-3 mb-4 md:mb-0">
				<div class="text-2xl">🌍</div>
				<div>
					<h1 class="text-2xl md:text-2xl font-bold font-african text-white">
						AAQIS
					</h1>
					<p class="text-xs md:text-sm text-blue-100">
						Africa Air Quality Information System
					</p>
				</div>
			</div>
			
			<div class="flex flex-col md:flex-row md:items-center space-y-2 md:space-y-0 md:space-x-6">
				<div class="flex items-center space-x-2">
					<div class="w-3 h-3 bg-green-300 rounded-full animate-pulse shadow-lg"></div>
					<span class="text-sm text-white font-medium">Live Data</span>
				</div>
				<div class="text-sm text-blue-100">
					<span>📍 {locationName}</span>
				</div>
				<div class="text-sm text-blue-100">
					<span>🕒 {formatTime(currentTime)}</span>
				</div>
			</div>
		</div>
	</div>
</header>

<!-- Interactive Filter Bar -->
<FilterBar 
	{stations}
	{latestReadings}
	{filterMetadata}
	bind:selectedCity
	bind:selectedStation
	bind:selectedDateRange
	bind:startDate
	bind:endDate
	on:cityChange={handleCityChange}
	on:stationSelect={handleStationSelect}
	on:dateRangeChange={handleDateRangeChange}
	on:customDateChange={handleCustomDateChange}
	on:clearFilters={handleClearFilters}
	on:clearAllFilters={handleClearAllFilters}
/>

{#if isLoading}
	<div class="flex items-center justify-center min-h-screen">
		<div class="text-center">
			<div class="animate-spin rounded-full h-12 w-12 border-b-2 border-ethiopia-600 mx-auto mb-4"></div>
			<p class="text-gray-600">Loading air quality data...</p>
		</div>
	</div>
{:else}
	<main class="min-h-screen bg-gradient-to-br from-blue-50 via-white to-green-50">
		<!-- Hero Section with AQI Gauge -->
		<section class="py-12">
			<div class="container mx-auto px-4">
				<div class="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
					<!-- AQI Gauge -->
					<div class="text-center lg:text-left">
						<h2 class="text-3xl md:text-4xl font-bold text-gray-800 mb-6">
							Air Quality in <span class="text-blue-600">{locationName}</span>
						</h2>
						
						<div class="flex justify-center lg:justify-start mb-8">
							<AQIGauge 
								aqi={Math.round(overallAQI)} 
								rating={formatRating(overallRating)}
								size={200}
							/>
						</div>
						
						<!-- Station Info Card -->
						{#if activeStation}
							<div class="bg-white/70 backdrop-blur-sm rounded-xl p-4 shadow-lg">
								<div class="flex items-center justify-between mb-3">
									<div class="flex items-center space-x-3">
										<div class="text-2xl">📍</div>
										<div>
											<h3 class="font-semibold text-gray-800">{activeStation.name}</h3>
											<p class="text-sm text-gray-600">
												{isManualSelection ? 'Selected station' : 'Nearest station'} • ID: {activeStation.id}
											</p>
										</div>
									</div>
									{#if isManualSelection}
										<button 
											class="text-xs bg-blue-100 text-blue-700 px-2 py-1 rounded hover:bg-blue-200 transition-colors"
											on:click={resetToUserLocation}
										>
											🏠 Return to my location
										</button>
									{/if}
								</div>
								{#if currentReading}
									<div class="grid grid-cols-3 gap-3 text-sm">
										<div class="text-center p-2 bg-gray-50 rounded">
											<div class="font-semibold text-gray-800">PM2.5</div>
											<div class="text-xs text-gray-600">{currentReading.pm2_5.toFixed(1)} μg/m³</div>
										</div>
										<div class="text-center p-2 bg-gray-50 rounded">
											<div class="font-semibold text-gray-800">PM10</div>
											<div class="text-xs text-gray-600">{currentReading.pm10.toFixed(1)} μg/m³</div>
										</div>
										<div class="text-center p-2 bg-gray-50 rounded">
											<div class="font-semibold text-gray-800">O₃</div>
											<div class="text-xs text-gray-600">{currentReading.o3.toFixed(1)} μg/m³</div>
										</div>
									</div>
								{/if}
							</div>
						{/if}
					</div>
					
					<!-- Health Message -->
					<div class="space-y-6">
						<!-- Stakeholder Selection -->
						<div class="bg-white rounded-xl p-6 shadow-lg">
							<h3 class="text-lg font-semibold text-gray-800 mb-4">
								🎯 Choose Your Role
							</h3>
							<div class="grid grid-cols-2 gap-3">
								<button 
									class="p-3 text-left rounded-lg border-2 transition-all duration-200 {selectedStakeholder === 'public' ? 'border-blue-500 bg-blue-50 text-blue-700' : 'border-gray-200 hover:border-gray-300'}"
									on:click={() => selectedStakeholder = 'public'}
								>
									<div class="text-2xl mb-1">👥</div>
									<div class="font-medium">Public</div>
									<div class="text-xs opacity-75">General citizen</div>
								</button>
								<button 
									class="p-3 text-left rounded-lg border-2 transition-all duration-200 {selectedStakeholder === 'government' ? 'border-blue-500 bg-blue-50 text-blue-700' : 'border-gray-200 hover:border-gray-300'}"
									on:click={() => selectedStakeholder = 'government'}
								>
									<div class="text-2xl mb-1">🏢</div>
									<div class="font-medium">Government</div>
									<div class="text-xs opacity-75">Policy maker</div>
								</button>
							</div>
						</div>
						
						<!-- Health Advice -->
						{#if locationMessage}
							<div class="bg-white rounded-xl p-6 shadow-lg">
								<div class="flex items-start space-x-4">
									<div class="text-3xl">
								{getAQIEmoji(overallRating)}
							</div>
									<div class="flex-1">
										<h3 class="text-lg font-semibold text-gray-800 mb-3">
											Advice for {selectedStakeholder === 'public' ? 'You' : 'Policy Makers'}
										</h3>
										<p class="text-gray-700 leading-relaxed">
											{locationMessage}
										</p>
									</div>
								</div>
							</div>
						{/if}
					</div>
				</div>
			</div>
		</section>
		
		<!-- Line Chart for Time Series Data -->
		{#if selectedDateRange !== 'now' && filteredData.length > 0}
			<section class="py-8">
				<div class="container mx-auto px-4">
					<div class="bg-white rounded-xl shadow-lg p-6">
						<LineChart 
							data={filteredData} 
							title="Air Quality Trend - {selectedCity === 'all' ? 'All Cities' : (CITY_INFO[selectedCity]?.displayName || selectedCity.replace('_', ' ').replace(/\b\w/g, l => l.toUpperCase()))}"
							height={400}
						/>
					</div>
				</div>
			</section>
		{/if}

		<!-- Year-to-Date Heatmap -->
		<section class="py-8">
			<div class="container mx-auto px-4">
				<AirQualityHeatmap 
					data={(() => {
						// Get available years from data dynamically
						const availableYears = [...new Set(allData.map(r => new Date(r.datetime).getFullYear()))];
						console.log('Available years in data:', availableYears);
						
						// Use 2024 for best data coverage, fallback to earliest year
						const targetYear = availableYears.includes(2024) ? 2024 : (availableYears.length > 0 ? Math.min(...availableYears) : new Date().getFullYear());
						console.log('Using year for heatmap:', targetYear);
						
						const heatmapData = allData.filter(reading => {
							const readingYear = new Date(reading.datetime).getFullYear();
							return readingYear === targetYear;
						});
						console.log(`Filtered ${heatmapData.length} records for year ${targetYear} heatmap`);
						return heatmapData;
					})()} 
					selectedStation={activeStation}
					title="Year-to-Date Air Quality Overview - {activeStation ? activeStation.name : (selectedCity === 'all' ? 'All Cities' : (CITY_INFO[selectedCity]?.displayName || selectedCity.replace('_', ' ').replace(/\b\w/g, l => l.toUpperCase())))}"
				/>
			</div>
		</section>

		<!-- Map and City Data Section -->
		<section class="py-8 bg-white">
			<div class="container mx-auto px-4">
				<h2 class="text-2xl md:text-3xl font-bold text-gray-800 mb-8 text-center">
					🗺️ Live Air Quality Monitoring
				</h2>
				<p class="text-center text-gray-600 mb-8">
					Click any station on the map or in the list to view its real-time data
				</p>
				
				<div class="grid grid-cols-1 xl:grid-cols-3 gap-8">
					<!-- Map -->
					<div class="xl:col-span-2">
						<div class="bg-gray-50 rounded-xl overflow-hidden shadow-lg h-full flex flex-col">
							<div class="p-4 bg-white border-b">
								<h3 class="text-lg font-semibold text-gray-800">
									Map View
								</h3>
								<p class="text-sm text-gray-600 mt-1">
									Interactive air quality map
								</p>
							</div>
							<div class="h-96 md:h-[500px]">
								<MapComponent 
									bind:this={mapComponent}
									{stations} 
									{latestReadings} 
									selectedStation={activeStation}
									onStationSelect={selectStation}
								/>
							</div>
						</div>
					</div>
					
					<!-- City Statistics and Station Selection -->
					<div class="space-y-4 h-full flex flex-col">
						<div class="flex items-center justify-between">
							<h3 class="text-lg font-semibold text-gray-800">
								🌆 Monitoring Stations
							</h3>
							<div class="text-xs text-gray-600">
								Click any station to view its data
							</div>
						</div>
						
						<div class="flex-grow overflow-hidden bg-white rounded-xl shadow-lg">
							<div class="h-full overflow-y-auto p-4">
								{#if latestReadings.length === 0}
									<div class="bg-yellow-50 border border-yellow-200 rounded-lg p-4 text-center">
										<p class="text-yellow-800">⚠️ No air quality data available</p>
									</div>
								{:else}
									{#each getStationsByCity() as cityGroup}
										<div class="mb-4">
											<h4 class="text-sm font-medium text-gray-700 mb-2 flex items-center space-x-2">
												<span>{cityGroup.emoji}</span>
												<span>{cityGroup.name}</span>
												<span class="text-xs bg-gray-100 px-2 py-1 rounded">{cityGroup.stations.length}</span>
											</h4>
											<div class="space-y-2">
												{#each cityGroup.stations as stationData}
													<button 
														class="w-full text-left bg-white rounded-lg p-3 shadow-sm border transition-all duration-200 {activeStation?.id === stationData.station.id ? 'border-blue-500 bg-blue-50 ring-2 ring-blue-200' : 'border-gray-200 hover:border-gray-300 hover:shadow-md'}"
														on:click={() => selectStation(stationData.station)}
													>
														<div class="flex items-center justify-between">
															<div class="flex items-center space-x-3">
																<div class="text-xl">{getAQIEmoji(stationData.reading.overall_rating)}</div>
																<div>
																	<div class="font-medium text-gray-800">
																		{stationData.station.name.replace('Station', '').trim()}
																	</div>
																	<div class="text-xs text-gray-600">{stationData.station.id}</div>
																</div>
															</div>
															<div class="text-right">
																<div class="text-lg font-bold" style="color: {getAQIColor(stationData.reading.overall_aqi)}">
																	{Math.round(stationData.reading.overall_aqi)}
																</div>
																<div class="text-xs text-gray-600">AQI</div>
															</div>
														</div>
														<div class="mt-2 text-xs text-gray-600">
															<div class="flex justify-between">
																<span>PM2.5: {stationData.reading.pm2_5.toFixed(1)} μg/m³</span>
																<span>{formatRating(stationData.reading.overall_rating)}</span>
															</div>
														</div>
													</button>
												{/each}
											</div>
										</div>
									{/each}
								{/if}
							</div>
						</div>
					</div>
				</div>
			</div>
		</section>
	</main>

{/if}
