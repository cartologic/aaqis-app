/**
 * Resources configuration for AAQIS
 * Contains SDGs and City Portals data
 */

export interface SDG {
	id: string;
	number: number;
	title: string;
	description: string;
	color: string;
	icon: string;
	url: string;
	type: 'page' | 'iframe' | 'external';
}

export interface CityPortal {
	id: string;
	city: string;
	country: string;
	url: string;
	icon: string;
	description: string;
	type?: 'portal' | 'contact'; // portal = city portal, contact = contact point
}

export const relatedSDGs: SDG[] = [
	{
		id: 'sdg-3',
		number: 3,
		title: 'Good Health and Well-Being',
		description: 'Ensure healthy lives and promote well-being for all at all ages. Air quality directly impacts respiratory health and overall well-being.',
		color: '#4C9F38',
		icon: '🏥',
		url: 'https://unstats.un.org/sdgs/report/2023/goal-03/',
		type: 'iframe'
	},
	{
		id: 'sdg-7',
		number: 7,
		title: 'Affordable and Clean Energy',
		description: 'Ensure access to affordable, reliable, sustainable and modern energy for all. Clean energy reduces air pollution.',
		color: '#FCC30B',
		icon: '⚡',
		url: 'https://unstats.un.org/sdgs/report/2023/goal-07/',
		type: 'iframe'
	},
	{
		id: 'sdg-11',
		number: 11,
		title: 'Sustainable Cities and Communities',
		description: 'Make cities and human settlements inclusive, safe, resilient and sustainable. Urban air quality is crucial for sustainable cities.',
		color: '#FD9D24',
		icon: '🏙️',
		url: 'https://unstats.un.org/sdgs/report/2023/goal-11/',
		type: 'iframe'
	},
	{
		id: 'sdg-13',
		number: 13,
		title: 'Climate Action',
		description: 'Take urgent action to combat climate change and its impacts. Air quality and climate change share common sources - burning fossil fuels.',
		color: '#3F7E44',
		icon: '🌍',
		url: '/resources/sdg-13',
		type: 'page'
	},
	{
		id: 'sdg-15',
		number: 15,
		title: 'Life on Land',
		description: 'Protect, restore and promote sustainable use of terrestrial ecosystems. Air pollution affects ecosystems and biodiversity.',
		color: '#56C02B',
		icon: '🌳',
		url: 'https://unstats.un.org/sdgs/report/2023/goal-15/',
		type: 'iframe'
	}
];

export const cityPortals: CityPortal[] = [
	{
		id: 'addis-ababa',
		city: 'Addis Ababa',
		country: 'Ethiopia',
		url: 'https://cityaddisababa.gov.et/',
		icon: '🇪🇹',
		description: 'Official portal of Addis Ababa City Administration'
	},
	{
		id: 'nairobi',
		city: 'Nairobi',
		country: 'Kenya',
		url: 'https://nairobiassembly.go.ke/',
		icon: '🇰🇪',
		description: 'Nairobi City County Assembly official portal'
	},
	{
		id: 'kampala',
		city: 'Kampala',
		country: 'Uganda',
		url: 'https://www.kcca.go.ug/',
		icon: '🇺🇬',
		description: 'Kampala Capital City Authority official portal'
	},
	{
		id: 'kigali',
		city: 'Kigali',
		country: 'Rwanda',
		url: 'https://kigalicity.gov.rw/',
		icon: '🇷🇼',
		description: 'City of Kigali official portal',
		type: 'portal'
	},
	{
		id: 'gaborone',
		city: 'Gaborone',
		country: 'Botswana',
		url: 'https://gov.bw/node/708',
		icon: '🇧🇼',
		description: 'Gaborone City Council contact point',
		type: 'contact'
	}
];

export interface ResourceSection {
	id: string;
	title: string;
	description: string;
	icon: string;
	items: SDG[] | CityPortal[];
}

export const resourceSections: ResourceSection[] = [
	{
		id: 'sdgs',
		title: 'Related Sustainable Development Goals',
		description: 'Air quality connects to multiple UN Sustainable Development Goals',
		icon: '🎯',
		items: relatedSDGs
	},
	{
		id: 'city-portals',
		title: 'City Portals',
		description: 'Official portals of monitored African cities',
		icon: '🏛️',
		items: cityPortals
	}
];
