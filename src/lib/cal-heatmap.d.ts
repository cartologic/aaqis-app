declare module 'cal-heatmap' {
	export default class CalHeatmap {
		constructor();
		paint(config: any, plugins?: any[]): void;
		destroy(): void;
	}
}

declare module 'cal-heatmap/plugins/Tooltip' {
	const Tooltip: any;
	export default Tooltip;
}

declare module 'cal-heatmap/plugins/Legend' {
	const Legend: any;
	export default Legend;
}

declare module 'cal-heatmap/plugins/CalendarLabel' {
	const CalendarLabel: any;
	export default CalendarLabel;
}