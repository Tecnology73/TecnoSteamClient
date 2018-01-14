import api from '../utils/api';
import {
	USER_INFO,
	GET_USER_INFO_FAILURE,
	REQUEST_USER_INFO,
} from '../types';

const state = {
	loading : false,
	userInfo: {},
};

const actions = {
	getUserInfo({ commit }) {
		commit(REQUEST_USER_INFO);

		api.get('me')
		   .then(response => {
			   commit(USER_INFO, {
				   info: response.data,
			   });
		   })
		   .catch(error => {
			   commit(GET_USER_INFO_FAILURE, error);
		   });
	},
};

const mutations = {
	[REQUEST_USER_INFO](state) {
		state.loading = true;
	},
	[USER_INFO](state, action) {
		state.loading  = false;
		state.userInfo = action.info;
	},
	[GET_USER_INFO_FAILURE](state, action) {
		state.loading = false;
	},
};

export default {
	state,
	actions,
	mutations,
}
