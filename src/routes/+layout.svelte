<script module lang="ts">
	import posthog from 'posthog-js';
	import { browser } from '$app/environment';

	export const load = async () => {
		if (browser) {
			posthog.init('phc_4AqKT2zkK6EPXV1f1Swweaf1UDAGmK9eUi2u71FYcby', {
				api_host: 'https://eu.i.posthog.com',
				capture_pageview: true,
				capture_pageleave: true,
				defaults: '2025-05-24',
				person_profiles: 'identified_only',
				// Enhanced settings for air quality monitoring app
				property_denylist: ['$lib', '$initial_person_info'], // Privacy compliance
				respect_dnt: true, // Respect Do Not Track
				loaded: posthog => {
					console.log('📊 PostHog Analytics initialized for AAQIS');
					// Track app initialization
					posthog.capture('app_initialized', {
						app_name: 'AAQIS',
						app_version: '1.0.0',
						timestamp: new Date().toISOString()
					});
				}
			});
		}

		return {};
	};
</script>

<script lang="ts">
	import '../app.css';
	import favicon from '$lib/assets/favicon.svg';

	let { children } = $props();
</script>

<svelte:head>
	<link rel="icon" href={favicon} />
</svelte:head>

{@render children?.()}
