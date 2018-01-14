import { Route, Router } from '../VueRouteHelper';

import FriendsHome from '../Views/Partials/Friends/Home.vue';
import FriendsList from '../Views/Partials/Friends/Friends.vue';

export default Router.add([
	Route('/friends', FriendsHome)
		.group(() => [
			Route('/', FriendsList).name('friends.list'),
		]),

	Route('*', null).redirect('/friends'),
], true);
