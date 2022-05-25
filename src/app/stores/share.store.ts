import { createStore } from '@stencil/store';

import { UserSocial } from './user.store';

export interface ShareData {
	title: string;
	userName: string | undefined;
	userSocial: UserSocial | undefined;
}

interface ShareStore {
	share: ShareData;
}

const { state, onChange, reset } = createStore({
	share: null,
} as ShareStore);

export default { state, onChange, reset };
