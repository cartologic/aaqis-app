<script lang="ts">
	import { resolve } from '$app/paths';
	import { resourceSections, type SDG, type CityPortal } from '$lib/data/resources';

	function isSDG(item: SDG | CityPortal): item is SDG {
		return 'number' in item;
	}

	function isCityPortal(item: SDG | CityPortal): item is CityPortal {
		return 'city' in item;
	}

	function handleResourceClick(item: SDG | CityPortal) {
		if (isSDG(item)) {
			if (item.type === 'external') {
				window.open(item.url, '_blank');
			} else if (item.type === 'page') {
				// Navigate to custom page (already has base path in URL)
				window.location.href = item.url.startsWith('http') ? item.url : resolve(item.url as any);
			} else if (item.type === 'iframe') {
				// Navigate to detail page with iframe
				window.location.href = resolve(`/resources/${item.id}` as any);
			} else {
				// Navigate to detail page
				window.location.href = resolve(`/resources/${item.id}` as any);
			}
		} else if (isCityPortal(item)) {
			// City portals always open in new tab
			window.open(item.url, '_blank');
		}
	}
</script>

<svelte:head>
	<title>Resources - AAQIS</title>
	<meta
		name="description"
		content="Resources, SDGs, and city portals related to air quality monitoring in Africa"
	/>
</svelte:head>

<!-- Resources Page -->
<div class="min-h-screen bg-gradient-to-br from-blue-50 via-white to-green-50">
	<!-- Hero Section -->
	<section class="bg-gradient-to-r from-blue-600 to-green-600 text-white py-16">
		<div class="container mx-auto px-4">
			<div class="max-w-4xl mx-auto text-center">
				<h1 class="text-4xl md:text-5xl font-bold mb-4">Resources</h1>
				<p class="text-xl md:text-2xl text-blue-100">
					Explore connections between air quality, sustainable development, and African cities
				</p>
			</div>
		</div>
	</section>

	<!-- Resources Sections -->
	<div class="container mx-auto px-4 py-12">
		{#each resourceSections as section}
			<section class="mb-16">
				<!-- Section Header -->
				<div class="mb-8">
					<div class="flex items-center gap-3 mb-3">
						<span class="text-4xl">{section.icon}</span>
						<h2 class="text-3xl font-bold text-gray-800">{section.title}</h2>
					</div>
					<p class="text-lg text-gray-600 ml-14">{section.description}</p>
				</div>

				<!-- Cards Grid -->
				<div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
					{#each section.items as item}
						{#if isSDG(item)}
							<!-- SDG Card -->
							<button
								onclick={() => handleResourceClick(item)}
								class="group bg-white rounded-xl shadow-lg hover:shadow-2xl transition-all duration-300 p-6 text-left border-t-4 hover:scale-105"
								style="border-color: {item.color}"
							>
								<div class="flex items-start justify-between mb-4">
									<div class="flex items-center gap-3">
										<span class="text-4xl">{item.icon}</span>
										<div>
											<div class="text-sm font-semibold text-gray-500">SDG {item.number}</div>
											<h3 class="text-xl font-bold text-gray-800 group-hover:text-blue-600 transition-colors">
												{item.title}
											</h3>
										</div>
									</div>
								</div>
								<p class="text-gray-600 text-sm leading-relaxed mb-4">
									{item.description}
								</p>
								<div class="flex items-center text-blue-600 text-sm font-medium">
									{#if item.type === 'iframe'}
										<span>View Details</span>
										<svg class="w-4 h-4 ml-1 group-hover:translate-x-1 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
											<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5l7 7-7 7"></path>
										</svg>
									{:else}
										<span>Learn More</span>
										<svg class="w-4 h-4 ml-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
											<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14"></path>
										</svg>
									{/if}
								</div>
							</button>
						{:else if (isCityPortal(item))}
							<!-- City Portal Card -->
							<button
								onclick={() => handleResourceClick(item)}
								class="group bg-white rounded-xl shadow-lg hover:shadow-2xl transition-all duration-300 p-6 text-left hover:scale-105"
							>
								<div class="flex items-start gap-4 mb-4">
									<span class="text-5xl">{item.icon}</span>
									<div class="flex-1">
										<h3 class="text-xl font-bold text-gray-800 group-hover:text-blue-600 transition-colors mb-1">
											{item.city}
										</h3>
										<p class="text-sm text-gray-500">{item.country}</p>
									</div>
								</div>
								<p class="text-gray-600 text-sm leading-relaxed mb-4">
									{item.description}
								</p>
								<div class="flex items-center text-blue-600 text-sm font-medium">
									<span>Visit Portal</span>
									<svg class="w-4 h-4 ml-1 group-hover:translate-x-1 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
										<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14"></path>
									</svg>
								</div>
							</button>
						{/if}
					{/each}
				</div>
			</section>
		{/each}
	</div>

	<!-- Call to Action -->
	<section class="bg-blue-600 text-white py-12">
		<div class="container mx-auto px-4 text-center">
			<h2 class="text-3xl font-bold mb-4">Contribute to Clean Air in Africa</h2>
			<p class="text-xl text-blue-100 mb-6 max-w-2xl mx-auto">
				Air quality monitoring helps achieve multiple SDGs. Explore the data and take action for a healthier future.
			</p>
			<a
				href={resolve('/')}
				class="inline-block bg-white text-blue-600 px-8 py-3 rounded-lg font-semibold hover:bg-blue-50 transition-colors"
			>
				View Air Quality Data
			</a>
		</div>
	</section>
</div>
