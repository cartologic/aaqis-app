<script lang="ts">
	import { resolve } from '$app/paths';
	import { sdg13Targets, airQualityClimateConnection } from '$lib/data/sdg13';
	import type { Target, Indicator } from '$lib/data/sdg13';

	let expandedTargets = $state<Set<string>>(new Set());
	let selectedIndicator = $state<Indicator | null>(null);
	let showModal = $state(false);
	let iframeLoaded = $state(false);

	function toggleTarget(targetNumber: string) {
		if (expandedTargets.has(targetNumber)) {
			expandedTargets.delete(targetNumber);
		} else {
			expandedTargets.add(targetNumber);
		}
		expandedTargets = new Set(expandedTargets);
	}

	function openIndicatorData(indicator: Indicator) {
		if (indicator.dataUrl) {
			selectedIndicator = indicator;
			showModal = true;
			iframeLoaded = false;
		}
	}

	function closeModal() {
		showModal = false;
		selectedIndicator = null;
		iframeLoaded = false;
	}

	function handleIframeLoad() {
		iframeLoaded = true;
	}
</script>

<svelte:head>
	<title>SDG 13: Climate Action - AAQIS Resources</title>
	<meta
		name="description"
		content="Explore SDG 13 targets and indicators related to climate action and how air quality monitoring contributes to achieving them."
	/>
</svelte:head>

