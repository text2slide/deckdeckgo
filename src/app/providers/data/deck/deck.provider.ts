import {
	Deck,
	DeckEntries,
	DeleteDeck,
	SnapshotDeck,
} from '@deckdeckgo/editor';

import { DeckOfflineProvider } from './deck.offline.provider';

import { cloud } from '../../../utils/core/environment.utils';
import { cloudProvider } from '../../../utils/core/providers.utils';
import { fetchData } from '../../../utils/core/api.utils';
import { ApiUrls } from '../../../types/core/apiUrls';
import errorStore from '../../../stores/error.store';

export const decks = async (userId: string): Promise<Deck[]> => {
	return DeckOfflineProvider.getInstance().entries(userId);
};

export const deleteDeck = async (deckId: string): Promise<void> => {
	return DeckOfflineProvider.getInstance().delete(deckId);
};

export const snapshotDeck = async ({
	deckId,
	onNext,
}: {
	deckId: string;
	onNext: (snapshot: Deck) => void;
}): Promise<() => void | undefined> => {
	if (cloud()) {
		const { snapshotDeck: snapshotUserDeck }: { snapshotDeck: SnapshotDeck } =
			await cloudProvider<{ snapshotDeck: SnapshotDeck }>();

		return snapshotUserDeck({ deckId, onNext });
	}

	throw new Error('No publish offline');
};