<script lang="ts">
	import {
		MapLibre,
		GeoJSONSource,
		CircleLayer,
		Marker,
		Popup,
		GeolocateControl
	} from 'svelte-maplibre-gl';
	import { untrack } from 'svelte';
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
		onUserLocationChange?: (location: {lng: number, lat: number} | null) => void;
	}

	let { 
		stations = [],
		latestReadings = [],
		selectedStation = null,
		selectedCity = '',
		onStationSelect = () => {},
		onVisibleStationsChange = () => {},
		onUserLocationChange = () => {}
	}: Props = $props();

	// Debug logging (disabled to prevent excessive rendering)
	// $effect(() => {
	// 	console.log('MapComponent props updated:', {
	// 		stationsCount: stations.length,
	// 		readingsCount: latestReadings.length,
	// 	});
	// });

	let map = $state<Map | undefined>();
	let mapContainer: HTMLDivElement;
	let isMapReady = $state(false);
	let userLocation = $state<{lng: number, lat: number} | null>(null);

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
		console.log('flyToCity called for:', cityName);
		if (!map) {
			console.log('Map not available for city fly-to');
			return;
		}
		
		const cityInfo = CITY_INFO[cityName];
		if (!cityInfo) {
			console.log('No city info found for:', cityName);
			return;
		}
		
		const cityStations = stations.filter(s => s.city === cityName);
		
		if (cityStations.length === 0) {
			console.log('No stations in city, flying to city center:', cityInfo.center);
			map.flyTo({
				center: cityInfo.center,
				zoom: cityInfo.zoom || 11,
				duration: 1500,
				essential: true,
				pitch: 0,
				bearing: 0
			});
		} else {
			console.log(`Flying to ${cityStations.length} stations in ${cityName}`);
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

	// Create GeoJSON from stations - use stable derivation to prevent excessive updates
	const stationsGeoJSON = $derived({
		type: 'FeatureCollection' as const,
		features: stations.map(station => {
			const reading = latestReadings.find(r => r.station_id === station.id);
			return {
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
		})
	});

	// Track map bounds changes manually (not reactive)
	let mapBoundsChanged = $state(0);
	
	// Compute visible stations using proper $derived with enhanced bbox filtering
	const visibleStations = $derived.by(() => {
		// Force recalculation when map bounds or stations change
		mapBoundsChanged;
		
		if (!map || stations.length === 0) {
			return stations;
		}
		
		try {
			const bounds = map.getBounds();
			
			// Get visible stations by checking if they're within the viewport
			const stationsInView = stations.filter(station => {
				return bounds.contains([station.longitude, station.latitude]);
			});
			
			console.log(`Bbox filtering: ${stationsInView.length}/${stations.length} stations visible in current viewport`);
			return stationsInView;
		} catch (error) {
			console.warn('Error calculating visible stations:', error);
			return stations;
		}
	});

	// Track last notified stations outside of reactive context
	let lastNotifiedIds = '';
	
	// Properly notify parent when visible stations change
	$effect(() => {
		if (isMapReady && onVisibleStationsChange && visibleStations) {
			const currentIds = visibleStations.map(s => s.id).sort().join(',');
			
			if (currentIds !== lastNotifiedIds) {
				// Update tracking outside the reactive system
				untrack(() => {
					lastNotifiedIds = currentIds;
					onVisibleStationsChange(visibleStations);
				});
			}
		}
	});

	// Manual function to trigger bounds recalculation
	function updateVisibleStations() {
		mapBoundsChanged++;
	}

	// Watch for selectedStation changes and fly to them
	let previousSelectedStation: Station | null = null;
	$effect(() => {
		if (map && selectedStation && selectedStation !== previousSelectedStation) {
			console.log('Selected station changed, flying to:', selectedStation.name);
			flyToStation(selectedStation);
			previousSelectedStation = selectedStation;
		}
	});

	function handleMapLoad(event: any) {
		// Prevent multiple initializations
		if (map && isMapReady) {
			console.log('Map already loaded, skipping initialization');
			return;
		}
		
		map = event.detail;
		isMapReady = true;
		console.log('Map loaded, isMapReady:', isMapReady, 'stations:', stations.length);
		
		// Add map event listeners to update visible stations
		if (map) {
			map.on('moveend', updateVisibleStations);
			map.on('zoomend', updateVisibleStations);
			map.on('dragend', updateVisibleStations);
		}
		
		// Initial update
		updateVisibleStations();
		
		// Fit to all stations initially with delay to ensure map is ready
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

	// Geolocation handlers
	function handleGeolocate(event: any) {
		console.log('User location found:', event.coords);
		userLocation = {
			lng: event.coords.longitude,
			lat: event.coords.latitude
		};
		
		// Auto fly to user location if no station is selected
		if (map && !selectedStation) {
			map.flyTo({
				center: [event.coords.longitude, event.coords.latitude],
				zoom: 12,
				duration: 2000
			});
		}
		
		// Notify parent component about user location for nearest station finding
		if (onUserLocationChange) {
			onUserLocationChange(userLocation);
		}
		
		// Trigger a bounds update to potentially find nearest stations (disabled to prevent loops)
		// setTimeout(() => {
		// 	mapBoundsUpdateTrigger++;
		// }, 100);
	}

	function handleTrackUserLocationStart() {
		console.log('Started tracking user location');
	}

	function handleTrackUserLocationEnd() {
		console.log('Stopped tracking user location');
	}
</script>

<div bind:this={mapContainer} class="h-full w-full relative">
	<!-- Debug info -->
	<div class="absolute top-2 left-2 z-10 bg-black/70 text-white text-xs p-2 rounded">
		<div>Stations: {stations.length}</div>
		<div>Visible: {visibleStations.length} | Map: {map ? 'Ready' : 'Loading'}</div>
		{#if userLocation}
			<div>User: {userLocation.lat.toFixed(3)}, {userLocation.lng.toFixed(3)}</div>
		{:else}
			<div>User: Not located</div>
		{/if}
	</div>
	<MapLibre
		style="https://basemaps.cartocdn.com/gl/dark-matter-gl-style/style.json"
		class="h-full w-full"
		bind:map
		maxPitch={85}
		attributionControl={false}
		onload={handleMapLoad}
	>
		<!-- Markers will be rendered inside isMapReady block to avoid duplication -->
		
		{#if isMapReady}
			<!-- Geolocation Control -->
			<GeolocateControl
				position="top-right"
				positionOptions={{ enableHighAccuracy: true, timeout: 6000 }}
				trackUserLocation={true}
				showAccuracyCircle={true}
				showUserLocation={true}
				fitBoundsOptions={{ maxZoom: 15 }}
				ongeolocate={handleGeolocate}
				ontrackuserlocationstart={handleTrackUserLocationStart}
				ontrackuserlocationend={handleTrackUserLocationEnd}
			/>

			<!-- GeoJSON source with all stations (removed QueryRenderedFeatures to prevent loops) -->
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
				/>
			</GeoJSONSource>

			<!-- Render markers for all stations -->
			{#each stations as station (station.id)}
				{@const reading = latestReadings.find(r => r.station_id === station.id)}
				{#if reading}
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