<script lang="ts">
	import { page } from '$app/stores';
	import type { PageData } from './$types';

	let { data }: { data: PageData } = $props();
	let iframeLoaded = $state(false);
	let iframeError = $state(false);

	function handleIframeLoad() {
		iframeLoaded = true;
	}

	function handleIframeError() {
		iframeError = true;
	}
</script>

<svelte:head>
	<title>{data.sdg.title} - AAQIS Resources</title>
	<meta name="description" content={data.sdg.description} />
</svelte:head>

<div class="min-h-screen bg-gradient-to-br from-blue-50 via-white to-green-50">
	<!-- Header with back button -->
	<div class="bg-white border-b border-gray-200 sticky top-0 z-50 shadow-sm">
		<div class="container mx-auto px-4 py-4">
			<div class="flex items-center gap-4">
				<a
					href="/resources"
					class="flex items-center gap-2 text-gray-600 hover:text-gray-900 transition-colors"
				>
					<svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
						<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 19l-7-7 7-7"></path>
					</svg>
					<span class="font-medium">Back to Resources</span>
				</a>
			</div>
		</div>
	</div>

	<!-- SDG Info Banner -->
	<div class="border-b border-gray-200" style="background-color: {data.sdg.color}15">
		<div class="container mx-auto px-4 py-8">
			<div class="flex items-start gap-4">
				<span class="text-5xl">{data.sdg.icon}</span>
				<div class="flex-1">
					<div class="text-sm font-semibold mb-1" style="color: {data.sdg.color}">
						Sustainable Development Goal {data.sdg.number}
					</div>
					<h1 class="text-3xl md:text-4xl font-bold text-gray-900 mb-3">{data.sdg.title}</h1>
					<p class="text-lg text-gray-700 leading-relaxed max-w-4xl">
						{data.sdg.description}
					</p>
				</div>
			</div>
		</div>
	</div>

	<!-- Content -->
	<div class="container mx-auto px-4 py-8">
		{#if data.sdg.type === 'iframe'}
			<!-- Iframe Content -->
			<div class="bg-white rounded-xl shadow-lg overflow-hidden">
				{#if !iframeLoaded && !iframeError}
					<div class="flex items-center justify-center py-20">
						<div class="text-center">
							<div class="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
							<p class="text-gray-600">Loading SDG content...</p>
						</div>
					</div>
				{/if}

				{#if iframeError}
					<div class="p-12 text-center">
						<div class="text-5xl mb-4">⚠️</div>
						<h3 class="text-xl font-semibold text-gray-800 mb-2">Unable to load content</h3>
						<p class="text-gray-600 mb-6">The content couldn't be displayed due to security restrictions.</p>
						<a
							href={data.sdg.url}
							target="_blank"
							rel="noopener noreferrer"
							class="inline-flex items-center gap-2 bg-blue-600 text-white px-6 py-3 rounded-lg font-medium hover:bg-blue-700 transition-colors"
						>
							<span>View on UN Website</span>
							<svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
								<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14"></path>
							</svg>
						</a>
					</div>
				{/if}

				<iframe
					src={data.sdg.url}
					title={data.sdg.title}
					class="w-full border-0 {iframeLoaded && !iframeError ? 'block' : 'hidden'}"
					style="height: 800px; min-height: 70vh;"
					onload={handleIframeLoad}
					onerror={handleIframeError}
					sandbox="allow-same-origin allow-scripts allow-popups allow-forms"
				></iframe>
			</div>

			<!-- External Link Fallback -->
			<div class="mt-6 text-center">
				<a
					href={data.sdg.url}
					target="_blank"
					rel="noopener noreferrer"
					class="inline-flex items-center gap-2 text-blue-600 hover:text-blue-700 font-medium"
				>
					<span>Open in new tab</span>
					<svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
						<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14"></path>
					</svg>
				</a>
			</div>
		{:else}
			<!-- Regular content page (if we have custom content in the future) -->
			<div class="bg-white rounded-xl shadow-lg p-8">
				<p class="text-gray-600 mb-6">{data.sdg.description}</p>
				<a
					href={data.sdg.url}
					target="_blank"
					rel="noopener noreferrer"
					class="inline-flex items-center gap-2 bg-blue-600 text-white px-6 py-3 rounded-lg font-medium hover:bg-blue-700 transition-colors"
				>
					<span>Learn More</span>
					<svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
						<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14"></path>
					</svg>
				</a>
			</div>
		{/if}
	</div>

	<!-- Related Actions -->
	<div class="container mx-auto px-4 pb-12">
		<div class="bg-gradient-to-r from-blue-600 to-green-600 rounded-xl text-white p-8">
			<h2 class="text-2xl font-bold mb-4">How Air Quality Monitoring Contributes to SDG {data.sdg.number}</h2>
			<p class="text-blue-100 mb-6 leading-relaxed">
				The AAQIS platform provides real-time air quality data that helps policymakers, researchers,
				and citizens make informed decisions contributing to {data.sdg.title.toLowerCase()}.
			</p>
			<a
				href="/"
				class="inline-block bg-white text-blue-600 px-6 py-3 rounded-lg font-semibold hover:bg-blue-50 transition-colors"
			>
				Explore Air Quality Data
			</a>
		</div>
	</div>
</div>