<div class="min-h-screen bg-gradient-to-br from-blue-50 via-white to-green-50">
	<!-- Header with back button -->
	<div class="bg-white border-b border-gray-200 sticky top-0 z-50 shadow-sm">
		<div class="container mx-auto px-4 py-4">
			<div class="flex items-center gap-4">
				<a
					href={resolve('/resources')}
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

	<!-- SDG 13 Header Banner -->
	<div class="border-b border-gray-200" style="background-color: #3F7E4415">
		<div class="container mx-auto px-4 py-8 md:py-12">
			<div class="flex items-start gap-4 md:gap-6">
				<span class="text-5xl md:text-6xl">🌍</span>
				<div class="flex-1">
					<div class="text-sm md:text-base font-semibold mb-2" style="color: #3F7E44">
						Sustainable Development Goal 13
					</div>
					<h1 class="text-3xl md:text-5xl font-bold text-gray-900 mb-3 md:mb-4">Climate Action</h1>
					<p class="text-base md:text-lg text-gray-700 leading-relaxed max-w-4xl">
						Take urgent action to combat climate change and its impacts. Air quality and climate change share
						common sources - burning fossil fuels releases both greenhouse gases and air pollutants.
					</p>
				</div>
			</div>
		</div>
	</div>

	<!-- Main Content -->
	<div class="container mx-auto px-4 py-8 md:py-12">
		<!-- Air Quality & Climate Connection -->
		<section class="mb-12">
			<div class="bg-white rounded-xl shadow-lg p-6 md:p-8">
				<h2 class="text-2xl md:text-3xl font-bold text-gray-900 mb-4">
					{airQualityClimateConnection.title}
				</h2>
				<p class="text-base md:text-lg text-gray-700 leading-relaxed mb-8">
					{airQualityClimateConnection.description}
				</p>

				<!-- Key Points Grid -->
				<div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
					{#each airQualityClimateConnection.keyPoints as point}
						<div class="flex gap-4 p-4 bg-blue-50 rounded-lg">
							<span class="text-3xl flex-shrink-0">{point.icon}</span>
							<div>
								<h3 class="font-semibold text-gray-900 mb-1">{point.title}</h3>
								<p class="text-sm text-gray-600 leading-relaxed">{point.description}</p>
							</div>
						</div>
					{/each}
				</div>

				<!-- African Context -->
				<div class="grid grid-cols-1 md:grid-cols-2 gap-6">
					<div class="bg-orange-50 rounded-lg p-6">
						<h3 class="text-xl font-bold text-gray-900 mb-4 flex items-center gap-2">
							<span>⚠️</span>
							<span>Challenges</span>
						</h3>
						<ul class="space-y-2">
							{#each airQualityClimateConnection.africanContext.challenges as challenge}
								<li class="flex gap-2 text-gray-700">
									<span class="text-orange-600 font-bold flex-shrink-0">•</span>
									<span class="text-sm leading-relaxed">{challenge}</span>
								</li>
							{/each}
						</ul>
					</div>

					<div class="bg-green-50 rounded-lg p-6">
						<h3 class="text-xl font-bold text-gray-900 mb-4 flex items-center gap-2">
							<span>✨</span>
							<span>Opportunities</span>
						</h3>
						<ul class="space-y-2">
							{#each airQualityClimateConnection.africanContext.opportunities as opportunity}
								<li class="flex gap-2 text-gray-700">
									<span class="text-green-600 font-bold flex-shrink-0">•</span>
									<span class="text-sm leading-relaxed">{opportunity}</span>
								</li>
							{/each}
						</ul>
					</div>
				</div>
			</div>
		</section>

		<!-- Targets and Indicators -->
		<section class="mb-12">
			<div class="mb-6">
				<h2 class="text-2xl md:text-3xl font-bold text-gray-900 mb-2">Targets & Indicators</h2>
				<p class="text-gray-600">
					SDG 13 has {sdg13Targets.length} targets and {sdg13Targets.reduce((sum, t) => sum + t.indicators.length, 0)} indicators
					to measure progress on climate action.
				</p>
			</div>

			<div class="space-y-4">
				{#each sdg13Targets as target}
					<div class="bg-white rounded-xl shadow-lg overflow-hidden border border-gray-200">
						<!-- Target Header (Clickable) -->
						<button
							onclick={() => toggleTarget(target.number)}
							class="w-full px-6 py-4 flex items-start gap-4 hover:bg-gray-50 transition-colors text-left"
						>
							<div
								class="flex-shrink-0 w-16 h-16 rounded-lg flex items-center justify-center text-xl font-bold text-white"
								style="background-color: #3F7E44"
							>
								{target.number}
							</div>
							<div class="flex-1 min-w-0">
								<h3 class="text-lg font-bold text-gray-900 mb-1">Target {target.number}</h3>
								<p class="text-gray-700 leading-relaxed">{target.description}</p>
							</div>
							<div class="flex-shrink-0 ml-2">
								<svg
									class="w-6 h-6 text-gray-400 transition-transform {expandedTargets.has(target.number)
										? 'rotate-180'
										: ''}"
									fill="none"
									stroke="currentColor"
									viewBox="0 0 24 24"
								>
									<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 9l-7 7-7-7"></path>
								</svg>
							</div>
						</button>

						<!-- Indicators (Expandable) -->
						{#if expandedTargets.has(target.number)}
							<div class="px-6 pb-6 border-t border-gray-200 bg-gray-50">
								<div class="pt-4">
									<h4 class="text-sm font-semibold text-gray-700 uppercase tracking-wide mb-3">
										Indicators ({target.indicators.length})
									</h4>
									<div class="space-y-3">
										{#each target.indicators as indicator}
											<button
												onclick={() => openIndicatorData(indicator)}
												class="w-full bg-white rounded-lg p-4 border border-gray-200 hover:border-blue-500 hover:shadow-md transition-all group text-left"
												disabled={!indicator.dataUrl}
											>
												<div class="flex gap-3">
													<div
														class="flex-shrink-0 w-10 h-10 rounded-lg flex items-center justify-center text-xs font-bold text-white"
														style="background-color: #56C02B"
													>
														{indicator.number}
													</div>
													<div class="flex-1">
														<div class="text-xs font-semibold text-gray-500 mb-1">
															Indicator {indicator.number}
														</div>
														<p class="text-sm text-gray-700 leading-relaxed">{indicator.description}</p>
														{#if indicator.dataUrl}
															<div class="mt-2 flex items-center gap-2 text-blue-600 text-sm font-medium">
																<svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
																	<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z"></path>
																</svg>
																<span class="group-hover:underline">View Data for Africa</span>
															</div>
														{/if}
													</div>
												</div>
											</button>
										{/each}
									</div>
								</div>
							</div>
						{/if}
					</div>
				{/each}
			</div>
		</section>

		<!-- External Resources -->
		<section class="mb-12">
			<div class="bg-white rounded-xl shadow-lg p-6 md:p-8">
				<h2 class="text-2xl font-bold text-gray-900 mb-6">Learn More</h2>
				<div class="grid grid-cols-1 md:grid-cols-2 gap-4">
					<a
						href="https://unstats.un.org/sdgs/report/2023/goal-13/"
						target="_blank"
						rel="noopener noreferrer"
						class="flex items-center gap-4 p-4 border border-gray-200 rounded-lg hover:border-blue-500 hover:shadow-md transition-all group"
					>
						<div class="flex-shrink-0 w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center">
							<span class="text-2xl">📊</span>
						</div>
						<div class="flex-1">
							<h3 class="font-semibold text-gray-900 group-hover:text-blue-600 transition-colors">
								UN SDG 13 Report
							</h3>
							<p class="text-sm text-gray-600">Official progress report and data</p>
						</div>
						<svg class="w-5 h-5 text-gray-400 group-hover:text-blue-600 transition-colors" fill="none" stroke="currentColor" viewBox="0 0 24 24">
							<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5l7 7-7 7"></path>
						</svg>
					</a>

					<a
						href="https://unstats.un.org/sdgs/metadata/?Text=&Goal=13&Target="
						target="_blank"
						rel="noopener noreferrer"
						class="flex items-center gap-4 p-4 border border-gray-200 rounded-lg hover:border-blue-500 hover:shadow-md transition-all group"
					>
						<div class="flex-shrink-0 w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center">
							<span class="text-2xl">📋</span>
						</div>
						<div class="flex-1">
							<h3 class="font-semibold text-gray-900 group-hover:text-blue-600 transition-colors">
								Indicator Metadata
							</h3>
							<p class="text-sm text-gray-600">Detailed methodology and definitions</p>
						</div>
						<svg class="w-5 h-5 text-gray-400 group-hover:text-blue-600 transition-colors" fill="none" stroke="currentColor" viewBox="0 0 24 24">
							<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5l7 7-7 7"></path>
						</svg>
					</a>
				</div>
			</div>
		</section>
	</div>

	<!-- Call to Action -->
	<div class="container mx-auto px-4 pb-12">
		<div class="bg-gradient-to-r from-blue-600 to-green-600 rounded-xl text-white p-8">
			<h2 class="text-2xl md:text-3xl font-bold mb-4">How AAQIS Contributes to SDG 13</h2>
			<p class="text-blue-100 mb-6 leading-relaxed max-w-3xl">
				The AAQIS platform provides real-time air quality data that helps policymakers, researchers,
				and citizens understand the connection between air pollution and climate change. By monitoring
				pollutants like black carbon and particulate matter, we can identify opportunities to reduce
				both air pollution and greenhouse gas emissions simultaneously.
			</p>
			<div class="flex flex-col sm:flex-row gap-4">
				<a
					href={resolve('/')}
					class="inline-block bg-white text-blue-600 px-6 py-3 rounded-lg font-semibold hover:bg-blue-50 transition-colors text-center"
				>
					Explore Air Quality Data
				</a>
				<a
					href={resolve('/resources')}
					class="inline-block bg-transparent border-2 border-white text-white px-6 py-3 rounded-lg font-semibold hover:bg-white/10 transition-colors text-center"
				>
					View Other SDGs
				</a>
			</div>
		</div>
	</div>

	<!-- Data Modal -->
	{#if showModal && selectedIndicator}
		<div
			class="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm p-2 md:p-4"
			onclick={closeModal}
			onkeydown={(e) => e.key === 'Escape' && closeModal()}
			role="button"
			tabindex="-1"
			aria-label="Close modal overlay"
		>
			<div
				class="bg-white rounded-xl shadow-2xl w-full h-full md:h-[95vh] flex flex-col"
				onclick={(e) => e.stopPropagation()}
				onkeydown={(e) => e.stopPropagation()}
				role="dialog"
				aria-modal="true"
				tabindex="0"
			>
				<!-- Modal Header - Compact -->
				<div class="flex items-center justify-between px-4 py-3 border-b border-gray-200 bg-gray-50">
					<div class="flex items-center gap-3">
						<div
							class="flex-shrink-0 w-8 h-8 rounded-lg flex items-center justify-center text-xs font-bold text-white"
							style="background-color: #56C02B"
						>
							{selectedIndicator.number}
						</div>
						<div>
							<h3 class="text-sm font-semibold text-gray-900">
								Indicator {selectedIndicator.number}
							</h3>
							<p class="text-xs text-gray-600 max-w-2xl truncate">{selectedIndicator.description}</p>
						</div>
					</div>
					<button
						onclick={closeModal}
						class="flex-shrink-0 ml-4 p-1.5 hover:bg-gray-200 rounded-lg transition-colors"
						aria-label="Close modal"
					>
						<svg class="w-5 h-5 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
							<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12"></path>
						</svg>
					</button>
				</div>

				<!-- Modal Content -->
				<div class="flex-1 relative overflow-hidden" style="min-height: 70vh;">
					{#if !iframeLoaded}
						<div class="absolute inset-0 flex items-center justify-center bg-gray-50 z-10">
							<div class="text-center">
								<div class="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
								<p class="text-gray-600">Loading data visualization...</p>
							</div>
						</div>
					{/if}
					<iframe
						src={selectedIndicator.dataUrl}
						title="Indicator {selectedIndicator.number} Data"
						class="w-full h-full border-0"
						style="min-height: 70vh; height: 100%;"
						sandbox="allow-same-origin allow-scripts allow-popups allow-forms"
						onload={handleIframeLoad}
					></iframe>
				</div>

				<!-- Modal Footer - Compact -->
				<div class="px-4 py-2 border-t border-gray-200 bg-gray-50 flex items-center justify-between">
					<a
						href={selectedIndicator.dataUrl}
						target="_blank"
						rel="noopener noreferrer"
						class="inline-flex items-center gap-1.5 text-blue-600 hover:text-blue-700 font-medium text-xs"
					>
						<svg class="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
							<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14"></path>
						</svg>
						<span>Open in new tab</span>
					</a>
					<button
						onclick={closeModal}
						class="px-3 py-1.5 bg-gray-600 text-white rounded-lg hover:bg-gray-700 transition-colors font-medium text-xs"
					>
						Close
					</button>
				</div>
			</div>
		</div>
	{/if}
</div>
