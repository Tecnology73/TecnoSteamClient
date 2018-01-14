import Vue from 'vue';
import VueRouter from 'vue-router';
import routes from './Routes/auth';

Vue.use(VueRouter);

// Global Components
import Auth from './Views/Layouts/Auth.vue';

Vue.component('auth', Auth);

const router = new VueRouter({
	routes,
});

const app = new Vue({
	router,
}).$mount('#appRoot');

window.SteamClient = require('electron').remote.app.SteamClient;
