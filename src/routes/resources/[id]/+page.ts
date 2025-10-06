import { error } from '@sveltejs/kit';
import { relatedSDGs } from '$lib/data/resources';
import type { PageLoad } from './$types';

export const load: PageLoad = ({ params }) => {
	const sdg = relatedSDGs.find(s => s.id === params.id);

	if (!sdg) {
		error(404, 'Resource not found');
	}

	return {
		sdg
	};
};
