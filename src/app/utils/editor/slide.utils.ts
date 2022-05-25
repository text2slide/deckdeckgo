import {
	SlideAttributesYAxisDomain,
	SlideScope,
	SlideSplitType,
	// SlideTemplate,
} from '@deckdeckgo/editor';

export class SlideUtils {
	static isSlideTemplate(scope: SlideScope | undefined): boolean {
		return (
			scope &&
			scope !== undefined &&
			(scope === SlideScope.COMMUNITY || scope === SlideScope.USER)
		);
	}

	static slideScope(element: HTMLElement | undefined): SlideScope {
		return element?.hasAttribute('scope')
			? <SlideScope>element.getAttribute('scope')
			: SlideScope.DEFAULT;
	}
}

export enum SlideTemplateOrigin {
	TITLE = 'title',
	CONTENT = 'content',
	SPLIT = 'split',
	GIF = 'gif',
	AUTHOR = 'author',
	YOUTUBE = 'youtube',
	QRCODE = 'qrcode',
	CHART = 'chart',
	POLL = 'poll',
	'ASPECT-RATIO' = 'aspect-ratio',
	PLAYGROUND = 'playground',
}

export const SlideTemplate = {
	...SlideTemplateOrigin,
};
export type SlideTemplate = typeof SlideTemplate[keyof typeof SlideTemplate];

export enum SlideChartType {
	LINE = 'line',
	PIE = 'pie',
	BAR = 'bar',
	'HORIZONTAL-BAR' = 'horizontal-bar',
}

export interface SlideAttributes {
	style?: string;
	src?: string;
	customBackground?: string;
	imgSrc?: string;
	imgAlt?: string;

	content?: string;
	customQRCode?: boolean;

	type?: SlideChartType | SlideSplitType;
	innerRadius?: number;
	animation?: boolean;
	datePattern?: string;
	yAxisDomain?: SlideAttributesYAxisDomain;
	smooth?: boolean;
	area?: boolean;
	ticks?: number;
	grid?: boolean;
	separator?: string;

	vertical?: boolean;

	imgMode?: string;

	customLoader?: boolean;

	theme?: string;

	[key: string]: string | number | boolean | undefined;
}

export interface SlideData {
	content?: string;

	template: SlideTemplate | string;
	scope?: SlideScope;

	attributes?: SlideAttributes;

	api_id?: string;

	created_at?: Date | number | BigInt;
	updated_at?: Date | number | BigInt;
}

export interface Slide {
	id: string;
	data: SlideData;
}
