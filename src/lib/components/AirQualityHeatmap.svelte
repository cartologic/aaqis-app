<script lang="ts">
	import { onMount, onDestroy } from 'svelte';
	import type { AirQualityReading, Station } from '$lib/types';
	import { browser } from '$app/environment';

	export let data: AirQualityReading[] = [];
	export let selectedStation: Station | null = null;
	export let title: string = 'Year-to-Date Air Quality';

	let chartContainer: HTMLDivElement;
	let chart: any;

	// Function to get AQI color based on value
	function getAQIColor(aqi: number): string {
		if (aqi <= 50) return '#00e400'; // Good - Green
		if (aqi <= 100) return '#ffff00'; // Moderate - Yellow
		if (aqi <= 150) return '#ff7e00'; // Unhealthy for Sensitive Groups - Orange
		if (aqi <= 200) return '#ff0000'; // Unhealthy - Red
		if (aqi <= 300) return '#8f3f97'; // Very Unhealthy - Purple
		return '#7e0023'; // Hazardous - Maroon
	}

	// Function to get AQI level description
	function getAQILevel(aqi: number): string {
		if (aqi <= 50) return 'Good';
		if (aqi <= 100) return 'Moderate';
		if (aqi <= 150) return 'Unhealthy for Sensitive Groups';
		if (aqi <= 200) return 'Unhealthy';
		if (aqi <= 300) return 'Very Unhealthy';
		return 'Hazardous';
	}

	// Function to prepare heatmap data for ECharts
	function prepareEChartsData() {
		if (!data || data.length === 0) {
			console.log('No data available for heatmap');
			return [];
		}

		// Filter data by selected station if specified
		let filteredData = data;
		if (selectedStation) {
			filteredData = data.filter(reading => reading.station_id === selectedStation.id);
			console.log(`Filtered to ${filteredData.length} readings for station ${selectedStation.name}`);
		} else {
			console.log(`Processing ${data.length} readings for all stations`);
		}

		if (filteredData.length === 0) {
			console.log('No data available after filtering');
			return [];
		}

		// Group data by date and calculate daily averages
		const dailyData: Record<string, { total: number; count: number; values: number[] }> = {};

		filteredData.forEach(reading => {
			const date = new Date(reading.datetime);
			const dateKey = date.toISOString().split('T')[0]; // YYYY-MM-DD format
			const aqiValue = reading.overall_aqi;

			if (!dailyData[dateKey]) {
				dailyData[dateKey] = { total: 0, count: 0, values: [] };
			}

			dailyData[dateKey].total += aqiValue;
			dailyData[dateKey].count += 1;
			dailyData[dateKey].values.push(aqiValue);
		});

		// Convert to ECharts format: [date, value]
		const heatmapData: Array<[string, number]> = [];

		Object.entries(dailyData).forEach(([dateStr, data]) => {
			const averageAqi = Math.round(data.total / data.count);
			heatmapData.push([dateStr, averageAqi]);
		});

		console.log(`Prepared ${heatmapData.length} data points for ECharts heatmap`);
		return heatmapData;
	}

	// Function to create ECharts heatmap
	async function createChart() {
		if (!chartContainer || !browser) return;

		try {
			// Import ECharts only in browser environment
			const { init } = await import('echarts');

			const heatmapData = prepareEChartsData();

			// Destroy existing chart if it exists
			if (chart) {
				chart.dispose();
				chart = null;
			}

			// Determine the year from the data
			let dataYear = new Date().getFullYear();
			if (data.length > 0) {
				const availableYears = data.map((r: AirQualityReading) => new Date(r.datetime).getFullYear());
				dataYear = availableYears.length > 0 ? Math.max(...availableYears) : dataYear;
			}

			// Initialize chart
			chart = init(chartContainer);

			const option = {
				title: {
					top: 10,
					left: 'center',
					text: selectedStation ? `${selectedStation.name} - ${dataYear}` : `All Stations - ${dataYear}`,
					textStyle: {
						fontSize: 16,
						fontWeight: 600,
						color: '#1f2937'
					}
				},
				tooltip: {
					formatter: function(params: any) {
						const date = new Date(params.data[0]).toLocaleDateString('en-US', {
							weekday: 'long',
							year: 'numeric',
							month: 'long',
							day: 'numeric'
						});
						const aqi = params.data[1];
						const level = getAQILevel(aqi);
						const color = getAQIColor(aqi);
						
						return `
							<div style="padding: 8px;">
								<div style="font-weight: 600; margin-bottom: 4px;">${date}</div>
								<div style="display: flex; align-items: center; gap: 6px;">
									<span style="display: inline-block; width: 10px; height: 10px; border-radius: 50%; background-color: ${color};"></span>
									<span>AQI: <strong>${aqi}</strong></span>
								</div>
								<div style="margin-top: 2px; color: #6b7280; font-size: 12px;">${level}</div>
							</div>
						`;
					},
					backgroundColor: 'rgba(255, 255, 255, 0.95)',
					borderColor: '#e5e7eb',
					borderWidth: 1,
					borderRadius: 8,
					textStyle: {
						color: '#1f2937',
						fontSize: 13
					}
				},
				visualMap: {
					min: 0,
					max: 300,
					type: 'piecewise',
					orient: 'horizontal',
					left: 'center',
					top: 55,
					pieces: [
						{ min: 0, max: 50, color: '#00e400', label: 'Good (0-50)' },
						{ min: 51, max: 100, color: '#ffff00', label: 'Moderate (51-100)' },
						{ min: 101, max: 150, color: '#ff7e00', label: 'Unhealthy for Sensitive (101-150)' },
						{ min: 151, max: 200, color: '#ff0000', label: 'Unhealthy (151-200)' },
						{ min: 201, max: 300, color: '#8f3f97', label: 'Very Unhealthy (201-300)' },
						{ min: 301, color: '#7e0023', label: 'Hazardous (300+)' }
					],
					textStyle: {
						fontSize: 11,
						color: '#374151'
					}
				},
				calendar: {
					top: 120,
					left: 30,
					right: 30,
					cellSize: ['auto', 15],
					range: dataYear.toString(),
					itemStyle: {
						borderWidth: 1,
						borderColor: '#e5e7eb',
						borderRadius: 2
					},
					yearLabel: { 
						show: false 
					},
					monthLabel: {
						fontSize: 12,
						color: '#374151',
						fontWeight: 600
					},
					dayLabel: {
						fontSize: 11,
						color: '#6b7280'
					},
					splitLine: {
						show: true,
						lineStyle: {
							color: '#e5e7eb',
							width: 1
						}
					}
				},
				series: {
					type: 'heatmap',
					coordinateSystem: 'calendar',
					data: heatmapData,
					itemStyle: {
						borderRadius: 2,
						borderWidth: 1,
						borderColor: '#ffffff'
					},
					emphasis: {
						itemStyle: {
							borderWidth: 2,
							borderColor: '#1f2937'
						}
					}
				}
			};

			chart.setOption(option);

			// Handle resize
			const resizeChart = () => {
				if (chart) {
					chart.resize();
				}
			};

			window.addEventListener('resize', resizeChart);

			// Store resize handler for cleanup
			(chart as any)._resizeHandler = resizeChart;

		} catch (error) {
			console.error('Error creating ECharts heatmap:', error);
		}
	}

	// Reactive statement to update chart when data or selectedStation changes
	$: if (data && chartContainer && browser) {
		createChart();
	}

	onMount(() => {
		if (browser) {
			createChart();
		}
	});

	onDestroy(() => {
		if (chart) {
			// Remove resize listener
			if ((chart as any)._resizeHandler) {
				window.removeEventListener('resize', (chart as any)._resizeHandler);
			}
			chart.dispose();
			chart = null;
		}
	});
