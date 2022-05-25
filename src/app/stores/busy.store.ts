import { createStore } from '@stencil/store';

interface BusyStore {
	busy: boolean | undefined;
	slideReady: boolean;
	deckReady: boolean;
	docReady: boolean;
	addSlide: boolean;
}

const { state, onChange } = createStore<BusyStore>({
	busy: undefined,
	slideReady: false,
	deckReady: false,
	docReady: false,
	addSlide: false,
});

export default { state, onChange };
