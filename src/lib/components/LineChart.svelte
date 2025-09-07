<script lang="ts">
	import { onMount, onDestroy } from 'svelte';
	import type { AirQualityReading } from '$lib/types';

	export let data: AirQualityReading[] = [];
	export let title: string = 'Air Quality Trend';
	export let height: number = 300;

	let canvas: HTMLCanvasElement;
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

	// Function to prepare chart data
	function prepareChartData() {
		if (!data || data.length === 0) return null;

		// Sort data by datetime
		const sortedData = [...data].sort((a, b) => 
			new Date(a.datetime).getTime() - new Date(b.datetime).getTime()
		);

		const labels = sortedData.map(reading => {
			const date = new Date(reading.datetime);
			return date.toLocaleDateString() + ' ' + date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
		});

		const aqiValues = sortedData.map(reading => reading.overall_aqi);
		const pm25Values = sortedData.map(reading => reading.pm2_5);
		const pm10Values = sortedData.map(reading => reading.pm10);

		return {
			labels,
			datasets: [
				{
					label: 'AQI',
					data: aqiValues,
					borderColor: '#3b82f6',
					backgroundColor: 'rgba(59, 130, 246, 0.1)',
					tension: 0.4,
					fill: true,
					yAxisID: 'y'
				},
				{
					label: 'PM2.5 (μg/m³)',
					data: pm25Values,
					borderColor: '#ef4444',
					backgroundColor: 'rgba(239, 68, 68, 0.1)',
					tension: 0.4,
					fill: false,
					yAxisID: 'y1'
				},
				{
					label: 'PM10 (μg/m³)',
					data: pm10Values,
					borderColor: '#f59e0b',
					backgroundColor: 'rgba(245, 158, 11, 0.1)',
					tension: 0.4,
					fill: false,
					yAxisID: 'y1'
				}
			]
		};
	}

	// Function to create or update chart
	async function createChart() {
		if (!canvas) return;

		// Dynamically import Chart.js to avoid SSR issues
		const { Chart, registerables } = await import('chart.js');
		Chart.register(...registerables);

		const chartData = prepareChartData();
		if (!chartData) return;

		// Destroy existing chart if it exists
		if (chart) {
			chart.destroy();
		}

		chart = new Chart(canvas, {
			type: 'line',
			data: chartData,
			options: {
				responsive: true,
				maintainAspectRatio: false,
				plugins: {
					title: {
						display: true,
						text: title,
						font: {
							size: 16,
							weight: 'bold'
						}
					},
					legend: {
						position: 'top'
					},
					tooltip: {
						mode: 'index',
						intersect: false,
						callbacks: {
							label: function(context: any) {
								const label = context.dataset.label || '';
								const value = context.parsed.y;
								if (label === 'AQI') {
									const aqiLevel = value <= 50 ? 'Good' : 
										value <= 100 ? 'Moderate' : 
										value <= 150 ? 'Unhealthy for Sensitive Groups' : 
										value <= 200 ? 'Unhealthy' : 
										value <= 300 ? 'Very Unhealthy' : 'Hazardous';
									return `${label}: ${value} (${aqiLevel})`;
								}
								return `${label}: ${value}`;
							}
						}
					}
				},
				scales: {
					x: {
						display: true,
						title: {
							display: true,
							text: 'Time'
						},
						ticks: {
							maxTicksLimit: 10,
							maxRotation: 45
						}
					},
					y: {
						type: 'linear',
						display: true,
						position: 'left',
						title: {
							display: true,
							text: 'AQI'
						},
						min: 0
					},
					y1: {
						type: 'linear',
						display: true,
						position: 'right',
						title: {
							display: true,
							text: 'PM (μg/m³)'
						},
						min: 0,
						grid: {
							drawOnChartArea: false
						}
					}
				},
				interaction: {
					mode: 'index',
					intersect: false
				}
			}
		});
	}

	// Reactive statement to update chart when data changes
	$: if (data && canvas) {
		createChart();
	}

	onMount(() => {
		createChart();
	});

	onDestroy(() => {
		if (chart) {
			chart.destroy();
		}
	});
</script>

<div class="w-full" style="height: {height}px;">
	{#if data && data.length > 0}
		<canvas bind:this={canvas} class="w-full h-full"></canvas>
	{:else}
		<div class="flex items-center justify-center h-full bg-gray-50 rounded-lg border-2 border-dashed border-gray-300">
			<div class="text-center text-gray-500">
				<div class="text-4xl mb-2">📊</div>
				<p class="text-lg font-medium">No data available</p>
				<p class="text-sm">Select a date range to view the trend</p>
			</div>
		</div>
	{/if}
</div>