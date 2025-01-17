export type Expanded = 'open' | 'close';

export type EditMode = 'properties' | 'css';

export interface SettingsPanels {
	borderRadius: Expanded;
	border: Expanded;
	boxShadow: Expanded;
	block: Expanded;
	fontSize: Expanded;
	text: Expanded;
	image: Expanded;
	imageStyle: Expanded;
	color: Expanded;
	background: Expanded;
	list: Expanded;
	fill: Expanded;
	stroke: Expanded;
}

export interface Settings {
	panels: SettingsPanels;
	editMode: EditMode;
	contrastWarning: boolean;
}
