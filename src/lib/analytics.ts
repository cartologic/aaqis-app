import posthog from 'posthog-js';
import { browser } from '$app/environment';

/**
 * Air Quality Information System (AAQIS) Analytics
 * Privacy-compliant tracking for stakeholder insights and usage patterns
 */

export interface AQISAnalytics {
	// User Journey Events
	trackStationSelection: (stationId: string, stationName: string, city: string, method: 'map_click' | 'list_click' | 'search' | 'geolocation') => void;
	trackCityFilter: (cityName: string, stationCount: number) => void;
	trackPollutantView: (pollutant: string, aqi: number, rating: string) => void;
	trackDateRangeChange: (range: string, startDate: string, endDate: string) => void;
	
	// Map Interactions
	trackMapInteraction: (action: 'zoom' | 'pan' | 'marker_click' | 'popup_open' | 'geolocation_use') => void;
	trackBboxFilter: (visibleStations: number, totalStations: number) => void;
	
	// Stakeholder Insights
	trackStakeholderSwitch: (from: string, to: string) => void;
	trackHealthAdviceView: (aqi: number, rating: string, stakeholder: string) => void;
	
	// Data Visualization
	trackChartView: (chartType: 'heatmap' | 'line' | 'gauge', pollutant: string, timespan: string) => void;
	trackDataExport: (format: string, dataSize: number) => void;
	
	// Performance & Engagement
	trackDataLoad: (recordCount: number, loadTime: number) => void;
	trackAppEngagement: (sessionDuration: number, actionsCount: number) => void;
	
	// Air Quality Alerts
	trackAQIAlert: (level: string, value: number, location: string) => void;
	trackHealthRecommendation: (recommendation: string, aqiLevel: string) => void;
}

class AQISAnalyticsImpl implements AQISAnalytics {
	private isEnabled = false;

	constructor() {
		if (browser && typeof posthog !== 'undefined') {
			this.isEnabled = true;
		}
	}

	private track(eventName: string, properties: Record<string, any> = {}) {
		if (this.isEnabled && posthog) {
			posthog.capture(`aaqis_${eventName}`, {
				...properties,
				timestamp: new Date().toISOString(),
				app: 'AAQIS',
				version: '1.0.0'
			});
		}
	}

	// User Journey Events
	trackStationSelection(stationId: string, stationName: string, city: string, method: 'map_click' | 'list_click' | 'search' | 'geolocation') {
		this.track('station_selected', {
			station_id: stationId,
			station_name: stationName,
			city: city,
			selection_method: method
		});
	}

	trackCityFilter(cityName: string, stationCount: number) {
		this.track('city_filtered', {
			city_name: cityName,
			station_count: stationCount
		});
	}

	trackPollutantView(pollutant: string, aqi: number, rating: string) {
		this.track('pollutant_viewed', {
			pollutant: pollutant,
			aqi_value: aqi,
			aqi_rating: rating,
			is_unhealthy: aqi > 100
		});
	}

	trackDateRangeChange(range: string, startDate: string, endDate: string) {
		this.track('date_range_changed', {
			range_type: range,
			start_date: startDate,
			end_date: endDate
		});
	}

	// Map Interactions
	trackMapInteraction(action: 'zoom' | 'pan' | 'marker_click' | 'popup_open' | 'geolocation_use') {
		this.track('map_interaction', {
			action: action
		});
	}

	trackBboxFilter(visibleStations: number, totalStations: number) {
		this.track('bbox_filter', {
			visible_stations: visibleStations,
			total_stations: totalStations,
			filter_ratio: visibleStations / totalStations
		});
	}

	// Stakeholder Insights
	trackStakeholderSwitch(from: string, to: string) {
		this.track('stakeholder_switched', {
			from_stakeholder: from,
			to_stakeholder: to
		});
	}

	trackHealthAdviceView(aqi: number, rating: string, stakeholder: string) {
		this.track('health_advice_viewed', {
			aqi_value: aqi,
			aqi_rating: rating,
			stakeholder_type: stakeholder,
			advice_urgency: aqi > 150 ? 'high' : aqi > 100 ? 'medium' : 'low'
		});
	}

	// Data Visualization
	trackChartView(chartType: 'heatmap' | 'line' | 'gauge', pollutant: string, timespan: string) {
		this.track('chart_viewed', {
			chart_type: chartType,
			pollutant: pollutant,
			timespan: timespan
		});
	}

	trackDataExport(format: string, dataSize: number) {
		this.track('data_exported', {
			export_format: format,
			data_size: dataSize
		});
	}

	// Performance & Engagement
	trackDataLoad(recordCount: number, loadTime: number) {
		this.track('data_loaded', {
			record_count: recordCount,
			load_time_ms: loadTime,
			performance_category: loadTime < 1000 ? 'fast' : loadTime < 3000 ? 'medium' : 'slow'
		});
	}

	trackAppEngagement(sessionDuration: number, actionsCount: number) {
		this.track('session_engagement', {
			session_duration_ms: sessionDuration,
			actions_count: actionsCount,
			engagement_level: actionsCount > 10 ? 'high' : actionsCount > 5 ? 'medium' : 'low'
		});
	}

	// Air Quality Alerts
	trackAQIAlert(level: string, value: number, location: string) {
		this.track('aqi_alert', {
			alert_level: level,
			aqi_value: value,
			location: location,
			is_critical: value > 200
		});
	}

	trackHealthRecommendation(recommendation: string, aqiLevel: string) {
		this.track('health_recommendation', {
			recommendation_type: recommendation,
			aqi_level: aqiLevel
		});
	}

	// Utility Methods
	identifyUser(userId: string, properties?: Record<string, any>) {
		if (this.isEnabled && posthog) {
			posthog.identify(userId, properties);
		}
	}

	setUserProperties(properties: Record<string, any>) {
		if (this.isEnabled && posthog) {
			posthog.people.set(properties);
		}
	}

	// Custom event for any additional tracking needs
	trackCustomEvent(eventName: string, properties: Record<string, any> = {}) {
		this.track(`custom_${eventName}`, properties);
	}
}

// Export singleton instance
export const aaqisAnalytics = new AQISAnalyticsImpl();

// Export PostHog instance for direct access if needed
export { posthog };