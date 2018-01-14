import { Route, Router } from '../VueRouteHelper';

// Login
import LoginHome from '../Views/Partials/Auth/Login.vue';

// Steam Guard
import SteamGuard from '../Views/Partials/Auth/SteamGuard.vue';

// Register
import Register from '../Views/Partials/Auth/Register.vue';

export default Router.add([
	Route('/login', LoginHome).name('login'),

	Route('/guard', SteamGuard).name('login.guard'),

	Route('/register', Register).name('register'),

	Route('*', null).redirect('/login'),
], true);
