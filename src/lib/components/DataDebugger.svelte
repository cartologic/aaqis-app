<script lang="ts">
	import type { AirQualityReading } from '$lib/types';

	export let allData: AirQualityReading[] = [];
	export let filteredData: AirQualityReading[] = [];

	// Calculate data statistics
	$: dataStats = {
		totalRecords: allData.length,
		filteredRecords: filteredData.length,
		availableYears: allData.length > 0 ? [...new Set(allData.map(r => new Date(r.datetime).getFullYear()))].sort() : [],
		dateRange:
			allData.length > 0
				? {
						first: new Date(Math.min(...allData.map(r => new Date(r.datetime).getTime()))).toISOString().split('T')[0],
						last: new Date(Math.max(...allData.map(r => new Date(r.datetime).getTime()))).toISOString().split('T')[0]
					}
				: null,
		cities: allData.length > 0 ? [...new Set(allData.map(r => r.city))].sort() : [],
		stations: allData.length > 0 ? [...new Set(allData.map(r => r.station_id))].length : 0
	};

	// Sample data for inspection
	$: sampleData = allData.slice(0, 3);
</script>

<div class="bg-yellow-50 border border-yellow-200 rounded-lg p-4 mb-4">
	<h3 class="text-lg font-semibold text-yellow-800 mb-3">🐛 Data Debug Information</h3>

	<div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 text-sm">
		<div class="bg-white p-3 rounded border">
			<h4 class="font-medium text-gray-800 mb-2">Data Overview</h4>
			<div class="space-y-1 text-gray-600">
				<div>Total Records: <span class="font-mono">{dataStats.totalRecords}</span></div>
				<div>Filtered Records: <span class="font-mono">{dataStats.filteredRecords}</span></div>
				<div>Stations: <span class="font-mono">{dataStats.stations}</span></div>
			</div>
		</div>

		<div class="bg-white p-3 rounded border">
			<h4 class="font-medium text-gray-800 mb-2">Date Range</h4>
			<div class="space-y-1 text-gray-600">
				{#if dataStats.dateRange}
					<div>First: <span class="font-mono">{dataStats.dateRange.first}</span></div>
					<div>Last: <span class="font-mono">{dataStats.dateRange.last}</span></div>
				{:else}
					<div class="text-red-600">No date data available</div>
				{/if}
			</div>
		</div>

		<div class="bg-white p-3 rounded border">
			<h4 class="font-medium text-gray-800 mb-2">Available Years</h4>
			<div class="text-gray-600">
				{#if dataStats.availableYears.length > 0}
					<span class="font-mono">{dataStats.availableYears.join(', ')}</span>
				{:else}
					<span class="text-red-600">No years found</span>
				{/if}
			</div>
		</div>
	</div>

	<div class="mt-4">
		<h4 class="font-medium text-gray-800 mb-2">Cities</h4>
		<div class="text-sm text-gray-600">
			{#if dataStats.cities.length > 0}
				<span class="font-mono">{dataStats.cities.join(', ')}</span>
			{:else}
				<span class="text-red-600">No cities found</span>
			{/if}
		</div>
	</div>

	{#if sampleData.length > 0}
		<div class="mt-4">
			<h4 class="font-medium text-gray-800 mb-2">Sample Data (First 3 Records)</h4>
			<div class="bg-gray-50 p-2 rounded text-xs font-mono overflow-x-auto">
				<pre>{JSON.stringify(sampleData, null, 2)}</pre>
			</div>
		</div>
	{/if}
</div>
