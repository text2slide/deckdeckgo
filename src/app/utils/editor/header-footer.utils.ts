import { User } from '@deckdeckgo/editor';

import { EnvironmentDeckDeckGoConfig } from '../../types/core/environment-config';
import { EnvironmentConfigService } from '../../services/environment/environment-config.service';

import { deckSelector, selectSlide } from '@deckdeckgo/editor';

import { SlotType } from '../../types/editor/slot-type';

export class HeaderFooterUtils {
	static async append(
		deck: HTMLElement,
		user: User,
		slotName: 'header' | 'footer',
		type:
			| 'twitter'
			| 'linkedin'
			| 'dev'
			| 'medium'
			| 'github'
			| 'custom'
			| 'pageNumber'
	): Promise<void> {
		if (!user && !user.data && !user.data.social) {
			return;
		}

		if (!deck) {
			return;
		}

		this.removeCurrentSlotElement(deck, slotName);

		if (type == 'pageNumber') {
			this.createPageNumberItem(deck, user, slotName);
		} else {
			const promises: Promise<HTMLElement>[] = [
				this.createContainer(slotName),
				this.createSocial(user, type),
				this.createImg(user, type),
			];
			const [div, social, deckgoImg] = await Promise.all(promises);

			social.appendChild(deckgoImg);

			div.appendChild(social);

			deck.appendChild(div);

			// prettier-ignore
			deckgoImg.addEventListener('lazyImgDidLoad', async () => {
				await this.reload(deck, slotName);
			}, { once: true });
		}
	}

	private static async createPageNumberItem(
		deck: HTMLElement,
		user: User,
		slotName: 'header' | 'footer',
		type:
			| 'twitter'
			| 'linkedin'
			| 'dev'
			| 'medium'
			| 'github'
			| 'custom'
			| 'pageNumber' = 'pageNumber'
	) {
		Array.from(deck.children).forEach(async (slide: HTMLElement, index) => {
			const promises: Promise<HTMLElement>[] = [
				this.createContainer(slotName),
				this.createSocial(user, type),
			];
			const [div, social] = await Promise.all(promises);
			const span = document.createElement('span');
			span.textContent = `${++index}`;
			social.appendChild(span);
			div.appendChild(social);
			slide.appendChild(div);
		});
	}

	private static async createContainer(
		slotName: 'header' | 'footer'
	): Promise<HTMLDivElement> {
		const div: HTMLDivElement = document.createElement('div');
		div.setAttribute('slot', slotName);
		div.setAttribute('contentEditable', 'false');

		return div;
	}

	private static async createSocial(
		user: User,
		type:
			| 'twitter'
			| 'linkedin'
			| 'dev'
			| 'medium'
			| 'github'
			| 'custom'
			| 'pageNumber'
	): Promise<HTMLElement> {
		const socialElement = document.createElement('deckgo-social');

		socialElement.setAttribute(
			type === 'custom' ? 'full-url' : type,
			user.data.social[type]
		);

		// Use in studio only to identify which header or footer is currently applied
		socialElement.setAttribute('type', type);

		return socialElement;
	}

	private static async createImg(
		user: User,
		type:
			| 'twitter'
			| 'linkedin'
			| 'dev'
			| 'medium'
			| 'github'
			| 'custom'
			| 'pageNumber'
	): Promise<HTMLElement> {
		const deckgoImg: HTMLElement = document.createElement(SlotType.IMG);
		deckgoImg.setAttribute('slot', 'icon');
		deckgoImg.setAttribute('aria-label', type);

		const config: EnvironmentDeckDeckGoConfig =
			EnvironmentConfigService.getInstance().get('deckdeckgo');

		if (type === 'pageNumber') {
			deckgoImg.setAttribute('svg-src', '');
			deckgoImg.setAttribute('imgSizes', '0');
		} else if (type === 'twitter' || type === 'linkedin' || type === 'github') {
			deckgoImg.setAttribute(
				'svg-src',
				`${config.globalAssetsUrl}/icons/ionicons/${type}.svg`
			);
		} else if (type === 'medium' || type === 'dev') {
			deckgoImg.setAttribute(
				'svg-src',
				`${config.globalAssetsUrl}/icons/${type}.svg`
			);
		} else if (
			user.data.social.custom_logo_url !== undefined &&
			user.data.social.custom_logo_url !== ''
		) {
			deckgoImg.setAttribute('img-src', user.data.social.custom_logo_url);
		} else {
			deckgoImg.setAttribute(
				'svg-src',
				`${config.globalAssetsUrl}/icons/ionicons/globe.svg`
			);
		}

		return deckgoImg;
	}

	static async remove(
		deck: HTMLElement,
		slotName: 'header' | 'footer'
	): Promise<void> {
		if (!deck) {
			return;
		}

		this.removeCurrentSlotElement(deck, slotName);

		await this.reload(deck, slotName);
	}

	private static async reload(deck: HTMLElement, slotName: 'header' | 'footer') {
		if (slotName === 'footer') {
			await (deck as any).loadFooter();
		} else {
			await (deck as any).loadHeader();
		}
	}

	static async reloadPageNumber(
		deck: HTMLElement = document.querySelector('main > deckgo-deck')
	) {
		const slotNames: ('header' | 'footer')[] = ['header', 'footer'];
		slotNames.forEach(async (slotName) => {
			const currentSlotElement: HTMLElement = deck.querySelector(
				`:scope > * > [slot='${slotName}']`
			);
			if (currentSlotElement) {
				await this.append(
					deck,
					{
						id: null,
						data: {
							social: {
								pageNumber: 'true',
							},
							created_at: 0,
							updated_at: 0,
						},
					},
					slotName,
					'pageNumber'
				);
			}
		});
	}

	private static removeCurrentSlotElement(
		deck: HTMLElement,
		slotName: 'header' | 'footer'
	) {
		const currentSlotElement: NodeList = deck.querySelectorAll(
			`:scope > [slot='${slotName}'], :scope > * > [slot='${slotName}']`
		);

		if (currentSlotElement) {
			currentSlotElement.forEach((element) => {
				element.parentElement.removeChild(element);
			});
		}
	}

	static async currentType(
		deck: HTMLElement,
		slotName: 'header' | 'footer'
	): Promise<
		| 'twitter'
		| 'linkedin'
		| 'dev'
		| 'medium'
		| 'github'
		| 'custom'
		| 'pageNumber'
		| undefined
	> {
		if (!deck) {
			return undefined;
		}

		const currentSlotElement: HTMLElement = deck.querySelector(
			`:scope > [slot='${slotName}'], :scope > * > [slot='${slotName}']`
		);

		if (!currentSlotElement) {
			return undefined;
		}

		const socialElement: HTMLElement =
			currentSlotElement.querySelector('deckgo-social');

		if (!socialElement) {
			return undefined;
		}

		return socialElement.getAttribute('type') as
			| 'twitter'
			| 'linkedin'
			| 'dev'
			| 'medium'
			| 'github'
			| 'custom'
			| 'pageNumber'
			| undefined;
	}
}
