import api from '../utils/api';
import cache from '../../cache';
import library from '../utils/library';
import {
	LIBRARY_SEARCH,
	LIBRARY_LIST,
	REQUEST_LIBRARY_LIST,
	GET_LIBRARY_LIST_FAILURE,
	ADD_LIBRARY_ACHIEVEMENTS,
	UPDATE_GAME_SCREENSHOT,
	UPDATE_GAME_ACHIEVEMENT,
	UPDATE_GAME_INSTALL_STATE,
	ADD_LIBRARY_NEWS,
} from '../types';

const state = {
	loading     : false,
	searchQuery : null,
	games       : [],
	achievements: {},
	news        : {},
};

const actions = {
	searchLibrary({ commit }, query) {
		commit(LIBRARY_SEARCH, { query });
	},
	getLibrary({ commit }) {
		return new Promise((resolve, reject) => {
			commit(REQUEST_LIBRARY_LIST);

			api.get('library')
			   .then(response => {
				   commit(LIBRARY_LIST, {
					   games: response.data,
				   });

				   if (response.data.length > 0) {
					   for (let i = 0; i < response.data.length; i++) {
						   if (response.data[ i ].games.length > 0) {
							   return resolve(response.data[ i ].games[ 0 ]);
						   }
					   }
				   }

				   resolve(null);
			   })
			   .catch(error => {
				   commit(GET_LIBRARY_LIST_FAILURE, { error });
			   });
		});
	},
	getGameAchievements({ commit }, { gameID, userDataDir }) {
		return new Promise((resolve, reject) => {
			api.get(`game/${gameID}/achievements`)
			   .then(response => {
				   commit(ADD_LIBRARY_ACHIEVEMENTS, {
					   achievements: response.data,
					   gameID,
					   userDataDir,
				   });
				   resolve(response.data);
			   })
			   .catch(reject);
		});
	},
	getGameNews({ commit }, { gameID }) {
		return new Promise((resolve, reject) => {
			if (state.news.hasOwnProperty(gameID))
				return resolve(state.news[ gameID ]);

			api.get(`game/${gameID}/news`)
			   .then(response => {
				   commit(ADD_LIBRARY_NEWS, {
					   gameID,
					   news: response.data,
				   });
				   resolve(response.data);
			   })
			   .catch(reject);
		});
	},
	updateGameScreenshot({ commit }, { key, screenshots, gameID }) {
		commit(UPDATE_GAME_SCREENSHOT, { key, screenshots, gameID });
	},
	updateGameAchievementIcon({ commit }, { achievementID, resourcePath, isLocked }) {
		commit(UPDATE_GAME_ACHIEVEMENT, { achievementID, resourcePath, isLocked });
	},
	updateGameInstallState({ commit }, { games }) {
		commit(UPDATE_GAME_INSTALL_STATE, { games });
	},
};

const mutations = {
	[LIBRARY_SEARCH](state, action) {
		let query = action.query || '';

		if (query.trim().length <= 0) query = null;

		state.searchQuery = query;
	},
	[REQUEST_LIBRARY_LIST](state) {
		state.loading = true;
	},
	[LIBRARY_LIST](state, action) {
		state.loading = false;
		state.games   = action.games;
	},
	[GET_LIBRARY_LIST_FAILURE](state, action) {
		state.loading = false;
	},
	[ADD_LIBRARY_ACHIEVEMENTS](state, action) {
		if (!action.achievements) {
			if (!state.achievements.hasOwnProperty(action.gameID))
				state.achievements[ action.gameID ] = {};
			return;
		}

		const achievements = [];

		// Messy asf code ahead...
		Object.values(action.achievements.locked).forEach((l, k) => achievements.push({
			key  : Object.keys(action.achievements.locked)[ k ],
			value: l,
		}));
		Object.values(action.achievements.unlocked).forEach((u, k) => achievements.push({
			key  : Object.keys(action.achievements.unlocked)[ k ],
			value: u,
		}));

		if (achievements.length <= 0) return;

		achievements.forEach(a => {
			cache.grabImage(a.value.icon, 'achievements')
			     .then(data => {
				     action.achievements[ a.value.achieved ? 'unlocked' : 'locked' ][ a.key ].icon = data[ 0 ];
			     })
			     .catch(console.error);
		});

		state.achievements[ action.gameID ] = action.achievements;
	},
	[UPDATE_GAME_SCREENSHOT](state, action) {
		const game = library.findGameInCategories(state.games, action.gameID);
		if (!game) return;

		if (Array.isArray(action.screenshots)) {
			action.screenshots.forEach(shots => {
				game.screenshots[ shots.index ] = shots.resourcePath;
			});
		} else
			game.screenshots[ action.key ] = action.screenshots;
	},
	[UPDATE_GAME_ACHIEVEMENT](state, action) {
		const gameAchievements = state.achievements[ action.gameID ];
		if (!gameAchievements) return;

		let achievement = gameAchievements[ action.isLocked ? 'locked' : 'unlocked' ]
			.find(a => a.id === action.achievementID);

		if (!achievement) return;

		achievement.icon = action.resourcePath;
	},
	[UPDATE_GAME_INSTALL_STATE](state, action) {
		state.games.forEach(c => c.games.forEach(g => g.isInstalled = false));
		action.games.forEach(g => {
			const game = library.findGameInCategories(state.games, g.id);
			if (!game) return;
			game.isInstalled = true;
		});
	},
	[ADD_LIBRARY_NEWS](state, action) {
		if (!state.hasOwnProperty(action.gameID))
			state.news[ action.gameID ] = [];

		state.news[ action.gameID ] = action.news;
	},
};

export default {
	state,
	actions,
	mutations,
}
