export interface SubIndicator {
	description: string;
	dataUrl?: string;
}

export interface Indicator {
	number: string;
	description: string;
	dataUrl?: string; // URL to UN data commons for this specific indicator
	subIndicators?: SubIndicator[]; // Optional sub-indicators
}

export interface Target {
	number: string;
	description: string;
	indicators: Indicator[];
}

export const sdg13Targets: Target[] = [
	{
		number: '13.1',
		description:
			'Strengthen resilience and adaptive capacity to climate-related hazards and natural disasters in all countries',
		indicators: [
			{
				number: '13.1.1',
				description:
					'Number of deaths, missing persons and directly affected persons attributed to disasters per 100K population',
				dataUrl: 'https://unstats.un.org/UNSDWebsite/undatacommons/goals?p=YWZyaWNhJmRjL3RvcGljL3VuZGF0YS9zZGcm#explore+dc/topic/undata/sdg_13.1.1',
				subIndicators: [
					{ description: 'Number of people affected by disasters' },
					{ description: 'Number of directly affected persons attributed to disasters per 100,000 population' },
					{ description: 'Number of injured or ill people attributed to disasters' },
					{ description: 'Number of missing persons due to disaster' },
					{ description: 'Number of deaths and missing persons attributed to disasters' },
					{ description: 'Number of deaths due to disaster' },
					{ description: 'Number of deaths and missing persons attributed to disasters per 100,000 population' },
					{ description: 'Number of people whose damaged dwellings were attributed to disasters' },
					{ description: 'Number of people whose livelihoods were disrupted or destroyed, attributed to disasters' },
					{ description: 'Number of people whose destroyed dwellings were attributed to disasters' }
				]
			},
			{
				number: '13.1.2',
				description:
					'Number of countries that adopt and implement national disaster risk reduction strategies in line with the Sendai Framework for Disaster Risk Reduction 2015-2030',
				dataUrl: 'https://unstats.un.org/UNSDWebsite/undatacommons/goals?p=YWZyaWNhJmRjL3RvcGljL3VuZGF0YS9zZGcm#explore+dc/topic/undata/sdg_13.1.2',
				subIndicators: [
					{ description: 'Score of adoption and implementation of national disaster-risk reduction strategies in line with the Sendai Framework' }
				]
			},
			{
				number: '13.1.3',
				description:
					'Proportion of local governments that adopt and implement local disaster risk reduction strategies in line with national disaster risk reduction strategies',
				dataUrl: 'https://unstats.un.org/UNSDWebsite/undatacommons/goals?p=YWZyaWNhJmRjL3RvcGljL3VuZGF0YS9zZGcm#explore+dc/topic/undata/sdg_13.1.3',
				subIndicators: [
					{ description: 'Number of local governments that adopt and implement local disaster-risk reduction strategies in line with national strategies' },
					{ description: 'Proportion of local governments that adopt and implement local disaster-risk reduction strategies in line with national disaster-risk reduction strategies' },
					{ description: 'Number of local governments' }
				]
			}
		]
	},
	{
		number: '13.2',
		description: 'Integrate climate change measures into national policies, strategies and planning',
		indicators: [
			{
				number: '13.2.1',
				description:
					'Number of countries with nationally determined contributions, long-term strategies, national adaptation plans and adaptation communications, as reported to the secretariat of the United Nations Framework Convention on Climate Change',
				// dataUrl removed - no data available for Africa region
				subIndicators: [
					{ description: 'Number of countries with nationally determined contributions (NDCs)' },
					{ description: 'Number of countries with long-term strategies' },
					{ description: 'Number of countries with national adaptation plans (NAPs)' },
					{ description: 'Number of countries with adaptation communications' }
				]
			},
			{
				number: '13.2.2',
				description: 'Total greenhouse gas emissions per year',
				dataUrl: 'https://unstats.un.org/UNSDWebsite/undatacommons/goals?p=YWZyaWNhJmRjL3RvcGljL3VuZGF0YS9zZGcm#explore+dc/topic/undata/sdg_13.2.2',
				subIndicators: [
					{ description: 'Total greenhouse gas emissions (excluding land use, land-use changes and forestry) for non-Annex I Parties to the United Nations Framework Convention on Climate Change' }
				]
			}
		]
	},
	{
		number: '13.3',
		description:
			'Improve education, awareness-raising and human and institutional capacity on climate change mitigation, adaptation, impact reduction and early warning',
		indicators: [
			{
				number: '13.3.1',
				description:
					'Extent to which (i) global citizenship education and (ii) education for sustainable development are mainstreamed in (a) national education policies; (b) curricula; (c) teacher education; and (d) student assessment',
				dataUrl: 'https://unstats.un.org/UNSDWebsite/undatacommons/goals?p=YWZyaWNhJmRjL3RvcGljL3VuZGF0YS9zZGcm#explore+dc/topic/undata/sdg_13.3.1',
				subIndicators: [
					{ description: 'Extent to which global citizenship education and education for sustainable development are mainstreamed in curricula' },
					{ description: 'Extent to which global citizenship education and education for sustainable development are mainstreamed in national education policies' },
					{ description: 'Extent to which global citizenship education and education for sustainable development are mainstreamed in student assessment' },
					{ description: 'Extent to which global citizenship education and education for sustainable development are mainstreamed in teacher education' }
				]
			}
		]
	},
	{
		number: '13.a',
		description:
			'Implement the commitment undertaken by developed-country parties to the United Nations Framework Convention on Climate Change to a goal of mobilizing jointly $100 billion annually by 2020 from all sources to address the needs of developing countries in the context of meaningful mitigation actions and transparency on implementation and fully operationalize the Green Climate Fund through its capitalization as soon as possible',
		indicators: [
			{
				number: '13.a.1',
				description:
					'Amounts provided and mobilized in United States dollars per year in relation to the continued existing collective mobilization goal of the $100 billion commitment through to 2025',
				dataUrl: 'https://unstats.un.org/UNSDWebsite/undatacommons/goals?p=YWZyaWNhJmRjL3RvcGljL3VuZGF0YS9zZGcm#explore+dc/topic/undata/sdg_13.a.1',
				subIndicators: [
					{ description: 'Total climate-specific financial support provided' },
					{ description: 'Core/general contributions provided to multilateral institutions' },
					{ description: 'Total financial support provided' },
					{ description: 'Climate-specific financial support provided via bilateral, regional and other channels' },
					{ description: 'Climate-specific financial support provided via bilateral, regional and other channels, by Type of climate financial support' },
					{ description: 'Climate-specific financial support provided via multilateral channels' },
					{ description: 'Climate-specific financial support provided via multilateral channels, by Type of climate financial support' }
				]
			}
		]
	},
	{
		number: '13.b',
		description:
			'Promote mechanisms for raising capacity for effective climate change-related planning and management in least developed countries and small island developing States, including focusing on women, youth and local and marginalized communities',
		indicators: [
			{
				number: '13.b.1',
				description:
					'Number of least developed countries and small island developing States with nationally determined contributions, long-term strategies, national adaptation plans and adaptation communications, as reported to the secretariat of the United Nations Framework Convention on Climate Change',
				dataUrl: 'https://unstats.un.org/UNSDWebsite/undatacommons/goals?p=YWZyaWNhJmRjL3RvcGljL3VuZGF0YS9zZGcm#explore+dc/topic/undata/sdg_13.b.1'
			}
		]
	}
];

