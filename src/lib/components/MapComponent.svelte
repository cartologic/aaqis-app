<script lang="ts">
	import { MapLibre, Marker, Popup } from 'svelte-maplibre-gl';
	import type { AirQualityReading, Station } from '$lib/types.js';
	import { getAQIColor, getAQIDescription, CITY_INFO } from '$lib/types.js';
	import { getAQIEmoji } from '$lib/dataUtils.js';
	import type { Map } from 'maplibre-gl';

	export let stations: Station[] = [];
	export let latestReadings: AirQualityReading[] = [];
	export let selectedStation: Station | null = null;
	export let onStationSelect: (station: Station) => void = () => {};

	let map: Map;
	let previousSelectedStation: Station | null = null;

	// Export flyToStation method for parent component access
	export function flyToStation(station: Station) {
		if (!map) return;
		
		// Get city info for better zoom level
		const cityInfo = CITY_INFO[station.city];
		const zoom = cityInfo?.zoom || 12;
		
		map.flyTo({
			center: [station.longitude, station.latitude],
			zoom: zoom,
			duration: 2000,
			essential: true
		});
	}

	// Watch for station changes and fly to them
	$: if (map && selectedStation && selectedStation !== previousSelectedStation) {
		flyToStationInternal(selectedStation);
		previousSelectedStation = selectedStation;
	}

	function flyToStationInternal(station: Station) {
		if (!map) return;
		
		// Get city info for better zoom level
		const cityInfo = CITY_INFO[station.city];
		const zoom = cityInfo?.zoom || 12;
		
		map.flyTo({
			center: [station.longitude, station.latitude],
			zoom: zoom,
			duration: 2000,
			essential: true
		});
	}

	function handleMapLoad(event: any) {
		map = event.detail;
	}


	
	function formatRating(rating: string): string {
		return rating
			.replace(/_/g, ' ')
			.replace(/\b\w/g, l => l.toUpperCase());
	}

</script>

<MapLibre
	style="https://basemaps.cartocdn.com/gl/dark-matter-gl-style/style.json"
	class="h-full w-full"
	zoom={4}
	center={[30, -5]}
	maxPitch={85}
	attributionControl={false}
	on:load={handleMapLoad}
