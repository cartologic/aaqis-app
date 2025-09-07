<script lang="ts">
	import { createEventDispatcher } from 'svelte';
	import type { Station, AirQualityReading } from '$lib/types';
	import { CITY_INFO } from '$lib/types';
	import { getAQIEmoji } from '$lib/dataUtils';
	
	export let stations: Station[] = [];
	export let latestReadings: AirQualityReading[] = [];
	export let selectedCity: string = '';
	export let selectedStation: Station | null = null;
	export let selectedDateRange: string = 'now';
	export let startDate: string = '';
	export let endDate: string = '';
	export let filterMetadata = {
		availableCities: [] as string[],
		availableStations: [] as string[],
		dateRange: { min: new Date(), max: new Date() },
		totalRecords: 0,
		filtersApplied: [] as string[]
	};
	
	const dispatch = createEventDispatcher();
	
	let showCityDropdown = false;
	let showStationDropdown = false;
	let showDateDropdown = false;
	
	// Always show all cities from the original stations data (no cross-filtering)
	$: cities = [...new Set(stations.map(s => s.city))].map(city => {
		const stationCount = stations.filter(s => s.city === city).length;
		const availableStationCount = filterMetadata.availableStations.length > 0 
			? stations.filter(s => s.city === city && filterMetadata.availableStations.includes(s.id)).length 
			: stationCount;
		
		return {
			id: city,
			name: CITY_INFO[city]?.displayName || city.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase()),
			emoji: CITY_INFO[city]?.emoji || '🌍',
			stationCount,
			availableStationCount,
			isAvailable: true, // Always show all cities
			hasData: availableStationCount > 0
		};
	}).sort((a, b) => a.name.localeCompare(b.name));
	
	// Filter stations by selected city
	$: filteredStations = (selectedCity ? stations.filter(s => s.city === selectedCity) : stations)
		.map(station => {
			const isAvailable = filterMetadata.availableStations.length === 0 || filterMetadata.availableStations.includes(station.id);
			return {
				...station,
				isAvailable,
				isFiltered: filterMetadata.filtersApplied.length > 0 && !filterMetadata.filtersApplied.includes('station')
			};
		})
		.sort((a, b) => {
			// Sort available stations first, then by name
			if (a.isAvailable !== b.isAvailable) {
				return a.isAvailable ? -1 : 1;
			}
			return a.name.localeCompare(b.name);
		});
	
	// Date range options
	const dateRangeOptions = [
		{ id: 'now', label: '📊 Real-time (Current)', description: 'Latest available data' },
		{ id: 'today', label: '📅 Today', description: 'Data from today' },
		{ id: 'week', label: '📈 Past Week', description: 'Last 7 days' },
		{ id: 'month', label: '📉 Past Month', description: 'Last 30 days' },
		{ id: 'custom', label: '🗓️ Custom Range', description: 'Select specific dates' }
	];
	
	function selectCity(cityId: string) {
		selectedCity = cityId;
		
		// Clear station selection when city changes
		selectedStation = null;
		dispatch('stationSelect', null);
		
		showCityDropdown = false;
		dispatch('cityChange', cityId);
	}
	
	function selectStation(station: Station) {
		selectedStation = station;
		selectedCity = station.city;
		showStationDropdown = false;
		dispatch('stationSelect', station);
	}
	
	function selectDateRange(range: string) {
		selectedDateRange = range;
		showDateDropdown = false;
		dispatch('dateRangeChange', range);
	}
	
	function getStationReading(station: Station) {
		return latestReadings.find(r => r.station_id === station.id);
	}
	
	function getAQIColor(aqi: number): string {
		if (aqi <= 50) return '#22c55e';
		if (aqi <= 100) return '#eab308';
		if (aqi <= 150) return '#f97316';
		if (aqi <= 200) return '#ef4444';
		if (aqi <= 300) return '#a855f7';
		return '#7f1d1d';
	}
	

	
	// Close dropdowns when clicking outside
	function handleClickOutside(event: MouseEvent) {
		const target = event.target as HTMLElement;
		if (!target.closest('.dropdown-container')) {
			showCityDropdown = false;
			showStationDropdown = false;
			showDateDropdown = false;
		}
	}
</script>

<svelte:window on:click={handleClickOutside} />