export const airQualityClimateConnection = {
	title: 'Air Quality and Climate Action',
	description:
		'Air pollution and climate change are closely linked. The burning of fossil fuels which releases greenhouse gases also produces air pollutants. African cities face unique challenges with rapid urbanization, industrial growth, and reliance on biomass for cooking.',
	keyPoints: [
		{
			icon: '🏭',
			title: 'Common Sources',
			description:
				'Fossil fuel combustion releases both greenhouse gases (CO₂) and air pollutants (PM2.5, NO₂)'
		},
		{
			icon: '🌡️',
			title: 'Temperature Impact',
			description:
				'Higher temperatures from climate change can worsen air quality by accelerating ozone formation'
		},
		{
			icon: '🔥',
			title: 'Wildfires',
			description:
				'Climate change increases wildfire frequency and intensity, releasing massive amounts of PM2.5'
		},
		{
			icon: '💨',
			title: 'Short-lived Climate Pollutants',
			description:
				'Black carbon (soot) and methane contribute to both air pollution and global warming'
		},
		{
			icon: '🌍',
			title: 'Co-benefits',
			description:
				'Actions to reduce air pollution also reduce greenhouse gas emissions, creating win-win solutions'
		},
		{
			icon: '🏥',
			title: 'Health & Climate',
			description:
				'Cleaner air improves public health while also helping to mitigate climate change impacts'
		}
	],
	africanContext: {
		challenges: [
			'Rapid urbanization increasing vehicle emissions',
			'Reliance on biomass and charcoal for cooking',
			'Industrial emissions from growing manufacturing sectors',
			'Dust storms and desertification affecting air quality',
			'Limited monitoring infrastructure in many regions'
		],
		opportunities: [
			'Leapfrogging to clean energy technologies',
			'Implementation of clean cookstove programs',
			'Development of public transportation systems',
			'Regional cooperation on air quality monitoring',
			'Integration of traditional knowledge with modern solutions'
		]
	}
};
