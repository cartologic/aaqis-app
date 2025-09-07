<script lang="ts">
	import { onMount } from 'svelte';

	export let aqi: number = 0;
	export let rating: string = 'Good';
	export let size: number = 200;
	
	let showTooltip = false;

	let canvasElement: HTMLCanvasElement;

	$: strokeColor = getAQIColor(aqi);
	$: emoji = getAQIEmoji(rating);

	onMount(() => {
		drawGauge();
	});

	$: if (canvasElement && aqi >= 0) {
		drawGauge();
	}

	function getAQIColor(aqi: number): string {
		if (aqi <= 50) return '#22c55e'; // Green
		if (aqi <= 100) return '#eab308'; // Yellow
		if (aqi <= 150) return '#f97316'; // Orange
		if (aqi <= 200) return '#ef4444'; // Red
		if (aqi <= 300) return '#a855f7'; // Purple
		return '#7f1d1d'; // Dark Red
	}

	function getAQIEmoji(rating: string): string {
		switch (rating.toLowerCase()) {
			case 'good': return '😊';
			case 'moderate': return '😐';
			case 'unhealthy for sensitive groups':
			case 'unhealthy_sensitive': return '😷';
			case 'unhealthy': return '😨';
			case 'very unhealthy':
			case 'very_unhealthy': return '🤢';
			case 'hazardous': return '☠️';
			default: return '😊';
		}
	}

	function drawGauge() {
		if (!canvasElement) return;

		const ctx = canvasElement.getContext('2d');
		if (!ctx) return;

		const centerX = size / 2;
		const centerY = size / 2;
		const radius = size / 2 - 20;

		// Clear canvas
		ctx.clearRect(0, 0, size, size);

		// Draw background arc
		ctx.beginPath();
		ctx.arc(centerX, centerY, radius, Math.PI, 2 * Math.PI);
		ctx.lineWidth = 20;
		ctx.strokeStyle = '#e5e7eb';
		ctx.lineCap = 'round';
		ctx.stroke();

		// Calculate progress (0-300 AQI mapped to 0-180 degrees)
		const maxAQI = 300;
		const progress = Math.min(aqi / maxAQI, 1);
		const endAngle = Math.PI + (progress * Math.PI);

		// Draw progress arc
		ctx.beginPath();
		ctx.arc(centerX, centerY, radius, Math.PI, endAngle);
		ctx.lineWidth = 20;
		ctx.strokeStyle = strokeColor;
		ctx.lineCap = 'round';
		ctx.stroke();

		// Draw center circle
		ctx.beginPath();
		ctx.arc(centerX, centerY, radius - 40, 0, 2 * Math.PI);
		ctx.fillStyle = 'white';
		ctx.fill();

		// Draw AQI text
		ctx.fillStyle = '#374151';
		ctx.font = 'bold 24px Ubuntu, sans-serif';
		ctx.textAlign = 'center';
		ctx.fillText(aqi.toString(), centerX, centerY - 10);

		// Draw rating text
		ctx.fillStyle = '#6b7280';
		ctx.font = '14px Ubuntu, sans-serif';
		ctx.fillText('AQI', centerX, centerY + 15);
	}
</script>

<div class="flex flex-col items-center">
	<div class="relative">
		<canvas
			bind:this={canvasElement}
			width={size}
			height={size}
			class="drop-shadow-lg"
		></canvas>
		
		<!-- Emoji overlay -->
		<div class="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 text-4xl mt-8">
			{emoji}
		</div>
	</div>
	
	<!-- Rating label with info tooltip -->
	<div class="mt-4 text-center relative">
		<div class="text-xl font-bold" style="color: {strokeColor}">
			{rating}
		</div>
		<div class="text-sm text-gray-600 mt-1 flex items-center justify-center gap-2">
			<span>Air Quality Index</span>
			<button 
				class="text-blue-500 hover:text-blue-600 text-xs font-bold border border-blue-500 rounded-full w-4 h-4 flex items-center justify-center"
				on:mouseenter={() => showTooltip = true}
				on:mouseleave={() => showTooltip = false}
				on:focus={() => showTooltip = true}
				on:blur={() => showTooltip = false}
			>
				!
			</button>
		</div>
		
		<!-- Tooltip -->
		{#if showTooltip}
			<div class="absolute bottom-full left-1/2 transform -translate-x-1/2 mb-2 w-80 z-50">
				<div class="bg-gray-800 text-white text-xs rounded-lg p-3 shadow-lg">
					<div class="font-semibold mb-2 text-blue-300">EPA AQI Calculation Method</div>
					<div class="space-y-2">
						<div>
							<strong>Overall AQI Formula:</strong><br>
							<code class="bg-gray-700 px-1 rounded">AQI = max(PM2.5_AQI, PM10_AQI, O₃_AQI, NO₂_AQI, SO₂_AQI, CO_AQI)</code>
						</div>
						<div>
							<strong>Method:</strong> The pollutant with the highest AQI value determines the overall AQI for that location and time.
						</div>
						<div>
							<strong>Pollutants:</strong> PM2.5, PM10, Ozone (O₃), Nitrogen Dioxide (NO₂), Sulfur Dioxide (SO₂), Carbon Monoxide (CO)
						</div>
						<div class="text-blue-300">
							<strong>Source:</strong> U.S. EPA Air Quality Index Standards
						</div>
					</div>
					<div class="absolute top-full left-1/2 transform -translate-x-1/2 border-4 border-transparent border-t-gray-800"></div>
				</div>
			</div>
		{/if}
	</div>
</div>