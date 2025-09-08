<script lang="ts">
	import {
		MapLibre,
		GeoJSONSource,
		CircleLayer,
		Marker,
		Popup,
		QueryRenderedFeatures
	} from 'svelte-maplibre-gl';
	import maplibregl from 'maplibre-gl';
	import type { Map, MapGeoJSONFeature } from 'maplibre-gl';
	import type { AirQualityReading, Station } from '$lib/types.js';
	import { getAQIColor, getAQIDescription, CITY_INFO } from '$lib/types.js';
	import { getAQIEmoji } from '$lib/dataUtils.js';

	interface Props {
		stations?: Station[];
		latestReadings?: AirQualityReading[];
		selectedStation?: Station | null;
		selectedCity?: string;
		onStationSelect?: (station: Station) => void;
		onVisibleStationsChange?: (stations: Station[]) => void;
	}

	let { 
		stations = [],
		latestReadings = [],
		selectedStation = null,
		selectedCity = '',
		onStationSelect = () => {},
		onVisibleStationsChange = () => {}
	}: Props = $props();

	// Debug logging
	$effect(() => {
		console.log('MapComponent props updated:', {
			stationsCount: stations.length,
			readingsCount: latestReadings.length,
			stations: stations.slice(0, 3),
			readings: latestReadings.slice(0, 3)
		});
		
		// Log the first station in detail
		if (stations.length > 0) {
			console.log('First station details:', stations[0]);
			console.log('Station has lat/lon?', 'lat' in stations[0], 'lon' in stations[0]);
			console.log('Station latitude/longitude:', stations[0].latitude, stations[0].longitude);
		}
	});

	let map = $state<Map | undefined>();
	let mapContainer: HTMLDivElement;
	let renderedFeatures = $state<MapGeoJSONFeature[]>([]);
	let isMapReady = $state(false);
	let mapBoundsUpdateTrigger = $state(0);
	let center = $state<[number, number]>([30, -5]);
	let zoom = $state(4);
	let pitch = $state(0);
	let bearing = $state(0);

	// Export methods for parent component
	export function flyToStation(station: Station) {
		console.log('flyToStation called:', station.id, station.name, 'map available:', !!map);
		if (!map) {
			console.log('Map not available, cannot fly to station');
			return;
		}
		
		const cityInfo = CITY_INFO[station.city];
		const zoom = cityInfo?.zoom || 14;
		
		console.log('Flying to station:', station.name, 'at', [station.longitude, station.latitude], 'zoom:', zoom);
		
		map.flyTo({
			center: [station.longitude, station.latitude],
			zoom: zoom,
			duration: 1500,
			essential: true,
			pitch: 30,
			bearing: 0
		});
	}

	export function flyToCity(cityName: string) {
		if (!map) return;
		
		const cityInfo = CITY_INFO[cityName];
		if (!cityInfo) return;
		
		const cityStations = stations.filter(s => s.city === cityName);
		
		if (cityStations.length === 0) {
			map.flyTo({
				center: cityInfo.center,
				zoom: cityInfo.zoom || 11,
				duration: 1500,
				essential: true,
				pitch: 0,
				bearing: 0
			});
		} else {
			fitToStations(cityStations);
		}
	}

	export function fitToStations(stationsToFit: Station[] = stations) {
		if (!map || stationsToFit.length === 0) return;
		
		if (stationsToFit.length === 1) {
			flyToStation(stationsToFit[0]);
			return;
		}
		
		const bounds = new maplibregl.LngLatBounds();
		stationsToFit.forEach(station => {
			bounds.extend([station.longitude, station.latitude]);
		});
		
		map.fitBounds(bounds, {
			padding: { top: 50, bottom: 50, left: 50, right: 50 },
			duration: 1500,
			maxZoom: 13
		});
	}

	// Create GeoJSON from stations
	const stationsGeoJSON = $derived.by(() => {
		console.log('Creating GeoJSON from stations:', stations.length);
		if (stations.length > 0) {
			console.log('Sample station for GeoJSON:', stations[0]);
		}
		const geojson = {
			type: 'FeatureCollection' as const,
			features: stations.map(station => {
				const reading = latestReadings.find(r => r.station_id === station.id);
				const feature = {
					type: 'Feature' as const,
					id: station.id,
					geometry: {
						type: 'Point' as const,
						coordinates: [station.longitude, station.latitude]
					},
					properties: {
						...station,
						station_id: station.id,
						station_name: station.name,
						aqi: reading?.overall_aqi || 0,
						rating: reading?.overall_rating || 'good',
						pm2_5: reading?.pm2_5 || 0,
						pm10: reading?.pm10 || 0,
						o3: reading?.o3 || 0,
						no2: reading?.no2 || 0,
						so2: reading?.so2 || 0,
						co: reading?.co || 0,
						color: reading ? getAQIColor(reading.overall_rating) : '#6b7280',
						emoji: reading ? getAQIEmoji(reading.overall_rating) : '😐',
						hasReading: !!reading
					}
				};
				
				// Log first feature for debugging
				if (station.id === stations[0]?.id) {
					console.log('First GeoJSON feature:', feature);
				}
				
				return feature;
		})
		};
		console.log('GeoJSON created:', geojson);
		return geojson;
	});

	// Compute visible stations based on map bounds
	const visibleStations = $derived.by(() => {
		// Force recalculation when bounds change
		mapBoundsUpdateTrigger;
		
		if (!map || stations.length === 0) {
			console.log('No map or stations, showing all:', stations.length);
			return stations;
		}
		
		try {
			const bounds = map.getBounds();
			const sw = bounds.getSouthWest();
			const ne = bounds.getNorthEast();
			
			console.log('Map bounds:', {
				southwest: [sw.lng, sw.lat],
				northeast: [ne.lng, ne.lat],
				center: center,
				zoom: zoom
			});
			
			const visible = stations.filter(station => {
				const lat = station.latitude;
				const lng = station.longitude;
				const inBounds = bounds.contains([lng, lat]);
				
				// Log first few stations for debugging
				if (stations.indexOf(station) < 3) {
					console.log(`Station ${station.id} (${lng}, ${lat}): ${inBounds ? 'IN' : 'OUT'} bounds`);
				}
				
				return inBounds;
			});
			
			console.log(`Visible stations: ${visible.length}/${stations.length} in current bounds`);
			console.log('Visible station IDs:', visible.map(s => s.id));
			
			return visible;
		} catch (error) {
			console.log('Error getting map bounds, showing all stations:', error);
			return stations;
		}
	});

	// Notify parent when visible stations change
	$effect(() => {
		if (isMapReady && visibleStations) {
			onVisibleStationsChange(visibleStations);
		}
	});

	// Auto-fly to selected station
	$effect(() => {
		if (map && selectedStation) {
			flyToStation(selectedStation);
		}
	});

	// Auto-fly to selected city when no station is selected
	$effect(() => {
		if (map && selectedCity && !selectedStation) {
			flyToCity(selectedCity);
		}
	});

	function handleMapLoad(event: any) {
		map = event.detail;
		isMapReady = true;
		console.log('Map loaded, isMapReady:', isMapReady, 'stations:', stations.length);
		
		// Add comprehensive map event listeners
		map.on('movestart', () => console.log('Map movestart'));
		map.on('move', () => console.log('Map move'));
		map.on('moveend', () => {
			mapBoundsUpdateTrigger++;
			console.log('Map moveend - updating visible stations, trigger:', mapBoundsUpdateTrigger);
		});
		
		map.on('zoomstart', () => console.log('Map zoomstart'));
		map.on('zoom', () => console.log('Map zoom'));
		map.on('zoomend', () => {
			mapBoundsUpdateTrigger++;
			console.log('Map zoomend - updating visible stations, trigger:', mapBoundsUpdateTrigger);
		});
		
		map.on('dragend', () => {
			mapBoundsUpdateTrigger++;
			console.log('Map dragend - updating visible stations');
		});
		
		// Initial bounds update after a delay
		setTimeout(() => {
			mapBoundsUpdateTrigger++;
			console.log('Initial bounds update trigger:', mapBoundsUpdateTrigger);
		}, 500);
		
		// Fit to all stations initially
		if (stations.length > 0) {
			console.log('Fitting to stations on load:', stations.length);
			setTimeout(() => fitToStations(), 1000);
		}
	}

	function handleStationClick(station: Station) {
		console.log('Station clicked:', station.id, station.name);
		onStationSelect(station);
		// Auto fly to station when clicked
		flyToStation(station);
	}

	function formatRating(rating: string): string {
		return rating
			.replace(/_/g, ' ')
			.replace(/\b\w/g, l => l.toUpperCase());
	}
