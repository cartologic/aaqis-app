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

		// Prepare all pollutant data
		const datasets = [
			// AQI Values
			{
				label: 'Overall AQI',
				data: sortedData.map(reading => reading.overall_aqi),
				borderColor: '#3b82f6',
				backgroundColor: 'rgba(59, 130, 246, 0.1)',
				tension: 0.4,
				fill: true,
				yAxisID: 'y'
			},
			{
				label: 'PM2.5 AQI',
				data: sortedData.map(reading => reading.pm2_5_aqi),
				borderColor: '#ef4444',
				backgroundColor: 'rgba(239, 68, 68, 0.1)',
				tension: 0.4,
				fill: false,
				yAxisID: 'y'
			},
			{
				label: 'PM10 AQI',
				data: sortedData.map(reading => reading.pm10_aqi),
				borderColor: '#f59e0b',
				backgroundColor: 'rgba(245, 158, 11, 0.1)',
				tension: 0.4,
				fill: false,
				yAxisID: 'y'
			},
			{
				label: 'O₃ AQI',
				data: sortedData.map(reading => reading.o3_aqi),
				borderColor: '#10b981',
				backgroundColor: 'rgba(16, 185, 129, 0.1)',
				tension: 0.4,
				fill: false,
				yAxisID: 'y'
			},
			{
				label: 'NO₂ AQI',
				data: sortedData.map(reading => reading.no2_aqi),
				borderColor: '#8b5cf6',
				backgroundColor: 'rgba(139, 92, 246, 0.1)',
				tension: 0.4,
				fill: false,
				yAxisID: 'y'
			},
			{
				label: 'SO₂ AQI',
				data: sortedData.map(reading => reading.so2_aqi),
				borderColor: '#f97316',
				backgroundColor: 'rgba(249, 115, 22, 0.1)',
				tension: 0.4,
				fill: false,
				yAxisID: 'y'
			},
			{
				label: 'CO AQI',
				data: sortedData.map(reading => reading.co_aqi),
				borderColor: '#06b6d4',
				backgroundColor: 'rgba(6, 182, 212, 0.1)',
				tension: 0.4,
				fill: false,
				yAxisID: 'y'
			},
			// Raw Values
			{
				label: 'PM2.5 (μg/m³)',
				data: sortedData.map(reading => reading.pm2_5),
				borderColor: '#dc2626',
				backgroundColor: 'rgba(220, 38, 38, 0.1)',
				tension: 0.4,
				fill: false,
				yAxisID: 'y1',
				hidden: true // Start hidden to avoid clutter
			},
			{
				label: 'PM10 (μg/m³)',
				data: sortedData.map(reading => reading.pm10),
				borderColor: '#ea580c',
				backgroundColor: 'rgba(234, 88, 12, 0.1)',
				tension: 0.4,
				fill: false,
				yAxisID: 'y1',
				hidden: true
			},
			{
				label: 'O₃ (μg/m³)',
				data: sortedData.map(reading => reading.o3),
				borderColor: '#16a34a',
				backgroundColor: 'rgba(22, 163, 74, 0.1)',
				tension: 0.4,
				fill: false,
				yAxisID: 'y1',
				hidden: true
			},
			{
				label: 'NO₂ (μg/m³)',
				data: sortedData.map(reading => reading.no2),
				borderColor: '#7c3aed',
				backgroundColor: 'rgba(124, 58, 237, 0.1)',
				tension: 0.4,
				fill: false,
				yAxisID: 'y1',
				hidden: true
			},
			{
				label: 'SO₂ (μg/m³)',
				data: sortedData.map(reading => reading.so2),
				borderColor: '#c2410c',
				backgroundColor: 'rgba(194, 65, 12, 0.1)',
				tension: 0.4,
				fill: false,
				yAxisID: 'y1',
				hidden: true
			},
			{
				label: 'CO (mg/m³)',
				data: sortedData.map(reading => reading.co),
				borderColor: '#0891b2',
				backgroundColor: 'rgba(8, 145, 178, 0.1)',
				tension: 0.4,
				fill: false,
				yAxisID: 'y2', // Use separate scale for CO
				hidden: true
			}
		];

		return {
			labels,
			datasets
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
								
								// For AQI values, show air quality level
								if (label.includes('AQI')) {
									const aqiLevel = value <= 50 ? 'Good' : 
										value <= 100 ? 'Moderate' : 
										value <= 150 ? 'Unhealthy for Sensitive Groups' : 
										value <= 200 ? 'Unhealthy' : 
										value <= 300 ? 'Very Unhealthy' : 'Hazardous';
									return `${label}: ${Math.round(value)} (${aqiLevel})`;
								}
								
								// For concentration values, show with proper decimal places
								if (label.includes('μg/m³') || label.includes('mg/m³')) {
									return `${label}: ${value.toFixed(1)}`;
								}
								
								return `${label}: ${Math.round(value)}`;
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
							text: 'AQI Values'
						},
						min: 0,
						max: 300
					},
					y1: {
						type: 'linear',
						display: true,
						position: 'right',
						title: {
							display: true,
							text: 'Concentration (μg/m³)'
						},
						min: 0,
						grid: {
							drawOnChartArea: false
						}
					},
					y2: {
						type: 'linear',
						display: false, // Hidden by default, shows when CO is visible
						position: 'right',
						title: {
							display: true,
							text: 'CO (mg/m³)'
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