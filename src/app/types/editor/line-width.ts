export enum LineWidth {
	VERY_THIN = 'VERY_THIN',
	THIN = 'THIN',
	NORMAL = 'NORMAL',
	THICK = 'THICK',
	VERY_THICK = 'VERY_THICK',
	CUSTOM = 'CUSTOM',
}

export enum LineWidthValue {
	'VERY_THIN' = '0.1',
	'THIN' = '0.25',
	'NORMAL' = '0.4',
	'THICK' = '0.65',
	'VERY_THICK' = '0.8',
}

export enum LineWidthName {
	'0.1em' = 'VERY_THIN',
	'0.25em' = 'THIN',
	'0.4em' = 'NORMAL',
	'0.65em' = 'THICK',
	'0.8em' = 'VERY_THICK',
}

export enum StrokeWidthValue {
	'VERY_THIN' = '0.05em',
	'THIN' = '0.1em',
	'NORMAL' = '0.2em',
	'THICK' = '0.35em',
	'VERY_THICK' = '0.6em',
}

export enum StrokeWidthName {
	'0.05em' = 'VERY_THIN',
	'0.1em' = 'THIN',
	'0.2em' = 'NORMAL',
	'0.35em' = 'THICK',
	'0.6em' = 'VERY_THICK',
}

export interface LineWidthDefinition {
	very_thin: string;
	thin: string;
	normal: string;
	thick: string;
	very_thick: string;
}
