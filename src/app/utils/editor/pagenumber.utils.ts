import { EnvironmentDeckDeckGoConfig } from '../../types/core/environment-config';
import { EnvironmentConfigService } from '../../services/environment/environment-config.service';

import { deckSelector, selectSlide } from '@deckdeckgo/editor';

export class PagenumberUtils {
	static async append(deck: HTMLElement, slideNumber: number): Promise<void> {
		if (!deck) {
			return;
		}

		const promises: Promise<HTMLElement>[] = [
			this.createContainer(),
			this.createPageNumber(slideNumber),
		];

		const [div, pageNumber] = await Promise.all(promises);

		div.appendChild(pageNumber);
		deck.appendChild(div);

		// reload
		// await window.location.reload();
	}

	private static async createContainer(): Promise<HTMLDivElement> {
		const div: HTMLDivElement = document.createElement('div');
		div.setAttribute('id', 'pageNumber');
		div.setAttribute('style', '');
		div.setAttribute('contentEditable', 'false');

		return div;
	}

	private static async createPageNumber(
		slideNumner: number
	): Promise<HTMLElement> {
		const pageNumber = document.createElement('p');

		pageNumber.innerText = slideNumner.toString();
		pageNumber.setAttribute('style', 'color:white');
		return pageNumber;
	}

	static async remove(deck: HTMLElement): Promise<void> {
		if (!deck) {
			return;
		}

		// select pageNumber element
		const currentPagenumberElement: HTMLElement =
			deck.querySelector('#pageNumber');

		if (currentPagenumberElement) {
			deck.removeChild(currentPagenumberElement);
		}

		// reload
		// await window.location.reload();
	}
}
