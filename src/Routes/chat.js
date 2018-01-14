import { Route, Router } from '../VueRouteHelper';

// Login
import MessageHome from '../Views/Partials/Chat/Home.vue';
import MessageChat from '../Views/Partials/Chat/Chat.vue';

export default Router.add([
	Route('/', MessageHome).group(() => [
		Route(':roomid', MessageChat).name('chat.view'),
	]),

	Route('*', null).redirect('/'),
], true);
