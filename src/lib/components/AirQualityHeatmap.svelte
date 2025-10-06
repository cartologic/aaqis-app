<script lang="ts">
	import { onMount, onDestroy } from 'svelte';
	import type { AirQualityReading, Station } from '$lib/types';
	import { browser } from '$app/environment';
	import { dev } from '$app/environment';

	export let data: AirQualityReading[] = [];
	export let selectedStation: Station | null = null;
	export let title: string = 'Year-to-Date Air Quality';
	export let selectedYear: number = new Date().getFullYear();
	export let selectedPollutant: string = 'overall_aqi';
	export let stationName: string = '';
	export let availableYears: number[] = [];
	export let onyearChange: ((year: number) => void) | undefined = undefined;
	export let onpollutantChange: ((pollutant: string) => void) | undefined = undefined;

	let chartContainer: HTMLDivElement;
	let chart: any;
	let showTooltip = false;

	// Calculate available years from data only if not provided by parent
	$: {
		if (data && data.length > 0) {
			// Only calculate from data if availableYears prop is empty
			if (availableYears.length === 0) {
				const years = [...new Set(data.map(r => new Date(r.datetime).getFullYear()))].sort((a, b) => b - a);
				availableYears = years;
				console.log('Calculated available years from data:', years);
			} else {
				console.log('Using available years from parent:', availableYears);
			}

			// Auto-select the current year if available, otherwise the most recent year
			if (!availableYears.includes(selectedYear)) {
				selectedYear = availableYears.includes(new Date().getFullYear()) ? new Date().getFullYear() : availableYears[0];
			}
		}
	}

	// Function to get color and level based on pollutant type and value using WHO standards
	function getPollutantColor(value: number, pollutant: string): string {
		if (pollutant.includes('aqi')) {
			// AQI-based coloring (US EPA standards)
			if (value <= 50) return '#00e400'; // Good - Green
			if (value <= 100) return '#ffff00'; // Moderate - Yellow
			if (value <= 150) return '#ff7e00'; // Unhealthy for Sensitive Groups - Orange
			if (value <= 200) return '#ff0000'; // Unhealthy - Red
			if (value <= 300) return '#8f3f97'; // Very Unhealthy - Purple
			return '#7e0023'; // Hazardous - Maroon
		} else {
			// Raw concentration values based on WHO Air Quality Guidelines 2021
			switch (pollutant) {
				case 'pm2_5':
					// WHO 2021: Annual mean: 5 μg/m³, 24-hour mean: 15 μg/m³
					if (value <= 5) return '#00e400'; // Excellent (WHO annual)
					if (value <= 15) return '#80e400'; // Good (WHO 24h)
					if (value <= 25) return '#ffff00'; // Fair
					if (value <= 50) return '#ff7e00'; // Poor
					if (value <= 75) return '#ff0000'; // Very Poor
					return '#8f3f97'; // Extremely Poor

				case 'pm10':
					// WHO 2021: Annual mean: 15 μg/m³, 24-hour mean: 45 μg/m³
					if (value <= 15) return '#00e400'; // Excellent (WHO annual)
					if (value <= 45) return '#80e400'; // Good (WHO 24h)
					if (value <= 75) return '#ffff00'; // Fair
					if (value <= 100) return '#ff7e00'; // Poor
					if (value <= 150) return '#ff0000'; // Very Poor
					return '#8f3f97'; // Extremely Poor

				case 'o3':
					// WHO 2021: Peak season: 60 μg/m³, 8-hour mean: 100 μg/m³
					if (value <= 60) return '#00e400'; // Excellent (WHO peak season)
					if (value <= 100) return '#80e400'; // Good (WHO 8h)
					if (value <= 140) return '#ffff00'; // Fair
					if (value <= 180) return '#ff7e00'; // Poor
					if (value <= 240) return '#ff0000'; // Very Poor
					return '#8f3f97'; // Extremely Poor

				case 'no2':
					// WHO 2021: Annual mean: 10 μg/m³, 24-hour mean: 25 μg/m³
					if (value <= 10) return '#00e400'; // Excellent (WHO annual)
					if (value <= 25) return '#80e400'; // Good (WHO 24h)
					if (value <= 40) return '#ffff00'; // Fair
					if (value <= 70) return '#ff7e00'; // Poor
					if (value <= 100) return '#ff0000'; // Very Poor
					return '#8f3f97'; // Extremely Poor

				case 'so2':
					// WHO 2021: 24-hour mean: 40 μg/m³
					if (value <= 20) return '#00e400'; // Excellent
					if (value <= 40) return '#80e400'; // Good (WHO 24h)
					if (value <= 80) return '#ffff00'; // Fair
					if (value <= 120) return '#ff7e00'; // Poor
					if (value <= 200) return '#ff0000'; // Very Poor
					return '#8f3f97'; // Extremely Poor

				case 'co':
					// WHO 2021: 24-hour mean: 4 mg/m³
					if (value <= 2) return '#00e400'; // Excellent
					if (value <= 4) return '#80e400'; // Good (WHO 24h)
					if (value <= 8) return '#ffff00'; // Fair
					if (value <= 15) return '#ff7e00'; // Poor
					if (value <= 25) return '#ff0000'; // Very Poor
					return '#8f3f97'; // Extremely Poor

				default:
					// Fallback for unknown pollutants
					const ratio = Math.min(value / 100, 1);
					if (ratio <= 0.2) return '#00e400';
					if (ratio <= 0.4) return '#80e400';
					if (ratio <= 0.6) return '#ffff00';
					if (ratio <= 0.8) return '#ff7e00';
					return '#ff0000';
			}
		}
	}

	function getPollutantLevel(value: number, pollutant: string): string {
		if (pollutant.includes('aqi')) {
			if (value <= 50) return 'Good';
			if (value <= 100) return 'Moderate';
			if (value <= 150) return 'Unhealthy for Sensitive Groups';
			if (value <= 200) return 'Unhealthy';
			if (value <= 300) return 'Very Unhealthy';
			return 'Hazardous';
		} else {
			// WHO-based quality levels for raw concentrations
			const unit = pollutant === 'co' ? 'mg/m³' : 'μg/m³';
			let quality = '';

			switch (pollutant) {
				case 'pm2_5':
					if (value <= 5) quality = 'Excellent';
					else if (value <= 15) quality = 'Good';
					else if (value <= 25) quality = 'Fair';
					else if (value <= 50) quality = 'Poor';
					else if (value <= 75) quality = 'Very Poor';
					else quality = 'Extremely Poor';
					break;
				case 'pm10':
					if (value <= 15) quality = 'Excellent';
					else if (value <= 45) quality = 'Good';
					else if (value <= 75) quality = 'Fair';
					else if (value <= 100) quality = 'Poor';
					else if (value <= 150) quality = 'Very Poor';
					else quality = 'Extremely Poor';
					break;
				case 'o3':
					if (value <= 60) quality = 'Excellent';
					else if (value <= 100) quality = 'Good';
					else if (value <= 140) quality = 'Fair';
					else if (value <= 180) quality = 'Poor';
					else if (value <= 240) quality = 'Very Poor';
					else quality = 'Extremely Poor';
					break;
				case 'no2':
					if (value <= 10) quality = 'Excellent';
					else if (value <= 25) quality = 'Good';
					else if (value <= 40) quality = 'Fair';
					else if (value <= 70) quality = 'Poor';
					else if (value <= 100) quality = 'Very Poor';
					else quality = 'Extremely Poor';
					break;
				case 'so2':
					if (value <= 20) quality = 'Excellent';
					else if (value <= 40) quality = 'Good';
					else if (value <= 80) quality = 'Fair';
					else if (value <= 120) quality = 'Poor';
					else if (value <= 200) quality = 'Very Poor';
					else quality = 'Extremely Poor';
					break;
				case 'co':
					if (value <= 2) quality = 'Excellent';
					else if (value <= 4) quality = 'Good';
					else if (value <= 8) quality = 'Fair';
					else if (value <= 15) quality = 'Poor';
					else if (value <= 25) quality = 'Very Poor';
					else quality = 'Extremely Poor';
					break;
				default:
					quality = 'Unknown';
			}

			return `${value.toFixed(1)} ${unit} - ${quality}`;
		}
	}

	// Function to prepare heatmap data for ECharts
	function prepareEChartsData() {
		if (!data || data.length === 0) {
			console.log('No data available for heatmap');
			return [];
		}

		// Filter data by selected station and year
		let filteredData = data.filter(reading => new Date(reading.datetime).getFullYear() === selectedYear);

		if (selectedStation) {
			filteredData = filteredData.filter(reading => reading.station_id === selectedStation.id);
			console.log(`Filtered to ${filteredData.length} readings for station ${selectedStation.name} in ${selectedYear}`);
		} else {
			console.log(`Processing ${filteredData.length} readings for all stations in ${selectedYear}`);
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
			const pollutantValue = reading[selectedPollutant as keyof AirQualityReading] as number;

			if (!dailyData[dateKey]) {
				dailyData[dateKey] = { total: 0, count: 0, values: [] };
			}

			dailyData[dateKey].total += pollutantValue;
			dailyData[dateKey].count += 1;
			dailyData[dateKey].values.push(pollutantValue);
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
			const echarts = await import('echarts');

			const heatmapData = prepareEChartsData();

			// Destroy existing chart if it exists
			if (chart) {
				chart.dispose();
				chart = null;
			}

			// Use selected year
			const dataYear = selectedYear;

			// Initialize chart
			chart = echarts.init(chartContainer);

			// Fixed cell size for square cells like GitHub
			const cellSize = window.innerWidth < 640 ? 11 : 13;

			const option = {
				title: {
					top: 10,
					left: 'center',
					text: selectedStation ? `${selectedStation.name} - ${dataYear}` : `All Stations - ${dataYear}`,
					textStyle: {
						fontSize: window.innerWidth < 640 ? 12 : 16,
						fontWeight: 600,
						color: '#1f2937'
					}
				},
				tooltip: {
					formatter: function (params: any) {
						const date = new Date(params.data[0]).toLocaleDateString('en-US', {
							weekday: 'long',
							year: 'numeric',
							month: 'long',
							day: 'numeric'
						});
						const value = params.data[1];
						const level = getPollutantLevel(value, selectedPollutant);
						const color = getPollutantColor(value, selectedPollutant);
						const pollutantName = selectedPollutant.includes('aqi')
							? selectedPollutant.replace('_aqi', '').toUpperCase().replace('_', '.') + ' AQI'
							: selectedPollutant.toUpperCase().replace('_', '.');

						return `
							<div style="padding: 8px;">
								<div style="font-weight: 600; margin-bottom: 4px;">${date}</div>
								<div style="display: flex; align-items: center; gap: 6px;">
									<span style="display: inline-block; width: 10px; height: 10px; border-radius: 50%; background-color: ${color};"></span>
									<span>${pollutantName}: <strong>${selectedPollutant.includes('aqi') ? Math.round(value) : value.toFixed(1)}</strong></span>
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
						fontSize: window.innerWidth < 640 ? 11 : 13
					}
				},
				visualMap: (() => {
					if (selectedPollutant.includes('aqi')) {
						// AQI-based visualization (US EPA standards)
						return {
							min: 0,
							max: 300,
							type: 'piecewise',
							orient: 'horizontal',
							left: 'center',
							right: undefined,
							top: 'auto',
							bottom: 15,
							itemWidth: window.innerWidth < 640 ? 14 : 20,
							itemHeight: window.innerWidth < 640 ? 12 : 14,
							itemGap: window.innerWidth < 640 ? 3 : 5,
							pieces: [
								{ min: 0, max: 50, color: '#00e400', label: window.innerWidth < 640 ? 'Good' : 'Good (0-50)' },
								{
									min: 51,
									max: 100,
									color: '#ffff00',
									label: window.innerWidth < 640 ? 'Moderate' : 'Moderate (51-100)'
								},
								{
									min: 101,
									max: 150,
									color: '#ff7e00',
									label: window.innerWidth < 640 ? 'Unhealthy Sensitive' : 'Unhealthy for Sensitive (101-150)'
								},
								{
									min: 151,
									max: 200,
									color: '#ff0000',
									label: window.innerWidth < 640 ? 'Unhealthy' : 'Unhealthy (151-200)'
								},
								{
									min: 201,
									max: 300,
									color: '#8f3f97',
									label: window.innerWidth < 640 ? 'Very Unhealthy' : 'Very Unhealthy (201-300)'
								},
								{ min: 301, color: '#7e0023', label: window.innerWidth < 640 ? 'Hazardous' : 'Hazardous (300+)' }
							],
							textStyle: {
								fontSize: window.innerWidth < 640 ? 8 : 11,
								color: '#374151'
							}
						};
					} else {
						// WHO-based visualization for raw concentrations
						const unit = selectedPollutant === 'co' ? 'mg/m³' : 'μg/m³';

						switch (selectedPollutant) {
							case 'pm2_5':
								return {
									min: 0,
									max: 100,
									type: 'piecewise',
									orient: 'horizontal',
									left: 'center',
									top: window.innerWidth < 640 ? 'bottom' : 55,
									bottom: window.innerWidth < 640 ? 10 : undefined,
									itemWidth: window.innerWidth < 640 ? 14 : 20,
									itemHeight: window.innerWidth < 640 ? 12 : 14,
									itemGap: window.innerWidth < 640 ? 3 : 5,
									pieces: [
										{
											min: 0,
											max: 5,
											color: '#00e400',
											label: window.innerWidth < 640 ? 'Excellent' : 'Excellent (≤5)'
										},
										{ min: 6, max: 15, color: '#80e400', label: window.innerWidth < 640 ? 'Good' : 'Good (6-15)' },
										{ min: 16, max: 25, color: '#ffff00', label: window.innerWidth < 640 ? 'Fair' : 'Fair (16-25)' },
										{ min: 26, max: 50, color: '#ff7e00', label: window.innerWidth < 640 ? 'Poor' : 'Poor (26-50)' },
										{
											min: 51,
											max: 75,
											color: '#ff0000',
											label: window.innerWidth < 640 ? 'Very Poor' : 'Very Poor (51-75)'
										},
										{ min: 76, color: '#8f3f97', label: window.innerWidth < 640 ? 'Extreme' : 'Extremely Poor (75+)' }
									],
									textStyle: { fontSize: window.innerWidth < 640 ? 8 : 11, color: '#374151' }
								};
							case 'pm10':
								return {
									min: 0,
									max: 200,
									type: 'piecewise',
									orient: 'horizontal',
									left: 'center',
									top: window.innerWidth < 640 ? 'bottom' : 55,
									bottom: window.innerWidth < 640 ? 10 : undefined,
									itemWidth: window.innerWidth < 640 ? 14 : 20,
									itemHeight: window.innerWidth < 640 ? 12 : 14,
									itemGap: window.innerWidth < 640 ? 3 : 5,
									pieces: [
										{
											min: 0,
											max: 15,
											color: '#00e400',
											label: window.innerWidth < 640 ? 'Excellent' : 'Excellent (≤15)'
										},
										{ min: 16, max: 45, color: '#80e400', label: window.innerWidth < 640 ? 'Good' : 'Good (16-45)' },
										{ min: 46, max: 75, color: '#ffff00', label: window.innerWidth < 640 ? 'Fair' : 'Fair (46-75)' },
										{ min: 76, max: 100, color: '#ff7e00', label: window.innerWidth < 640 ? 'Poor' : 'Poor (76-100)' },
										{
											min: 101,
											max: 150,
											color: '#ff0000',
											label: window.innerWidth < 640 ? 'Very Poor' : 'Very Poor (101-150)'
										},
										{ min: 151, color: '#8f3f97', label: window.innerWidth < 640 ? 'Extreme' : 'Extremely Poor (150+)' }
									],
									textStyle: { fontSize: window.innerWidth < 640 ? 8 : 11, color: '#374151' }
								};
							case 'o3':
								return {
									min: 0,
									max: 300,
									type: 'piecewise',
									orient: 'horizontal',
									left: 'center',
									top: window.innerWidth < 640 ? 'bottom' : 55,
									bottom: window.innerWidth < 640 ? 10 : undefined,
									itemWidth: window.innerWidth < 640 ? 14 : 20,
									itemHeight: window.innerWidth < 640 ? 12 : 14,
									itemGap: window.innerWidth < 640 ? 3 : 5,
									pieces: [
										{
											min: 0,
											max: 60,
											color: '#00e400',
											label: window.innerWidth < 640 ? 'Excellent' : 'Excellent (≤60)'
										},
										{ min: 61, max: 100, color: '#80e400', label: window.innerWidth < 640 ? 'Good' : 'Good (61-100)' },
										{
											min: 101,
											max: 140,
											color: '#ffff00',
											label: window.innerWidth < 640 ? 'Fair' : 'Fair (101-140)'
										},
										{
											min: 141,
											max: 180,
											color: '#ff7e00',
											label: window.innerWidth < 640 ? 'Poor' : 'Poor (141-180)'
										},
										{
											min: 181,
											max: 240,
											color: '#ff0000',
											label: window.innerWidth < 640 ? 'Very Poor' : 'Very Poor (181-240)'
										},
										{ min: 241, color: '#8f3f97', label: window.innerWidth < 640 ? 'Extreme' : 'Extremely Poor (240+)' }
									],
									textStyle: { fontSize: window.innerWidth < 640 ? 8 : 11, color: '#374151' }
								};
							case 'no2':
								return {
									min: 0,
									max: 150,
									type: 'piecewise',
									orient: 'horizontal',
									left: 'center',
									top: window.innerWidth < 640 ? 'bottom' : 55,
									bottom: window.innerWidth < 640 ? 10 : undefined,
									itemWidth: window.innerWidth < 640 ? 14 : 20,
									itemHeight: window.innerWidth < 640 ? 12 : 14,
									itemGap: window.innerWidth < 640 ? 3 : 5,
									pieces: [
										{
											min: 0,
											max: 10,
											color: '#00e400',
											label: window.innerWidth < 640 ? 'Excellent' : 'Excellent (≤10)'
										},
										{ min: 11, max: 25, color: '#80e400', label: window.innerWidth < 640 ? 'Good' : 'Good (11-25)' },
										{ min: 26, max: 40, color: '#ffff00', label: window.innerWidth < 640 ? 'Fair' : 'Fair (26-40)' },
										{ min: 41, max: 70, color: '#ff7e00', label: window.innerWidth < 640 ? 'Poor' : 'Poor (41-70)' },
										{
											min: 71,
											max: 100,
											color: '#ff0000',
											label: window.innerWidth < 640 ? 'Very Poor' : 'Very Poor (71-100)'
										},
										{ min: 101, color: '#8f3f97', label: window.innerWidth < 640 ? 'Extreme' : 'Extremely Poor (100+)' }
									],
									textStyle: { fontSize: window.innerWidth < 640 ? 8 : 11, color: '#374151' }
								};
							case 'so2':
								return {
									min: 0,
									max: 250,
									type: 'piecewise',
									orient: 'horizontal',
									left: 'center',
									top: window.innerWidth < 640 ? 'bottom' : 55,
									bottom: window.innerWidth < 640 ? 10 : undefined,
									itemWidth: window.innerWidth < 640 ? 14 : 20,
									itemHeight: window.innerWidth < 640 ? 12 : 14,
									itemGap: window.innerWidth < 640 ? 3 : 5,
									pieces: [
										{
											min: 0,
											max: 20,
											color: '#00e400',
											label: window.innerWidth < 640 ? 'Excellent' : 'Excellent (≤20)'
										},
										{ min: 21, max: 40, color: '#80e400', label: window.innerWidth < 640 ? 'Good' : 'Good (21-40)' },
										{ min: 41, max: 80, color: '#ffff00', label: window.innerWidth < 640 ? 'Fair' : 'Fair (41-80)' },
										{ min: 81, max: 120, color: '#ff7e00', label: window.innerWidth < 640 ? 'Poor' : 'Poor (81-120)' },
										{
											min: 121,
											max: 200,
											color: '#ff0000',
											label: window.innerWidth < 640 ? 'Very Poor' : 'Very Poor (121-200)'
										},
										{ min: 201, color: '#8f3f97', label: window.innerWidth < 640 ? 'Extreme' : 'Extremely Poor (200+)' }
									],
									textStyle: { fontSize: window.innerWidth < 640 ? 8 : 11, color: '#374151' }
								};
							case 'co':
								return {
									min: 0,
									max: 30,
									type: 'piecewise',
									orient: 'horizontal',
									left: 'center',
									top: window.innerWidth < 640 ? 'bottom' : 55,
									bottom: window.innerWidth < 640 ? 10 : undefined,
									itemWidth: window.innerWidth < 640 ? 14 : 20,
									itemHeight: window.innerWidth < 640 ? 12 : 14,
									itemGap: window.innerWidth < 640 ? 3 : 5,
									pieces: [
										{
											min: 0,
											max: 2,
											color: '#00e400',
											label: window.innerWidth < 640 ? 'Excellent' : 'Excellent (≤2)'
										},
										{ min: 3, max: 4, color: '#80e400', label: window.innerWidth < 640 ? 'Good' : 'Good (3-4)' },
										{ min: 5, max: 8, color: '#ffff00', label: window.innerWidth < 640 ? 'Fair' : 'Fair (5-8)' },
										{ min: 9, max: 15, color: '#ff7e00', label: window.innerWidth < 640 ? 'Poor' : 'Poor (9-15)' },
										{
											min: 16,
											max: 25,
											color: '#ff0000',
											label: window.innerWidth < 640 ? 'Very Poor' : 'Very Poor (16-25)'
										},
										{ min: 26, color: '#8f3f97', label: window.innerWidth < 640 ? 'Extreme' : 'Extremely Poor (25+)' }
									],
									textStyle: { fontSize: window.innerWidth < 640 ? 8 : 11, color: '#374151' }
								};
							default:
								// Fallback
								return {
									min: 0,
									max: 100,
									type: 'continuous',
									orient: 'horizontal',
									left: 'center',
									top: 'auto',
									bottom: 15,
									inRange: { color: ['#00e400', '#80e400', '#ffff00', '#ff7e00', '#ff0000'] },
									text: [`High (${unit})`, `Low (${unit})`],
									textStyle: { fontSize: window.innerWidth < 640 ? 8 : 11, color: '#374151' }
								};
						}
					}
				})(),
				calendar: {
					top: 100,
					left: window.innerWidth < 640 ? 25 : 30,
					right: window.innerWidth < 640 ? 10 : 30,
					bottom: 90, // Space for legend at bottom
					cellSize: [cellSize, cellSize], // Square cells like GitHub
					range: dataYear.toString(),
					itemStyle: {
						borderWidth: 1,
						borderColor: '#ffffff',
						borderRadius: 2
					},
					yearLabel: {
						show: false
					},
					monthLabel: {
						fontSize: window.innerWidth < 640 ? 10 : 12,
						color: '#374151',
						fontWeight: 500,
						nameMap: window.innerWidth < 640 ? 'en-short' : 'en' // Use short month names on mobile
					},
					dayLabel: {
						firstDay: 0, // Start week on Sunday
						fontSize: window.innerWidth < 640 ? 8 : 10,
						color: '#6b7280',
						nameMap: window.innerWidth < 640 ? ['S', 'M', 'T', 'W', 'T', 'F', 'S'] : 'en' // Single letter days on mobile
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

	// Reactive statement to update chart when data, selectedStation, selectedYear, or selectedPollutant changes
	$: if (data && chartContainer && browser && selectedYear && selectedPollutant) {
		console.log('Chart recreation triggered:', {
			dataLength: data.length,
			selectedYear,
			selectedPollutant,
			availableYears
		});
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

<div class="w-full bg-white rounded-xl shadow-lg overflow-hidden">
	<!-- Header with Controls -->
	<div class="p-6 border-b border-gray-200">
		<div class="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
			<div class="relative">
				<div class="flex items-center gap-2 mb-2">
					<h3 class="text-xl font-bold text-gray-800">{title}</h3>
					<button
						class="text-blue-500 hover:text-blue-600 text-xs font-bold border border-blue-500 rounded-full w-5 h-5 flex items-center justify-center"
						onmouseenter={() => (showTooltip = true)}
						onmouseleave={() => (showTooltip = false)}
						onfocus={() => (showTooltip = true)}
						onblur={() => (showTooltip = false)}
					>
						!
					</button>
				</div>
				<p class="text-sm text-gray-600">
					{stationName} - Daily air quality patterns. Hover over squares for details.
				</p>

				<!-- Tooltip -->
				{#if showTooltip}
					<div class="absolute top-full left-0 mt-2 w-80 z-50">
						<div class="bg-gray-800 text-white text-xs rounded-lg p-3 shadow-lg">
							<div class="font-semibold mb-2 text-blue-300">EPA AQI Calculation Method</div>
							<div class="space-y-2">
								<div>
									<strong>EPA AQI Calculation:</strong><br />
									<code class="bg-gray-700 px-1 rounded">AQI = highest individual pollutant AQI</code>
								</div>
								<div>
									<strong>Process:</strong> Each pollutant concentration → AQI value using EPA breakpoints → highest AQI
									reported.
								</div>
								<div>
									<strong>Steps:</strong> 1) Truncate concentrations 2) Find breakpoints 3) Apply Equation 1 4) Round to
									integer 5) Report highest
								</div>
								<div>
									<strong>Colors:</strong> EPA health categories (Good, Moderate, Unhealthy, etc.)
								</div>
								<div class="text-blue-300 text-xs">
									<strong>Source:</strong> EPA Technical Assistance Document (Page 18, Section IV)
								</div>
							</div>
							<div class="absolute -top-1 left-6 border-4 border-transparent border-b-gray-800"></div>
						</div>
					</div>
				{/if}
			</div>
			<div class="flex flex-col sm:flex-row gap-3">
				<!-- Year Selection -->
				{#if availableYears.length > 0}
					<div class="flex items-center gap-2">
						<label for="calendar-year-heatmap" class="text-sm font-medium text-gray-700 whitespace-nowrap">Year:</label>
						<select
							id="calendar-year-heatmap"
							value={selectedYear}
							onchange={e => onyearChange?.(parseInt(e.currentTarget.value))}
							class="px-3 py-2 border border-gray-300 rounded-md text-sm font-medium focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-white min-w-[100px]"
						>
							{#each availableYears as year}
								<option value={year}>{year}</option>
							{/each}
						</select>
					</div>
				{/if}
				<!-- Pollutant Selection -->
				<div class="flex items-center gap-2">
					<label for="calendar-pollutant-heatmap" class="text-sm font-medium text-gray-700 whitespace-nowrap"
						>Metric:</label
					>
					<select
						id="calendar-pollutant-heatmap"
						value={selectedPollutant}
						onchange={e => onpollutantChange?.(e.currentTarget.value)}
						class="px-3 py-2 border border-gray-300 rounded-md text-sm font-medium focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-white min-w-[140px]"
					>
						<option value="overall_aqi">Overall AQI</option>
						<option value="pm2_5_aqi">PM2.5 AQI</option>
						<option value="pm10_aqi">PM10 AQI</option>
						<option value="o3_aqi">O₃ AQI</option>
						<option value="no2_aqi">NO₂ AQI</option>
						<option value="so2_aqi">SO₂ AQI</option>
						<option value="co_aqi">CO AQI</option>
						<option value="pm2_5">PM2.5 (μg/m³)</option>
						<option value="pm10">PM10 (μg/m³)</option>
						<option value="o3">O₃ (μg/m³)</option>
						<option value="no2">NO₂ (μg/m³)</option>
						<option value="so2">SO₂ (μg/m³)</option>
						<option value="co">CO (mg/m³)</option>
					</select>
				</div>
			</div>
		</div>
	</div>

	<!-- Chart Content -->

	{#if data && data.length > 0}
		<div class="p-4 sm:p-6 md:p-8 relative">
			<!-- Decorative background elements -->
			<div
				class="absolute top-0 right-0 w-64 h-64 bg-gradient-to-br from-blue-100/20 to-green-100/20 rounded-full blur-3xl"
			></div>
			<div
				class="absolute bottom-0 left-0 w-48 h-48 bg-gradient-to-tr from-yellow-100/20 to-orange-100/20 rounded-full blur-3xl"
			></div>

			<div class="w-full relative z-10">
				<div bind:this={chartContainer} class="w-full h-[450px] sm:h-[400px] md:h-[450px]"></div>
			</div>
		</div>
	{:else}
		<div
			class="flex items-center justify-center h-40 bg-gradient-to-br from-gray-50 to-gray-100 border-2 border-dashed border-gray-300"
		>
			<div class="text-center text-gray-500">
				<div class="text-5xl mb-3">📅</div>
				<p class="text-lg font-semibold mb-1">No data available</p>
				<p class="text-sm">
					{#if selectedStation}
						No data found for {selectedStation.name}
					{:else}
						Calendar heatmap will appear when data is loaded
					{/if}
				</p>
			</div>
		</div>
	{/if}
</div>