</script>

<div class="w-full">
	<div class="mb-6">
		<div class="flex flex-col sm:flex-row sm:items-center sm:justify-between mb-4">
			<div>
				<h3 class="text-xl font-bold text-gray-800 mb-2">{title}</h3>
				<p class="text-sm text-gray-600">
					{#if selectedStation}
						Daily average AQI values for {selectedStation.name}. Hover over squares for details.
					{:else}
						Daily average AQI values for all stations. Hover over squares for details.
					{/if}
				</p>
			</div>
			{#if selectedStation}
				<div class="mt-3 sm:mt-0">
					<div class="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
						📍 {selectedStation.name}
					</div>
				</div>
			{/if}
		</div>
	</div>
	
	{#if data && data.length > 0}
		<div class="bg-gradient-to-br from-white to-gray-50 p-8 rounded-2xl shadow-2xl border border-gray-200 relative overflow-hidden">
			<!-- Decorative background elements -->
			<div class="absolute top-0 right-0 w-64 h-64 bg-gradient-to-br from-blue-100/20 to-green-100/20 rounded-full blur-3xl"></div>
			<div class="absolute bottom-0 left-0 w-48 h-48 bg-gradient-to-tr from-yellow-100/20 to-orange-100/20 rounded-full blur-3xl"></div>
			
			<div class="w-full relative z-10">
				<div bind:this={chartContainer} class="w-full h-96"></div>
			</div>
		</div>
	{:else}
		<div class="flex items-center justify-center h-40 bg-gradient-to-br from-gray-50 to-gray-100 rounded-xl border-2 border-dashed border-gray-300">
			<div class="text-center text-gray-500">
				<div class="text-5xl mb-3">📅</div>
				<p class="text-lg font-semibold mb-1">No data available</p>
				<p class="text-sm">
					{#if selectedStation}
						No data found for {selectedStation.name}
					{:else}
						Year-to-date heatmap will appear when data is loaded
					{/if}
				</p>
			</div>
		</div>
	{/if}
</div>