</script>

<div bind:this={mapContainer} class="h-full w-full relative">
	<!-- Debug info -->
	<div class="absolute top-2 left-2 z-10 bg-black/70 text-white text-xs p-2 rounded">
		<div>Center: {center[1].toFixed(3)}, {center[0].toFixed(3)}</div>
		<div>Zoom: {zoom.toFixed(1)} | Stations: {stations.length}</div>
		<div>Visible: {visibleStations.length} | Map: {map ? 'Ready' : 'Loading'}</div>
	</div>
	<MapLibre
		style="https://basemaps.cartocdn.com/gl/dark-matter-gl-style/style.json"
		class="h-full w-full"
		bind:map
		bind:zoom
		bind:center
		bind:pitch
		bind:bearing
		maxPitch={85}
		attributionControl={false}
		on:load={handleMapLoad}
	>
		{console.log('MapLibre component rendering:', {
			isMapReady, 
			stationsCount: stations.length, 
			center, 
			zoom, 
			mapAvailable: !!map
		})}
		
		<!-- Render markers for all stations (outside isMapReady check) -->
		{#each stations as station (station.id)}
			{@const reading = latestReadings.find(r => r.station_id === station.id)}
			{#if reading}
				<!-- Log marker rendering -->
				{console.log('Rendering marker for station:', station.id, station.latitude, station.longitude)}
				{@const statusEmoji = getAQIEmoji(reading.overall_rating)}
				<Marker lnglat={[station.longitude, station.latitude]} draggable={false}>
					{#snippet content()}
						<div 
							class="text-center leading-none cursor-pointer transform hover:scale-110 transition-all duration-200 {selectedStation?.id === station.id ? 'scale-125 ring-4 ring-blue-400 ring-opacity-50 rounded-full' : ''}"
							onclick={() => handleStationClick(station)}
							onkeydown={(e) => e.key === 'Enter' && handleStationClick(station)}
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
				</Marker>
			{/if}
		{/each}
		
		{#if isMapReady}
			<!-- GeoJSON source with all stations -->
			<GeoJSONSource
				id="stations"
				data={stationsGeoJSON}
			>
				<!-- Hidden layer for querying -->
				<CircleLayer
					id="stations-layer"
					paint={{
						'circle-radius': 0,
						'circle-opacity': 0
					}}
				>
					<!-- Query rendered features to get what's visible in viewport -->
					<QueryRenderedFeatures bind:features={renderedFeatures} />
				</CircleLayer>
			</GeoJSONSource>

			<!-- Render markers for all stations -->
			{#each stations as station (station.id)}
				{@const reading = latestReadings.find(r => r.station_id === station.id)}
				{#if reading}
					<!-- Log marker rendering -->
					{console.log('Rendering marker for station:', station.id, station.latitude, station.longitude)}
					{@const statusEmoji = getAQIEmoji(reading.overall_rating)}
					<Marker lnglat={[station.longitude, station.latitude]} draggable={false}>
						{#snippet content()}
							<div 
								class="text-center leading-none cursor-pointer transform hover:scale-110 transition-all duration-200 {selectedStation?.id === station.id ? 'scale-125 ring-4 ring-blue-400 ring-opacity-50 rounded-full' : ''}"
								onclick={() => handleStationClick(station)}
								onkeydown={(e) => e.key === 'Enter' && handleStationClick(station)}
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
		{/if}
	</MapLibre>
</div>

<style>
	:global(.marker-container) {
		cursor: pointer;
	}

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