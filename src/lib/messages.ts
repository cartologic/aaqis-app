import type { AirQualityMessage, AQIRating } from './types.js';

export const AIR_QUALITY_MESSAGES: Record<AQIRating, Record<string, AirQualityMessage>> = {
	good: {
		public: {
			target: 'public',
			rating: 'good',
			message: "It's a beautiful day to breathe! The air quality is excellent. Enjoy your outdoor activities without concern. Take a walk, go for a run, or enjoy a family picnic. Let's work together to keep our air this clean!",
			recommendations: [
				'Perfect for all outdoor activities',
				'Great day for exercise and recreation',
				'Enjoy time in parks and nature'
			]
		},
		government: {
			target: 'government',
			rating: 'good',
			message: 'Good air quality is a sign of our progress. Use this data to celebrate achievements and reinforce policies that contribute to clean air. Highlight this success as a model for other regions and a benefit to public health and tourism.',
			recommendations: [
				'Showcase successful environmental policies',
				'Promote clean air initiatives',
				'Encourage sustainable practices'
			]
		},
		practitioners: {
			target: 'practitioners',
			rating: 'good',
			message: 'Good air quality days are a result of effective interventions. Conduct post-analysis to identify which policies and weather conditions were most impactful. Use this as a baseline to measure the effectiveness of future air pollution control strategies.',
			recommendations: [
				'Document successful intervention strategies',
				'Analyze contributing factors',
				'Establish baselines for future monitoring'
			]
		}
	},
	moderate: {
		public: {
			target: 'public',
			rating: 'moderate',
			message: 'The air is acceptable, but some people are sensitive to it. If you have asthma, allergies, or other respiratory conditions, take it easy on long or intense outdoor activities. Listen to your body—if you feel symptoms like coughing, move your activity indoors.',
			recommendations: [
				'Sensitive individuals should limit prolonged outdoor exertion',
				'Monitor for symptoms like cough or shortness of breath',
				'Consider indoor alternatives for intense activities'
			]
		},
		government: {
			target: 'government',
			rating: 'moderate',
			message: 'Moderate air quality provides an opportunity for targeted action. Use this data to promote cleaner transport and energy-saving measures to prevent conditions from worsening. This is the ideal time to launch public campaigns about sustainable practices.',
			recommendations: [
				'Promote public transportation usage',
				'Launch clean energy campaigns',
				'Implement traffic management measures'
			]
		},
		practitioners: {
			target: 'practitioners',
			rating: 'moderate',
			message: 'Air quality is in a dynamic state. Focus on predictive modeling and forecasting to anticipate shifts towards unhealthy levels. Use this data to engage with stakeholders on emission reduction strategies.',
			recommendations: [
				'Enhance forecasting capabilities',
				'Engage with emission sources',
				'Prepare preventive measures'
			]
		}
	},
	unhealthy_sensitive: {
		public: {
			target: 'public',
			rating: 'unhealthy_sensitive',
			message: 'Air quality is unhealthy for sensitive groups. People with heart or lung disease, older adults, and children should avoid prolonged or heavy outdoor activities. Everyone else can continue normal outdoor activities.',
			recommendations: [
				'Sensitive groups should avoid outdoor exertion',
				'Wear masks when going outside if sensitive',
				'Keep windows closed and use air purifiers'
			]
		},
		government: {
			target: 'government',
			rating: 'unhealthy_sensitive',
			message: 'Unhealthy air quality for sensitive groups requires immediate attention. Issue health advisories and consider implementing temporary emission reduction measures. Activate public health response protocols.',
			recommendations: [
				'Issue public health advisories',
				'Consider emergency traffic restrictions',
				'Activate community clean air shelters'
			]
		},
		practitioners: {
			target: 'practitioners',
			rating: 'unhealthy_sensitive',
			message: 'Elevated pollution levels detected. Investigate potential sources and patterns by analyzing real-time data streams. This is crucial time for source identification and targeted interventions.',
			recommendations: [
				'Investigate pollution sources',
				'Implement source apportionment studies',
				'Coordinate with relevant industries'
			]
		}
	},
	unhealthy: {
		public: {
			target: 'public',
			rating: 'unhealthy',
			message: 'Red alert! Air quality is unhealthy today. Minimize time outdoors, especially strenuous activities like sports or jogging. If you must go out, consider wearing a high-quality mask (like an N95) to protect your lungs. Keep windows closed and use air purifiers.',
			recommendations: [
				'Minimize outdoor activities for everyone',
				'Wear N95 masks when outside',
				'Keep windows closed and use air purifiers',
				'Seek medical attention if experiencing symptoms'
			]
		},
		government: {
			target: 'government',
			rating: 'unhealthy',
			message: 'Unhealthy air quality is a public health emergency. Implement emergency response protocols including traffic restrictions, industrial emission controls, and public health advisories. Consider declaring a pollution emergency.',
			recommendations: [
				'Declare pollution emergency if needed',
				'Implement emergency traffic restrictions',
				'Coordinate with industries for emission reductions',
				'Activate all available clean air shelters'
			]
		},
		practitioners: {
			target: 'practitioners',
			rating: 'unhealthy',
			message: 'Critical air quality levels detected. Immediately investigate sources and implement emergency response protocols. Coordinate with government and industry for immediate emission reduction measures.',
			recommendations: [
				'Activate emergency response protocols',
				'Coordinate immediate emission reductions',
				'Provide real-time updates to authorities'
			]
		}
	},
	very_unhealthy: {
		public: {
			target: 'public',
			rating: 'very_unhealthy',
			message: 'Health warning: Air quality is very unhealthy. Everyone should avoid all outdoor activities. Stay indoors with windows and doors closed. Use air purifiers if available. Seek immediate medical attention if experiencing breathing difficulties.',
			recommendations: [
				'Stay indoors with sealed windows and doors',
				'Avoid all outdoor activities',
				'Use air purifiers and masks indoors if needed',
				'Seek immediate medical help for breathing issues'
			]
		},
		government: {
			target: 'government',
			rating: 'very_unhealthy',
			message: 'Public health emergency: Very unhealthy air quality detected. Implement maximum emergency response measures including complete traffic bans, industrial shutdowns, and evacuation of vulnerable populations to clean air facilities.',
			recommendations: [
				'Implement maximum emergency measures',
				'Consider complete traffic bans',
				'Shut down non-essential industries',
				'Evacuate vulnerable populations'
			]
		},
		practitioners: {
			target: 'practitioners',
			rating: 'very_unhealthy',
			message: 'Emergency air quality crisis. Coordinate with all available resources for immediate source control. Provide continuous monitoring and reporting. Implement all available emergency mitigation strategies.',
			recommendations: [
				'Coordinate emergency response',
				'Continuous monitoring and reporting',
				'Implement all mitigation strategies'
			]
		}
	},
	hazardous: {
		public: {
			target: 'public',
			rating: 'hazardous',
			message: 'EMERGENCY: Hazardous air quality! This is a health emergency. Do not go outside under any circumstances. Seal your home completely. If you must leave, wear multiple high-grade masks. Seek immediate medical attention for any breathing problems.',
			recommendations: [
				'DO NOT GO OUTSIDE',
				'Seal home completely',
				'Use multiple air purifiers',
				'Seek immediate medical attention for any symptoms',
				'Evacuate if possible to clean air areas'
			]
		},
		government: {
			target: 'government',
			rating: 'hazardous',
			message: 'HAZARDOUS AIR QUALITY EMERGENCY: Implement full emergency response including city-wide shutdowns, complete traffic bans, immediate industrial closures, and mass evacuation to safe areas. Declare state of emergency.',
			recommendations: [
				'Declare state of emergency',
				'Implement city-wide shutdowns',
				'Complete traffic and industrial bans',
				'Mass evacuation to clean air zones',
				'Deploy all emergency health resources'
			]
		},
		practitioners: {
			target: 'practitioners',
			rating: 'hazardous',
			message: 'CRITICAL EMERGENCY: Hazardous air quality detected. Coordinate with all emergency services. Implement every available pollution control measure. Provide continuous emergency updates and support evacuation efforts.',
			recommendations: [
				'Coordinate with emergency services',
				'Implement all pollution controls',
				'Support evacuation efforts',
				'Provide continuous emergency updates'
			]
		}
	}
};

