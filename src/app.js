import Vue from 'vue';
import VueRouter from 'vue-router';
import store from './Store';
import routes from './Routes/app';
import directives from './Directives';

Vue.use(VueRouter);

// Global Components
import App from './Views/Layouts/App.vue';

Vue.component('app', App);
// --- END ---

// Global Packages
window.$ = window.jQuery = require('jquery');
window.SteamClient = require('electron').remote.app.SteamClient;

const router = new VueRouter({
	routes,
});

const app = new Vue({
	router,
	store,
	computed: {
		app() {
			return this.$children[ 0 ];
		},
	},
}).$mount('#appRoot');

// Hook into Steam interface
SteamClient.on('friendsList', console.log);
SteamClient.on('users', console.log);

// Initiate steam login
//SteamClient.clientReady();

$(document).click((e) => {
	$('.v-dropdown').each(function () {
		if ($(e.target).parents('.v-dropdown').get(0) === this) return;
		this.__vue__.close();
	});
});
