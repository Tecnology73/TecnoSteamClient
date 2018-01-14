import Vue from 'vue';
import VueRouter from 'vue-router';
import routes from './Routes/chat';

Vue.use(VueRouter);

// Global Components
import Chat from './Views/Layouts/Chat.vue';

Vue.component('chat', Chat);

// Global Packages
window.$ = window.jQuery = require('jquery');
window.SteamClient = require('electron').remote.app.SteamClient;

const router = new VueRouter({
	routes,
});

const app = new Vue({
	router,
}).$mount('#appRoot');

window.SteamClient = require('electron').remote.app.SteamClient;

$(document).click((e) => {
	$('.v-dropdown').each(function () {
		if ($(e.target).parents('.v-dropdown').get(0) === this) return;
		this.__vue__.close();
	});
});
