import { JSX } from '@stencil/core';

import { Deck, SlideAttributes } from '@deckdeckgo/editor';

import editorStore from '../../stores/editor.store';
import errorStore from '../../stores/error.store';
import busyStore from '../../stores/busy.store';

import { ParseSlidesUtils } from '../../utils/editor/parse-slides.utils';
import { TemplateUtils } from '../../utils/editor/template.utils';

import { DeckOfflineProvider } from '../../providers/data/deck/deck.offline.provider';
import { SlideOfflineProvider } from '../../providers/data/slide/slide.offline.provider';
import { initTemplates } from '../../providers/data/template/template.provider';
import { Slide } from '../../utils/editor/slide.utils';
import { ApiUrls } from '../../types/core/apiUrls';
import {
	fetchData,
	modifySlideContent,
	transferToObj,
} from '../../utils/core/api.utils';
import { set } from 'idb-keyval';
import { LocalStorageKeys } from '../../types/core/localStorageKeys';

export class SlideHelper {
	private deckOfflineProvider: DeckOfflineProvider;
	private slideOfflineProvider: SlideOfflineProvider;

	constructor() {
		this.slideOfflineProvider = SlideOfflineProvider.getInstance();
		this.deckOfflineProvider = DeckOfflineProvider.getInstance();
	}

	loadDeckAndRetrieveSlides(deckId: string): Promise<JSX.IntrinsicElements[]> {
		return new Promise<JSX.IntrinsicElements[]>(async (resolve) => {
			if (!deckId) {
				errorStore.state.error = 'Deck is not defined';
				resolve(null);
				return;
			}

			busyStore.state.busy = true;

			try {
				const deck: Deck = await this.deckOfflineProvider.get(deckId);
				await set(`/decks/${deckId}`, deck);

				if (!deck || !deck.data) {
					errorStore.state.error = 'No deck could be fetched';
					resolve(null);
					return;
				}

				editorStore.state.deck = { ...deck };

				if (!deck.data.slides || deck.data.slides.length <= 0) {
					resolve([]);
					return;
				}

				// slides.forEach((slide) => {
				// 	// If one of slide.data.content is null, it will fail to display on deck
				// 	if (slide.data.content === null) slide.data.content = '';

				// 	if (slide.data.attributes === '') {
				// 		// change arrtibute from "" to {}
				// 		const modifiedSlide = {
				// 			id: slide.id,
				// 			data: {
				// 				...slide.data,
				// 				attributes: {},
				// 				template: slide.data.template,
				// 				update_at: slide.data.update_at,
				// 			},
				// 		};

				// 		set(`/decks/${deckId}/slides/${slide.id}`, modifiedSlide);
				// 	} else {
				// 		const modifiedSlide = {
				// 			id: slide.id,
				// 			data: {
				// 				...slide.data,
				// 				// content: modifySlideContent(slide.data.content),
				// 				attributes: transferToObj(slide.data.attributes),
				// 			},
				// 		};

				// 		set(`/decks/${deckId}/slides/${slide.id}`, modifiedSlide);
				// 	}
				// });

				await initTemplates();

				const promises: Promise<JSX.IntrinsicElements>[] = [];
				deck.data.slides.forEach((slideId: string) => {
					promises.push(this.fetchSlide(deck, slideId));
				});

				let parsedSlides: any[] = [];
				if (promises.length > 0) {
					parsedSlides = await Promise.all(promises);
				}

				if (!parsedSlides || parsedSlides.length <= 0) {
					resolve([]);
					return;
				}

				busyStore.state.busy = false;

				resolve(parsedSlides);
			} catch (err) {
				errorStore.state.error = err;
				busyStore.state.busy = false;
				resolve(null);
			}
		});
	}

	private fetchSlide(
		deck: Deck,
		slideId: string
	): Promise<JSX.IntrinsicElements> {
		return new Promise<JSX.IntrinsicElements>(async (resolve) => {
			try {
				let slide: Slide = await this.slideOfflineProvider.get(
					deck.id,
					slideId
				);
				await TemplateUtils.loadSlideTemplate(slide);

				const element: JSX.IntrinsicElements =
					await ParseSlidesUtils.parseSlide(slide, true);

				resolve(element);
			} catch (err) {
				resolve(null);
			}
		});
	}

	copySlide(slide: HTMLElement): Promise<JSX.IntrinsicElements> {
		return new Promise<JSX.IntrinsicElements>(async (resolve) => {
			try {
				if (!slide) {
					resolve(null);
					return;
				}

				if (!slide.getAttribute('slide_id')) {
					errorStore.state.error = 'Slide is not defined';
					resolve(null);
					return;
				}

				const slideId: string = slide.getAttribute('slide_id');

				let element: JSX.IntrinsicElements = null;

				if (editorStore.state.deck?.data) {
					const slide: Slide = await this.slideOfflineProvider.get(
						editorStore.state.deck.id,
						slideId
					);
					element = await ParseSlidesUtils.parseSlide(slide, true, true);
				}

				busyStore.state.busy = false;

				resolve(element);
			} catch (err) {
				errorStore.state.error = err;
				busyStore.state.busy = false;
				resolve(null);
			}
		});
	}
}