>
	{#each stations as station}
		{@const reading = latestReadings.find(r => r.station_id === station.id)}
		{#if reading}
			{@const cityInfo = CITY_INFO[station.city]}
			{@const statusEmoji = getAQIEmoji(reading.overall_rating)}
			<Marker lnglat={[station.longitude, station.latitude]} draggable={false}>
				{#snippet content()}
					<div 
						class="text-center leading-none cursor-pointer transform hover:scale-110 transition-all duration-200 {selectedStation?.id === station.id ? 'scale-125 ring-4 ring-blue-400 ring-opacity-50 rounded-full' : ''}"
						on:click={() => onStationSelect(station)}
						on:keydown={(e) => e.key === 'Enter' && onStationSelect(station)}
						tabindex="0"
						role="button"
						aria-label="Select {station.name} station"
					>
						<div class="text-4xl animate-bounce drop-shadow-lg filter hover:brightness-110">
							{statusEmoji}
						</div>
						<div class="text-xs font-bold text-white drop-shadow-lg bg-black/70 px-2 py-1 rounded-full mt-1">
							{station.name.replace('Station', '').trim()}
						</div>
						<div 
							class="w-3 h-3 rounded-full border-2 border-white mx-auto mt-1 pulse-glow {selectedStation?.id === station.id ? 'w-4 h-4' : ''}"
							style="background-color: {getAQIColor(reading.overall_rating)}"
						></div>
					</div>
				{/snippet}
				<Popup class="custom-popup" offset={[0, -10]}>
					<div class="bg-white rounded-xl shadow-2xl border border-gray-200 p-4 min-w-[280px] backdrop-blur-sm bg-white/95">
						<div class="flex items-center justify-between mb-3">
							<div>
								<h3 class="font-bold text-lg text-gray-800">{station.name}</h3>
								<p class="text-sm text-gray-600">
									{CITY_INFO[station.city]?.displayName || station.city} • Station ID: {station.id}
								</p>
							</div>
							<div class="text-center">
								<span class="text-3xl">{statusEmoji}</span>
								<div class="text-xs text-gray-600 mt-1">Click to select</div>
							</div>
						</div>
						
						<div class="mb-4">
							<div class="flex items-center justify-between mb-2">
								<span class="font-medium text-gray-700">Air Quality:</span>
								<span 
									class="px-3 py-1 rounded-full text-sm font-medium text-white"
									style="background-color: {getAQIColor(reading.overall_rating)}"
								>
									{formatRating(reading.overall_rating)}
								</span>
							</div>
							<div class="text-2xl font-bold text-center mb-2" style="color: {getAQIColor(reading.overall_rating)}">
								{Math.round(reading.overall_aqi)} AQI
							</div>
						</div>

						<div class="grid grid-cols-3 gap-2 text-sm mb-3">
							<div class="bg-gray-50 p-2 rounded text-center">
								<div class="font-medium text-gray-800">PM₂.₅</div>
								<div class="text-xs text-gray-600">{reading.pm2_5.toFixed(1)} µg/m³</div>
								<div class="text-xs font-medium" style="color: {getAQIColor(reading.pm2_5_rating)}">AQI {Math.round(reading.pm2_5_aqi)}</div>
							</div>
							<div class="bg-gray-50 p-2 rounded text-center">
								<div class="font-medium text-gray-800">PM₁₀</div>
								<div class="text-xs text-gray-600">{reading.pm10.toFixed(1)} µg/m³</div>
								<div class="text-xs font-medium" style="color: {getAQIColor(reading.pm10_rating)}">AQI {Math.round(reading.pm10_aqi)}</div>
							</div>
							<div class="bg-gray-50 p-2 rounded text-center">
								<div class="font-medium text-gray-800">O₃</div>
								<div class="text-xs text-gray-600">{reading.o3.toFixed(1)} µg/m³</div>
								<div class="text-xs font-medium" style="color: {getAQIColor(reading.o3_rating)}">AQI {Math.round(reading.o3_aqi)}</div>
							</div>
						</div>

						<div class="grid grid-cols-3 gap-2 text-sm mb-3">
							<div class="bg-gray-50 p-2 rounded text-center">
								<div class="font-medium text-gray-800">NO₂</div>
								<div class="text-xs text-gray-600">{reading.no2.toFixed(1)} µg/m³</div>
								<div class="text-xs font-medium" style="color: {getAQIColor(reading.no2_rating)}">AQI {Math.round(reading.no2_aqi)}</div>
							</div>
							<div class="bg-gray-50 p-2 rounded text-center">
								<div class="font-medium text-gray-800">SO₂</div>
								<div class="text-xs text-gray-600">{reading.so2.toFixed(1)} µg/m³</div>
								<div class="text-xs font-medium" style="color: {getAQIColor(reading.so2_rating)}">AQI {Math.round(reading.so2_aqi)}</div>
							</div>
							<div class="bg-gray-50 p-2 rounded text-center">
								<div class="font-medium text-gray-800">CO</div>
								<div class="text-xs text-gray-600">{reading.co.toFixed(1)} mg/m³</div>
								<div class="text-xs font-medium" style="color: {getAQIColor(reading.co_rating)}">AQI {Math.round(reading.co_aqi)}</div>
							</div>
						</div>

						<div class="border-t pt-3 text-xs text-gray-500">
							<div class="flex justify-between">
								<span>Last updated:</span>
								<span>{new Date(reading.datetime).toLocaleString()}</span>
							</div>
							<div class="flex justify-between mt-1">
								<span>Location:</span>
								<span>{station.latitude.toFixed(4)}, {station.longitude.toFixed(4)}</span>
							</div>
						</div>
					</div>
				</Popup>
			</Marker>
		{/if}
	{/each}
</MapLibre>

<style>
	/* Custom marker styles */
	:global(.marker-container) {
		cursor: pointer;
	}

	/* Custom popup styling */
	:global(.custom-popup .maplibregl-popup-content) {
		background: linear-gradient(135deg, rgba(255, 255, 255, 0.98) 0%, rgba(248, 250, 252, 0.95) 100%) !important;
		border-radius: 12px !important;
		box-shadow: 0 25px 50px rgba(0, 0, 0, 0.25), 0 0 0 1px rgba(255, 255, 255, 0.8) !important;
		border: none !important;
		padding: 0 !important;
		backdrop-filter: blur(10px) !important;
		max-width: none !important;
	}

	:global(.custom-popup .maplibregl-popup-tip) {
		border-top-color: rgba(255, 255, 255, 0.98) !important;
		border-width: 8px !important;
		margin-top: -8px !important;
	}

	:global(.custom-popup .maplibregl-popup-close-button) {
		background: rgba(0, 0, 0, 0.1) !important;
		color: #374151 !important;
		border-radius: 50% !important;
		width: 24px !important;
		height: 24px !important;
		font-size: 16px !important;
		font-weight: bold !important;
		line-height: 22px !important;
		right: 8px !important;
		top: 8px !important;
		transition: all 0.2s ease !important;
	}

	:global(.custom-popup .maplibregl-popup-close-button:hover) {
		background: rgba(0, 0, 0, 0.2) !important;
		transform: scale(1.1) !important;
	}

	/* Pulse animation for AQI indicators */
	@keyframes pulse-glow {
		0%, 100% {
			box-shadow: 0 0 5px currentColor;
			opacity: 1;
		}
		50% {
			box-shadow: 0 0 20px currentColor;
			opacity: 0.8;
		}
	}

	.pulse-glow {
		animation: pulse-glow 2s infinite;
	}
</style>