// Helper function to get air quality message
export function getAirQualityMessage(rating: string, stakeholder: string): string {
	// Convert rating to lowercase and handle different rating formats
	const normalizedRating = rating.toLowerCase().replace(/\s+/g, '_');
	
	// Map different rating formats to our internal format
	let aqiRating: AQIRating;
	switch (normalizedRating) {
		case 'good':
			aqiRating = 'good';
			break;
		case 'moderate':
			aqiRating = 'moderate';
			break;
		case 'unhealthy_for_sensitive_groups':
		case 'unhealthy_for_sensitive':
		case 'unhealthy_sensitive':
			aqiRating = 'unhealthy_sensitive';
			break;
		case 'unhealthy':
			aqiRating = 'unhealthy';
			break;
		case 'very_unhealthy':
			aqiRating = 'very_unhealthy';
			break;
		case 'hazardous':
			aqiRating = 'hazardous';
			break;
		default:
			aqiRating = 'moderate'; // Default fallback
	}
	
	// Normalize stakeholder
	const normalizedStakeholder = stakeholder.toLowerCase();
	
	const messages = AIR_QUALITY_MESSAGES[aqiRating];
	if (messages && messages[normalizedStakeholder]) {
		return messages[normalizedStakeholder].message;
	}
	
	// Fallback to public message if stakeholder not found
	if (messages && messages.public) {
		return messages.public.message;
	}
	
	// Ultimate fallback
	return 'Air quality information is currently unavailable. Please check back later.';
}

export function getMessage(rating: AQIRating, target: 'public' | 'government' | 'practitioners'): AirQualityMessage {
	return AIR_QUALITY_MESSAGES[rating][target];
}

export function getAllMessagesForRating(rating: AQIRating): AirQualityMessage[] {
	return [
		AIR_QUALITY_MESSAGES[rating].public,
		AIR_QUALITY_MESSAGES[rating].government,
		AIR_QUALITY_MESSAGES[rating].practitioners
	];
}