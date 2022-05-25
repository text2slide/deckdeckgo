import { createStore } from '@stencil/store';

import { User } from '@deckdeckgo/editor';

export interface UserSocial {
	twitter?: string;
	linkedin?: string;
	dev?: string;
	medium?: string;
	github?: string;
	custom?: string;
	custom_logo_url?: string;
	pageNumber?: string;
}

interface UserStore {
	user: User | undefined;
	photoUrl: string | undefined;
	name: string | undefined;
	social: UserSocial | undefined;
}

const { state, onChange, reset } = createStore({
	user: {
		data: {
			social: {
				pageNumber: 'true',
			},
		},
	},
	photoUrl: undefined,
	name: undefined,
	social: {
		pageNumber: 'true',
	},
} as UserStore);

onChange('user', (user: User | undefined) => {
	state.photoUrl = user?.data?.photo_url ?? undefined;
	state.name = user?.data?.name ?? undefined;
	state.social = user?.data?.social ?? {
		pageNumber: 'true',
	};
});

export default { state, onChange, reset };
