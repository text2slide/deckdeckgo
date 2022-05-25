import { DeckdeckgoPalette, DeckdeckgoPaletteColor } from '@deckdeckgo/color';

import colorStore from '../../stores/color.store';

export interface InitStyleColor {
	rgb: string | null;
	opacity: number | null;
}

export interface ColorData {
	rgb: string | null;
	rgba: string | null;
	r: number | null;
	g: number | null;
	b: number | null;
	opacity: number;
	hexAlpha: string | null;
	hex: string | null;
}

export class ColorUtils {
	static splitColor(styleColor: string): Promise<InitStyleColor> {
		return new Promise<InitStyleColor>((resolve) => {
			if (styleColor && styleColor !== undefined) {
				const rgbs: RegExpMatchArray | null = styleColor.match(/[.?\d]+/g);

				if (rgbs && rgbs.length >= 3) {
					resolve({
						rgb: `${rgbs[0]}, ${rgbs[1]}, ${rgbs[2]}`,
						opacity: rgbs.length > 3 ? parseFloat(rgbs[3]) * 100 : 100,
					});

					return;
				}
			}

			resolve({
				rgb: null,
				opacity: 100,
			});
		});
	}

	static rgbaToHex(rgba: string): string {
		const inParts = rgba.substring(rgba.indexOf('(')).split(',');
		const r = parseInt(inParts[0].substring(1).trim(), 10);
		const g = parseInt(inParts[1].trim(), 10);
		const b = parseInt(inParts[2].trim(), 10);
		const a = parseFloat(inParts[3].substring(0, inParts[3].length - 1));
		const outParts = [
			r.toString(16),
			g.toString(16),
			b.toString(16),
			Math.round(a * 255)
				.toString(16)
				.substring(0, 2),
		];

		// Pad single-digit output values
		outParts.forEach(function (part, i) {
			if (part.length === 1) {
				outParts[i] = '0' + part;
			}
		});

		return '#' + outParts.join('');
	}

	static rgbaToColorData(styleColor: string): Promise<ColorData> {
		return new Promise<ColorData>((resolve) => {
			const colorData: ColorData = {
				rgb: null,
				rgba: null,
				r: null,
				g: null,
				b: null,
				opacity: 100,
				hexAlpha: null,
				hex: null,
			};

			if (styleColor && styleColor !== undefined) {
				const rgbs: RegExpMatchArray | null = styleColor.match(/[.?\d]+/g);

				if (rgbs && rgbs.length >= 3) {
					colorData.r = parseInt(rgbs[0]);
					colorData.g = parseInt(rgbs[1]);
					colorData.b = parseInt(rgbs[2]);
					colorData.rgb = `rgb(${rgbs[0]},${rgbs[1]},${rgbs[2]})`;
					colorData.opacity = rgbs.length > 3 ? parseFloat(rgbs[3]) * 100 : 100;
					colorData.rgba = `rgba(${rgbs[0]},${rgbs[1]},${rgbs[2]},${
						colorData.opacity / 100
					})`;
					colorData.hexAlpha = this.rgbaToHex(colorData.rgba).replace('#', '');
					colorData.hex = colorData.hexAlpha.substr(0, 6);

					resolve(colorData);

					return;
				}
			}

			resolve(colorData);
		});
	}

	static transformOpacity(colorOpacity: number): number {
		return colorOpacity === 0 ? 0 : colorOpacity / 100;
	}

	static updateColor(color: DeckdeckgoPaletteColor) {
		const filteredHistory: DeckdeckgoPalette[] =
			colorStore.state.history.filter(
				(palette: DeckdeckgoPalette) =>
					palette.color.hex?.toLowerCase() !== color.hex?.toLowerCase()
			);

		colorStore.state.history = [
			{ color },
			...(filteredHistory.length < 22
				? filteredHistory
				: filteredHistory.slice(0, 21)),
		];
	}
}
