<script lang="ts">
	import { onMount } from 'svelte';

	export let aqi: number = 0;
	export let rating: string = 'Good';
	export let size: number = 200;

	let showTooltip = false;
	let containerWidth = 0;
	let canvasElement: HTMLCanvasElement;
	let isMounted = false;

	$: strokeColor = getAQIColor(aqi);
	$: emoji = getAQIEmoji(rating);
	// Responsive size: use containerWidth if available, otherwise use size prop
	// Max size is 400px on desktop
	$: responsiveSize = containerWidth > 0 ? Math.min(containerWidth * 0.9, 400) : size;

	onMount(() => {
		isMounted = true;
		// Small delay to ensure containerWidth is measured
		setTimeout(() => {
			if (canvasElement) {
				drawGauge();
			}
		}, 50);
	});

	// Redraw when any reactive values change (aqi, rating, responsiveSize)
	$: if (isMounted && canvasElement && responsiveSize > 0) {
		// This will trigger whenever aqi, strokeColor, or responsiveSize changes
		void aqi; // Track aqi changes
		void strokeColor; // Track color changes
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
			case 'good':
				return '😊';
			case 'moderate':
				return '😐';
			case 'unhealthy for sensitive groups':
			case 'unhealthy_sensitive':
				return '😷';
			case 'unhealthy':
				return '😨';
			case 'very unhealthy':
			case 'very_unhealthy':
				return '🤢';
			case 'hazardous':
				return '☠️';
			default:
				return '😊';
		}
	}

	function drawGauge() {
		if (!canvasElement) return;

		const ctx = canvasElement.getContext('2d');
		if (!ctx) return;

		const currentSize = responsiveSize;
		const centerX = currentSize / 2;
		const centerY = currentSize / 2;
		const radius = currentSize / 2 - 30;

		// Clear canvas
		ctx.clearRect(0, 0, currentSize, currentSize);

		// Draw background arc
		ctx.beginPath();
		ctx.arc(centerX, centerY, radius, Math.PI, 2 * Math.PI);
		ctx.lineWidth = Math.max(20, currentSize * 0.06);
		ctx.strokeStyle = '#e5e7eb';
		ctx.lineCap = 'round';
		ctx.stroke();

		// Calculate progress (0-300 AQI mapped to 0-180 degrees)
		const maxAQI = 300;
		const progress = Math.min(aqi / maxAQI, 1);
		const endAngle = Math.PI + progress * Math.PI;

		// Draw progress arc
		ctx.beginPath();
		ctx.arc(centerX, centerY, radius, Math.PI, endAngle);
		ctx.lineWidth = Math.max(20, currentSize * 0.06);
		ctx.strokeStyle = strokeColor;
		ctx.lineCap = 'round';
		ctx.stroke();

		// Draw center circle
		ctx.beginPath();
		ctx.arc(centerX, centerY, radius - Math.max(50, currentSize * 0.15), 0, 2 * Math.PI);
		ctx.fillStyle = 'white';
		ctx.fill();

		// Responsive font sizes
		const numberFontSize = Math.max(32, currentSize * 0.18);
		const labelFontSize = Math.max(14, currentSize * 0.07);

		// Draw AQI number - centered vertically
		ctx.fillStyle = '#1f2937';
		ctx.font = `bold ${numberFontSize}px Ubuntu, Inter, sans-serif`;
		ctx.textAlign = 'center';
		ctx.textBaseline = 'middle';
		ctx.fillText(aqi.toString(), centerX, centerY - numberFontSize * 0.15);

		// Draw "AQI" label below the number
		ctx.fillStyle = '#6b7280';
		ctx.font = `600 ${labelFontSize}px Ubuntu, Inter, sans-serif`;
		ctx.textBaseline = 'top';
		ctx.fillText('AQI', centerX, centerY + numberFontSize * 0.35);
	}
</script>

<div class="flex flex-col items-center w-full" bind:clientWidth={containerWidth}>
	{#if responsiveSize > 0}
		<div class="relative flex justify-center items-center" style="min-height: {responsiveSize}px;">
			<canvas
				bind:this={canvasElement}
				width={responsiveSize}
				height={responsiveSize}
				class="drop-shadow-xl"
			></canvas>

			<!-- Emoji overlay - positioned at the bottom of the gauge -->
			<div
				class="absolute left-1/2 transform -translate-x-1/2 pointer-events-none"
				style="top: {responsiveSize * 0.75}px; font-size: {Math.max(32, responsiveSize * 0.15)}px; line-height: 1;"
			>
				{emoji}
			</div>
		</div>
	{:else}
		<!-- Loading placeholder with fixed size from prop -->
		<div class="relative flex justify-center items-center" style="min-height: {size}px; width: {size}px;">
			<div class="animate-pulse bg-gray-200 rounded-full" style="width: {size}px; height: {size}px;"></div>
		</div>
	{/if}

	<!-- Rating label with info tooltip -->
	<div class="mt-6 text-center relative w-full">
		<div class="text-2xl md:text-3xl font-bold mb-2" style="color: {strokeColor}">
			{rating}
		</div>
		<div class="text-sm md:text-base text-gray-600 flex items-center justify-center gap-2">
			<span>Air Quality Index</span>
			<button
				class="text-blue-500 hover:text-blue-600 text-xs font-bold border border-blue-500 rounded-full w-5 h-5 flex items-center justify-center transition-colors"
				on:mouseenter={() => (showTooltip = true)}
				on:mouseleave={() => (showTooltip = false)}
				on:focus={() => (showTooltip = true)}
				on:blur={() => (showTooltip = false)}
			>
				i
			</button>
		</div>

		<!-- Tooltip -->
		{#if showTooltip}
			<div class="absolute bottom-full left-1/2 transform -translate-x-1/2 mb-2 w-80 z-50">
				<div class="bg-gray-800 text-white text-xs rounded-lg p-3 shadow-lg">
					<div class="font-semibold mb-2 text-blue-300">EPA AQI Calculation Method</div>
					<div class="space-y-2">
						<div>
							<strong>EPA AQI Calculation:</strong><br />
							<code class="bg-gray-700 px-1 rounded">AQI = highest value among all pollutants</code>
						</div>
						<div>
							<strong>Method:</strong> Each pollutant concentration is converted to an AQI value using EPA breakpoints and
							Equation 1. The highest individual pollutant AQI becomes the reported AQI.
						</div>
						<div>
							<strong>Formula:</strong>
							<code class="bg-gray-700 px-1 rounded text-xs">I = ((IHi-ILo)/(BPHi-BPLo)) × (C-BPLo) + ILo</code>
						</div>
						<div>
							<strong>Pollutants:</strong> PM2.5, PM10, O₃, NO₂, SO₂, CO
						</div>
						<div class="text-blue-300 text-xs">
							<strong>Source:</strong> EPA Technical Assistance Document for Reporting Daily Air Quality Index
						</div>
					</div>
					<div
						class="absolute top-full left-1/2 transform -translate-x-1/2 border-4 border-transparent border-t-gray-800"
					></div>
				</div>
			</div>
		{/if}
	</div>
</div>
