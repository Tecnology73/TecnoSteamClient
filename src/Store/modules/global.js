import {
	GLOBAL_TOGGLE_SIDEBAR,
} from '../types';

const state = {
	sidebarCollapsed: false,
};

const actions = {
	toggleSidebar({ commit }, collapse = null) {
		commit(GLOBAL_TOGGLE_SIDEBAR, { collapse });
	},
};

const mutations = {
	[GLOBAL_TOGGLE_SIDEBAR](state, action) {
		state.sidebarCollapsed = action.collapse || !state.sidebarCollapsed;
	},
};

export default {
	state,
	actions,
	mutations,
}
