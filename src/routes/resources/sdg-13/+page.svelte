<script lang="ts">
	import { resolve } from '$app/paths';
	import { sdg13Targets, airQualityClimateConnection } from '$lib/data/sdg13';
	import type { Target } from '$lib/data/sdg13';

	let expandedTargets = $state<Set<string>>(new Set());

	function toggleTarget(targetNumber: string) {
		if (expandedTargets.has(targetNumber)) {
			expandedTargets.delete(targetNumber);
		} else {
			expandedTargets.add(targetNumber);
		}
		expandedTargets = new Set(expandedTargets);
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
											<div class="bg-white rounded-lg p-4 border border-gray-200">
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
													</div>
												</div>
											</div>
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
</div>
