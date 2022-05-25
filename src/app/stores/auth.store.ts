import { createStore } from '@stencil/store';

import { AuthUser } from '@deckdeckgo/editor';

/* *NOTE* 登入後存 authUser 在local storage，登出後清除 */
interface AuthStore {
	authUser: AuthUser | null;
	loggedIn: boolean;
	gitHub: boolean;
}

const { state, onChange, reset } = createStore<AuthStore>({
	authUser: null,
	loggedIn: false,
	gitHub: false,
});

onChange('authUser', (authUser: AuthUser | null) => {
	state.loggedIn = authUser && authUser.state === 'authenticated';
	state.gitHub = authUser ? authUser.gitHub : false;
});

export default { state, onChange, reset };
