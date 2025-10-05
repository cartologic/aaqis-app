import type { AirQualityMessage, AQIRating } from './types.js';

export const AIR_QUALITY_MESSAGES: Record<AQIRating, Record<string, AirQualityMessage>> = {
	good: {
		public: {
			target: 'public',
			rating: 'good',
			message:
				"It's a beautiful day to breathe! The air quality is excellent. Enjoy your outdoor activities without concern. Take a walk, go for a run, or enjoy a family picnic. Let's work together to keep our air this clean!",
			recommendations: [
				'Perfect for all outdoor activities',
				'Great day for exercise and recreation',
				'Enjoy time in parks and nature'
			]
		},
		government: {
			target: 'government',
			rating: 'good',
			message:
				'Good air quality is a sign of our progress. Use this data to celebrate achievements and reinforce policies that contribute to clean air. Highlight this success as a model for other regions and a benefit to public health and tourism.',
			recommendations: [
				'Showcase successful environmental policies',
				'Promote clean air initiatives',
				'Encourage sustainable practices'
			]
		},
		practitioners: {
			target: 'practitioners',
			rating: 'good',
			message:
				'AQI within WHO guidelines (0-50). Optimal conditions for baseline studies and QA/QC verification. Conduct receptor modeling (PMF/CMB) to characterize background concentrations and identify natural vs. anthropogenic contributions. Validate monitoring equipment calibration and perform inter-comparison studies. Document meteorological conditions for future episodic analysis.',
			recommendations: [
				'Perform source apportionment baseline studies',
				'Conduct quality assurance audits per EPA guidelines',
				'Establish seasonal baseline profiles for comparison',
				'Validate emission inventory assumptions',
				'Archive high-resolution temporal data for model validation'
			]
		}
	},
	moderate: {
		public: {
			target: 'public',
			rating: 'moderate',
			message:
				'The air is acceptable, but some people are sensitive to it. If you have asthma, allergies, or other respiratory conditions, take it easy on long or intense outdoor activities. Listen to your body—if you feel symptoms like coughing, move your activity indoors.',
			recommendations: [
				'Sensitive individuals should limit prolonged outdoor exertion',
				'Monitor for symptoms like cough or shortness of breath',
				'Consider indoor alternatives for intense activities'
			]
		},
		government: {
			target: 'government',
			rating: 'moderate',
			message:
				'Moderate air quality provides an opportunity for targeted action. Use this data to promote cleaner transport and energy-saving measures to prevent conditions from worsening. This is the ideal time to launch public campaigns about sustainable practices.',
			recommendations: [
				'Promote public transportation usage',
				'Launch clean energy campaigns',
				'Implement traffic management measures'
			]
		},
		practitioners: {
			target: 'practitioners',
			rating: 'moderate',
			message:
				'AQI 51-100: Elevated levels detected. Initiate enhanced monitoring protocols with increased sampling frequency. Apply multivariate receptor modeling (PCA/FA) to identify emerging source contributions. Analyze diurnal patterns and meteorological correlations (wind rose analysis, mixing height). Activate forecasting models (CMAQ/WRF-Chem) for 24-48hr predictions to anticipate NAAQS exceedances.',
			recommendations: [
				'Implement predictive dispersion modeling (AERMOD/CALPUFF)',
				'Conduct back-trajectory analysis (HYSPLIT) for source region identification',
				'Increase PM2.5/PM10 speciation sampling for CMB analysis',
				'Engage major point sources for emission verification',
				'Prepare contingency response protocols for sensitive groups'
			]
		}
	},
	unhealthy_sensitive: {
		public: {
			target: 'public',
			rating: 'unhealthy_sensitive',
			message:
				'Air quality is unhealthy for sensitive groups. People with heart or lung disease, older adults, and children should avoid prolonged or heavy outdoor activities. Everyone else can continue normal outdoor activities.',
			recommendations: [
				'Sensitive groups should avoid outdoor exertion',
				'Wear masks when going outside if sensitive',
				'Keep windows closed and use air purifiers'
			]
		},
		government: {
			target: 'government',
			rating: 'unhealthy_sensitive',
			message:
				'Unhealthy air quality for sensitive groups requires immediate attention. Issue health advisories and consider implementing temporary emission reduction measures. Activate public health response protocols.',
			recommendations: [
				'Issue public health advisories',
				'Consider emergency traffic restrictions',
				'Activate community clean air shelters'
			]
		},
		practitioners: {
			target: 'practitioners',
			rating: 'unhealthy_sensitive',
			message:
				'AQI 101-150: NAAQS threshold approaching. Deploy enhanced source apportionment protocols—apply PMF with error estimation (BS-DISP) to quantify source contributions. Activate real-time emission monitoring at major point sources. Conduct urgent spatial analysis to identify hotspots and transport patterns. Initiate chemical speciation (OC/EC, ions, metals) for source fingerprinting. Coordinate with meteorology for inversion layer analysis.',
			recommendations: [
				'Execute emergency CMB receptor modeling with local source profiles',
				'Deploy mobile monitoring units for spatial characterization',
				'Activate satellite imagery analysis (MODIS/VIIRS AOD) for regional transport',
				'Implement conditional probability function (CPF) analysis for source directionality',
				'Communicate findings to regulatory agencies within 6 hours'
			]
		}
	},
	unhealthy: {
		public: {
			target: 'public',
			rating: 'unhealthy',
			message:
				'Red alert! Air quality is unhealthy today. Minimize time outdoors, especially strenuous activities like sports or jogging. If you must go out, consider wearing a high-quality mask (like an N95) to protect your lungs. Keep windows closed and use air purifiers.',
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
			message:
				'Unhealthy air quality is a public health emergency. Implement emergency response protocols including traffic restrictions, industrial emission controls, and public health advisories. Consider declaring a pollution emergency.',
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
			message:
				'AQI 151-200: EMERGENCY RESPONSE REQUIRED. Episode analysis critical—execute multi-site PMF/CMB with bootstrapping for uncertainty quantification. Deploy LIDAR/ceilometer for boundary layer profiling. Initiate continuous CEMS monitoring at all permitted sources. Activate photochemical modeling (CMAQ/CAMx) for O3/PM2.5 secondary formation analysis. Implement real-time data validation (QAPP protocols) and flag suspect data immediately.',
			recommendations: [
				'Execute emergency episode forensics with 1-hour resolution',
				'Deploy filter-based and real-time instruments (TEOM, BAM) in parallel',
				'Coordinate with regional networks for transboundary analysis',
				'Activate emissions inventory rapid assessment protocols',
				'Provide hourly technical briefings to emergency management'
			]
		}
	},
	very_unhealthy: {
		public: {
			target: 'public',
			rating: 'very_unhealthy',
			message:
				'Health warning: Air quality is very unhealthy. Everyone should avoid all outdoor activities. Stay indoors with windows and doors closed. Use air purifiers if available. Seek immediate medical attention if experiencing breathing difficulties.',
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
			message:
				'Public health emergency: Very unhealthy air quality detected. Implement maximum emergency response measures including complete traffic bans, industrial shutdowns, and evacuation of vulnerable populations to clean air facilities.',
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
			message:
				'AQI 201-300: CRITICAL EPISODE. Full crisis protocols—continuous receptor modeling updates every 3 hours with rotating UNMIX/PMF/CMB validation. Deploy all available monitoring assets including research-grade instruments. Activate ensemble forecasting with multiple chemical transport models. Implement backward Lagrangian particle dispersion (FLEXPART) for 72-hour source region analysis. Coordinate interstate data sharing for regional transport assessment.',
			recommendations: [
				'Establish 24/7 technical operations center with rotating shifts',
				'Deploy aircraft/drone measurements for vertical profiling if feasible',
				'Execute rapid-response source testing at all major emitters (>100 tons/yr)',
				'Activate citizen science networks for supplementary spatial coverage',
				'Prepare peer-reviewed technical incident report for post-episode analysis'
			]
		}
	},
	hazardous: {
		public: {
			target: 'public',
			rating: 'hazardous',
			message:
				'EMERGENCY: Hazardous air quality! This is a health emergency. Do not go outside under any circumstances. Seal your home completely. If you must leave, wear multiple high-grade masks. Seek immediate medical attention for any breathing problems.',
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
			message:
				'HAZARDOUS AIR QUALITY EMERGENCY: Implement full emergency response including city-wide shutdowns, complete traffic bans, immediate industrial closures, and mass evacuation to safe areas. Declare state of emergency.',
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
			message:
				'AQI >300: CATASTROPHIC EVENT. Implement Level 1 crisis response per National Contingency Plan. Deploy full analytical capability—synchronize multi-instrument analysis (FRM/FEM/continuous) with redundant QA/QC. Activate all modeling platforms with ensemble uncertainty analysis. Execute emergency source attribution using all available receptor models plus deterministic source-oriented methods (CMAQ-DDM, CAMx-OSAT). Document complete chain-of-custody for forensic-quality data preservation.',
			recommendations: [
				'Establish unified command with EPA/WHO emergency response coordinators',
				'Deploy Level 4 PPE for field personnel conducting emergency sampling',
				'Execute emergency health impact modeling (BenMAP/APEEP) for epidemiological support',
				'Coordinate with satellite programs (Sentinel-5P/TROPOMI) for regional context',
				'Prepare comprehensive technical brief for international scientific community and media'
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
