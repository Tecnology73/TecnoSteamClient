import Vue from 'vue';
import Vuex from 'vuex';
import createLogger from 'vuex/dist/logger';

// Modules
import global from './modules/global';
import library from './modules/library';
import user from './modules/user';

import * as actions from './actions';
import * as getters from './getters';

Vue.use(Vuex);

const debug = (process.env.NODE_ENV !== 'production');

export default new Vuex.Store({
	//actions,
	//getters,
	modules: {
		global,
		library,
		user,
	},
	strict : debug,
	plugins: (debug ? [ createLogger() ] : []),
})
