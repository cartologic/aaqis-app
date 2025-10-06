export interface Indicator {
	number: string;
	description: string;
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
					'Number of deaths, missing persons and directly affected persons attributed to disasters per 100,000 population'
			},
			{
				number: '13.1.2',
				description:
					'Number of countries that adopt and implement national disaster risk reduction strategies in line with the Sendai Framework for Disaster Risk Reduction 2015–2030'
			},
			{
				number: '13.1.3',
				description:
					'Proportion of local governments that adopt and implement local disaster risk reduction strategies in line with national disaster risk reduction strategies'
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
					'Number of countries with nationally determined contributions, long-term strategies, national adaptation plans and adaptation communications, as reported to the secretariat of the United Nations Framework Convention on Climate Change'
			},
			{
				number: '13.2.2',
				description: 'Total greenhouse gas emissions per year'
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
					'Extent to which (i) global citizenship education and (ii) education for sustainable development are mainstreamed in (a) national education policies; (b) curricula; (c) teacher education; and (d) student assessment'
			}
		]
	},
	{
		number: '13.a',
		description:
			'Implement the commitment undertaken by developed-country parties to the United Nations Framework Convention on Climate Change to a goal of mobilizing jointly $100 billion annually by 2020 from all sources to address the needs of developing countries',
		indicators: [
			{
				number: '13.a.1',
				description:
					'Amounts provided and mobilized in United States dollars per year in relation to the continued existing collective mobilization goal of the $100 billion commitment through to 2025'
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
					'Number of least developed countries and small island developing States with nationally determined contributions, long-term strategies, national adaptation plans and adaptation communications, as reported to the secretariat of the United Nations Framework Convention on Climate Change'
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
