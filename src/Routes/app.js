import { Route, Router } from '../VueRouteHelper';

// Store

// Library
import Library from '../Views/Library.vue';
import LibraryGameView from '../Views/Partials/Library/GameView.vue';

// Community

// Settings

export default Router.add([
	// Store
	Route('/store', null).name('store'),

	Route('/library', Library).group(() => [
		Route(':appid', LibraryGameView).name('library.game'),
	]).name('library'),

	// Community
	Route('/community', null).name('community'),

	// Settings
	Route('/settings', null).name('settings'),

	// Default Redirect
	Route('*', null).redirect('/library'),
], true);