<div class="bg-white border-b border-gray-200 shadow-sm sticky top-0 z-50">
	<div class="container mx-auto px-3 py-2 sm:px-4 sm:py-4">
		<!-- Smart Filter Status Bar -->
		{#if filterMetadata.filtersApplied.length > 0}
			<div class="mb-2 sm:mb-3 px-2 sm:px-3 py-2 bg-blue-50 border border-blue-200 rounded-lg">
				<div class="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2 text-xs sm:text-sm">
					<div class="flex items-center space-x-2">
						<span class="text-blue-600 font-medium hidden sm:inline">🔍 Active Filters:</span>
						<span class="text-blue-600 font-medium sm:hidden">Filters:</span>
						<div class="flex space-x-1">
							{#each filterMetadata.filtersApplied as filter}
								<span class="px-1 sm:px-2 py-1 bg-blue-100 text-blue-700 rounded-full text-xs font-medium">
									{filter === 'date' ? '📅' : '📍'}
									<span class="hidden sm:inline">{filter === 'date' ? ' Date' : ' Station'}</span>
								</span>
							{/each}
						</div>
					</div>
					<div class="flex items-center justify-between sm:justify-start space-x-2 sm:space-x-3">
						<div class="text-blue-600 font-medium text-xs sm:text-sm">
							<span class="hidden sm:inline">📊 </span>{filterMetadata.totalRecords.toLocaleString()} records
						</div>
						<button
							class="text-xs bg-blue-100 hover:bg-blue-200 text-blue-700 px-2 py-1 rounded transition-colors"
							on:click={() => dispatch('clearAllFilters')}
						>
							Clear
						</button>
					</div>
				</div>
			</div>
		{/if}
		
		<div class="flex flex-row items-center gap-1 sm:gap-4">
			
			<!-- City Selection -->
			<div class="dropdown-container relative">
				<button 
					class="flex-1 sm:w-auto flex items-center justify-between px-2 sm:px-4 py-2 bg-gray-50 hover:bg-gray-100 border border-gray-300 rounded-lg transition-colors duration-200 sm:min-w-[200px] text-xs sm:text-sm"
					on:click={() => showCityDropdown = !showCityDropdown}
				>
					<div class="flex items-center space-x-2">
						<span class="text-sm sm:text-lg">
							{selectedCity ? cities.find(c => c.id === selectedCity)?.emoji || '🌍' : '🌍'}
						</span>
						<div class="text-left min-w-0 flex-1">
							<div class="font-medium text-gray-900 truncate">
								{selectedCity ? cities.find(c => c.id === selectedCity)?.name || 'All Cities' : 'All Cities'}
							</div>
							<div class="text-xs text-gray-500 hidden sm:block">
								{cities.length} cities, {stations.length} stations
							</div>
						</div>
					</div>
					<svg class="w-4 h-4 text-gray-500 transition-transform duration-200 {showCityDropdown ? 'rotate-180' : ''}" fill="none" stroke="currentColor" viewBox="0 0 24 24">
						<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 9l-7 7-7-7"></path>
					</svg>
				</button>
				
				{#if showCityDropdown}
					<div class="absolute top-full left-0 mt-1 w-full lg:w-80 bg-white border border-gray-200 rounded-lg shadow-lg z-50 max-h-96 overflow-y-auto">
						<div class="p-2">
							{#each cities as city}
								<button 
									class="w-full text-left px-3 py-2 rounded-md transition-colors duration-150 {selectedCity === city.id ? 'bg-blue-50 text-blue-700' : 'hover:bg-gray-50'}"
									on:click={() => selectCity(city.id)}
								>
									<div class="flex items-center justify-between">
										<div class="flex items-center space-x-3">
											<span class="text-xl">{city.emoji}</span>
											<div>
												<div class="font-medium flex items-center space-x-2">
													<span>{city.name}</span>
													{#if !city.hasData}
														<span class="text-xs bg-gray-200 text-gray-600 px-1 rounded">No data</span>
													{/if}
												</div>
												<div class="text-xs text-gray-500">
													{city.stationCount} {city.stationCount === 1 ? 'station' : 'stations'}
												</div>
											</div>
										</div>
									</div>
								</button>
							{/each}
						</div>
					</div>
				{/if}
			</div>
			
			<!-- Station Selection -->
			<div class="dropdown-container relative">
				<button 
					class="flex-1 sm:w-auto flex items-center justify-between px-2 sm:px-4 py-2 bg-gray-50 hover:bg-gray-100 border border-gray-300 rounded-lg transition-colors duration-200 sm:min-w-[250px] text-xs sm:text-sm"
					on:click={() => showStationDropdown = !showStationDropdown}
				>
					<div class="flex items-center space-x-2">
						{#if selectedStation}
							{@const reading = getStationReading(selectedStation)}
							<span class="text-sm sm:text-lg">
								{reading ? getAQIEmoji(reading.overall_rating) : '📍'}
							</span>
							<div class="text-left min-w-0 flex-1">
								<div class="font-medium text-gray-900 truncate">
									{selectedStation.name.replace('Station', '').trim()}
								</div>
								<div class="text-xs text-gray-500 hidden sm:block">
									{selectedStation.id} • {CITY_INFO[selectedStation.city]?.displayName}
								</div>
							</div>
						{:else}
							<span class="text-sm sm:text-lg">📍</span>
							<div class="text-left min-w-0 flex-1">
								<div class="font-medium text-gray-900">Select Station</div>
								<div class="text-xs text-gray-500 hidden sm:block">Choose monitoring station</div>
							</div>
						{/if}
					</div>
					<svg class="w-4 h-4 text-gray-500 transition-transform duration-200 {showStationDropdown ? 'rotate-180' : ''}" fill="none" stroke="currentColor" viewBox="0 0 24 24">
						<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 9l-7 7-7-7"></path>
					</svg>
				</button>
				
				{#if showStationDropdown}
					<div class="absolute top-full left-0 mt-1 w-full lg:w-96 bg-white border border-gray-200 rounded-lg shadow-lg z-50 max-h-96 overflow-y-auto">
						<div class="p-2">
							{#each filteredStations as station}
								{@const reading = getStationReading(station)}
								<button 
									class="w-full text-left px-3 py-2 rounded-md transition-colors duration-150 {selectedStation?.id === station.id ? 'bg-blue-50 text-blue-700' : station.isAvailable ? 'hover:bg-gray-50' : 'opacity-50 cursor-not-allowed bg-gray-25'}"
									on:click={() => station.isAvailable && selectStation(station)}
									disabled={!station.isAvailable}
								>
									<div class="flex items-center justify-between">
										<div class="flex items-center space-x-3">
											<span class="text-xl">
												{reading ? getAQIEmoji(reading.overall_rating) : '📍'}
											</span>
											<div>
												<div class="font-medium flex items-center space-x-2">
													<span>{station.name.replace('Station', '').trim()}</span>
													{#if !station.isAvailable}
														<span class="text-xs bg-gray-200 text-gray-600 px-1 rounded">No data</span>
													{:else if station.isFiltered}
														<span class="text-xs bg-blue-100 text-blue-600 px-1 rounded">Filtered</span>
													{/if}
												</div>
												<div class="text-xs text-gray-500">
													{station.id} • {CITY_INFO[station.city]?.displayName}
												</div>
											</div>
										</div>
										{#if reading}
											<div class="text-right">
												<div class="text-sm font-bold" style="color: {getAQIColor(reading.overall_aqi)}">
													{Math.round(reading.overall_aqi)}
												</div>
												<div class="text-xs text-gray-500">AQI</div>
											</div>
										{/if}
									</div>
								</button>
							{/each}
						</div>
					</div>
				{/if}
			</div>
			
			<!-- Date Range Selection -->
			<div class="dropdown-container relative">
				<button 
					class="flex-1 sm:w-auto flex items-center justify-between px-2 sm:px-4 py-2 bg-gray-50 hover:bg-gray-100 border border-gray-300 rounded-lg transition-colors duration-200 sm:min-w-[200px] text-xs sm:text-sm"
					on:click={() => showDateDropdown = !showDateDropdown}
				>
					<div class="flex items-center space-x-2">
						<span class="text-sm sm:text-lg">
							{dateRangeOptions.find(d => d.id === selectedDateRange)?.label.split(' ')[0] || '📊'}
						</span>
						<div class="text-left min-w-0 flex-1">
							<div class="font-medium text-gray-900 truncate">
								{#if selectedDateRange === 'now'}
									Real-time
								{:else if selectedDateRange === 'today'}
									Today
								{:else if selectedDateRange === 'week'}
									Past Week
								{:else if selectedDateRange === 'month'}
									Past Month
								{:else}
									Custom
								{/if}
							</div>
							<div class="text-xs text-gray-500 hidden sm:block">
								{dateRangeOptions.find(d => d.id === selectedDateRange)?.description || 'Choose time period'}
							</div>
						</div>
					</div>
					<svg class="w-4 h-4 text-gray-500 transition-transform duration-200 {showDateDropdown ? 'rotate-180' : ''}" fill="none" stroke="currentColor" viewBox="0 0 24 24">
						<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 9l-7 7-7-7"></path>
					</svg>
				</button>
				
				{#if showDateDropdown}
					<div class="absolute top-full left-0 mt-1 w-full lg:w-80 bg-white border border-gray-200 rounded-lg shadow-lg z-50">
						<div class="p-2">
							{#each dateRangeOptions as option}
								<button 
									class="w-full text-left px-3 py-2 hover:bg-gray-50 rounded-md transition-colors duration-150 {selectedDateRange === option.id ? 'bg-blue-50 text-blue-700' : ''}"
									on:click={() => selectDateRange(option.id)}
								>
									<div class="flex items-center space-x-3">
										<span class="text-lg">{option.label.split(' ')[0]}</span>
										<div>
											<div class="font-medium">{option.label.split(' ').slice(1).join(' ')}</div>
											<div class="text-xs text-gray-500">{option.description}</div>
										</div>
									</div>
								</button>
							{/each}
						</div>
						
						{#if selectedDateRange === 'custom'}
							<div class="border-t border-gray-200 p-3">
								<div class="space-y-3">
									<div>
								<label for="start-date-input" class="block text-xs font-medium text-gray-700 mb-1">Start Date</label>
								<input 
									id="start-date-input"
									type="date" 
									bind:value={startDate}
									min={filterMetadata?.dateRange?.min ? new Date(filterMetadata.dateRange.min).toISOString().split('T')[0] : ''}
										max={filterMetadata?.dateRange?.max ? new Date(filterMetadata.dateRange.max).toISOString().split('T')[0] : ''}
									class="w-full px-3 py-2 border border-gray-300 rounded-md text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
									on:change={() => dispatch('customDateChange', { startDate, endDate })}
								/>
								{#if filterMetadata?.dateRange}
									<div class="text-xs text-gray-500 mt-1">
										Available: {filterMetadata.dateRange.min} to {filterMetadata.dateRange.max}
									</div>
								{/if}
							</div>
							<div>
								<label for="end-date-input" class="block text-xs font-medium text-gray-700 mb-1">End Date</label>
								<input 
									id="end-date-input"
									type="date" 
									bind:value={endDate}
									min={filterMetadata?.dateRange?.min ? new Date(filterMetadata.dateRange.min).toISOString().split('T')[0] : ''}
										max={filterMetadata?.dateRange?.max ? new Date(filterMetadata.dateRange.max).toISOString().split('T')[0] : ''}
									class="w-full px-3 py-2 border border-gray-300 rounded-md text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
									on:change={() => dispatch('customDateChange', { startDate, endDate })}
								/>
							</div>
								</div>
							</div>
						{/if}
					</div>
				{/if}
			</div>
			
			<!-- Clear Filters Button -->
			{#if selectedCity || selectedStation || selectedDateRange !== 'now'}
				<button 
					class="px-4 py-2 text-gray-600 hover:text-gray-800 hover:bg-gray-100 rounded-lg transition-colors duration-200 flex items-center space-x-2"
					on:click={() => {
						selectedCity = '';
						selectedStation = null;
						selectedDateRange = 'now';
						dispatch('clearFilters');
					}}
				>
					<svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
						<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12"></path>
					</svg>
					<span class="text-sm">Clear</span>
				</button>
			{/if}
		</div>
	</div>
</div>

<style>
	.dropdown-container {
		position: relative;
	}
	
	/* Mobile responsive styles */
	@media (max-width: 768px) {
		.dropdown-container button {
			padding: 0.5rem 0.75rem;
			font-size: 0.875rem;
			min-width: auto;
		}
		
		.dropdown-container {
			width: 100%;
		}
		
		.dropdown-container .absolute {
			max-height: 250px;
		}
	}
	
	@media (max-width: 480px) {
		.dropdown-container button {
			padding: 0.375rem 0.5rem;
			font-size: 0.8rem;
		}
		
		.dropdown-container .absolute {
			max-height: 200px;
		}
	}
</style>