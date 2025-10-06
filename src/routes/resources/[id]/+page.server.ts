import type { EntryGenerator } from './$types';
import { relatedSDGs } from '$lib/data/resources';

// Prerender all SDG pages
export const entries: EntryGenerator = () => {
	return relatedSDGs.map(sdg => ({ id: sdg.id }));
};

export const prerender = true;
