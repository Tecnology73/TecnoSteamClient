<template>
	<div class="library-game-view" v-if="game">
		<div class="game-slideshow">
			<div class="screenshot-primary" :class="{ 'active': slideshowPrimaryActive }"
			     :style="{ 'background-image': `url(${slideshow.first})` }" v-if="slideshow.first"></div>
			<div class="screenshot-secondary" :class="{ 'active': !slideshowPrimaryActive }"
			     :style="{ 'background-image': `url(${slideshow.second})` }" v-if="slideshow.second"></div>
		</div>

		<div class="game-content">
			<div class="game-info">
				<div class="game-title">
					<div class="game-icon" :style="{ 'background-image': `url(${game.logo})` }"></div>
					<h2>{{ game.name }}</h2>
				</div>

				<div class="game-play-stats">
					<div class="play-button" @click="launchGame">
						<span class="fa" :class="[ !game.isInstalled ? 'fa-download' : 'fa-play' ]"></span>
					</div>

					<div class="play-stats" v-if="game.stats">
						<div class="played-for" v-if="game.stats.playtimeForever">
							<div class="accent-highlight">Played For</div>
							<div class="play-stats-counter">{{ game.stats.playtimeForever }}</div>
						</div>

						<div class="last-played" v-if="game.stats.lastPlayed">
							<div class="accent-highlight">Last Played</div>
							<div class="play-stats-counter">{{ game.stats.lastPlayed }}</div>
						</div>
					</div>
				</div>

				<div class="game-friends" v-if="gameFriends">
					<div class="section-title">Friends</div>

					<div class="section-sub-title">
						{{ gameFriends.length }} friend{{ gameFriends.length === 1 ? '' : 's'
						}} play this game
					</div>

					<div class="game-friends-group">
						<div class="game-friends-item persona-state" v-for="(friend, $i) in gameFriends"
						     :key="friend.id" :style="{ 'background-image': `url(${friend.avatarFull})` }"
						     :class="friend.personaState" v-tooltip="friendTooltip(friend)"></div>
					</div>
				</div>

				<div class="game-achievements" v-if="achievements && achievements.stats.total > 0">
					<div class="section-title">Achievements</div>

					<div class="game-achievement-recent" v-if="achievements.recent">
						<div class="achievement-badge" :style="{ 'background-image':
							`url(${achievements.recent.icon})` }"></div>

						<div class="achievement-info">
							<div class="recent-title">Most Recent</div>
							<div class="achievement-title accent-highlight">{{
								achievements.recent.displayName }}
							</div>

							<div class="game-achievement-stats">
								You've unlocked {{ achievements.stats.unlocked }}/{{
								achievements.stats.total }} ({{ achievements.stats.percent }}%)
							</div>
						</div>
					</div>

					<div class="game-achievement-stats" v-else-if="achievements.stats">
						You've unlocked {{ achievements.stats.unlocked }}/{{
						achievements.stats.total }} ({{ achievements.stats.percent }}%)
					</div>

					<div class="game-achievement-bar-outer" v-if="achievements && achievements.stats">
						<div class="game-achievement-bar-inner"
						     :style="{ 'width': achievements.stats.percent + '%' }"></div>
					</div>

					<div class="section-sub-title">Locked Achievements</div>

					<div class="game-achievements-locked">
						<div class="locked-achievement-item" v-for="achievement in
							achievements.locked"
						     :style="{ 'background-image': `url(${achievement.icon})` }"
						     v-tooltip="achievementTooltip(achievement)"></div>
					</div>

					<router-link class="game-achievements-view-all accent-highlight" :to="{ name: '' }">
						Show all Achievements
					</router-link>
				</div>

				<div class="game-dlc"></div>

				<div class="game-workshop"></div>

				<div class="game-news" v-if="news && news.length > 0">
					<div class="section-title">Latest News</div>

					<div class="game-news-group">
						<div class="game-news-item" v-for="(item, $index) in news" :key="$index">
							<div class="news-title">{{ item.title }}</div>
							<div class="news-content" v-if="item.content" v-html="getNewsContent(item.content)"></div>

							<div class="news-info">
								{{ formatItemPosted(item.posted) }} - {{ item.label }}
							</div>
						</div>
					</div>
				</div>
			</div>

			<div class="game-links">
				<div class="section-title" v-if="game.links">Links</div>

				<div class="game-link-group" v-if="game.links">
					<router-link class="game-link-item" v-for="(link, $index) in game.links"
					             :to="{ name: '' }" :key="$index">
						{{ link }}
					</router-link>
				</div>

				<div class="section-title" v-if="game.userCategories.length > 0">Categories</div>

				<div class="game-category-group" v-if="game.userCategories.length > 0">
					<router-link class="game-category-item"
					             v-for="category in game.userCategories"
					             :to="{ name: '' }" :key="category.id">
						{{ category.name }}
					</router-link>
				</div>

				<div class="friends-status">
					<div class="friends-view-all" @click="openFriendsWindow">
						View all Friends
					</div>

					<div class="status-group">
						<div class="friends-online">
							{{ onlineFriends.length }} Online
						</div>

						<div class="user-status" :class="user.personaState.toLowerCase()">
							{{ user.personaState }}
						</div>
					</div>
				</div>
			</div>
		</div>
	</div>
</template>

<script>
	import Vue from 'vue';
	import { remote, ipcRenderer } from 'electron';
	import { mapState, mapActions } from 'vuex';
	import cache from '../../../cache';
	import path from 'path';
	import moment from 'moment';
	import EPersonaState from 'steam-user/enums/EPersonaState';

	export default {
		data() {
			return {
				slideshowTimer        : null,
				slideshowIndex        : 0,
				slideshow             : {
					first : null,
					second: null,
				},
				slideshowPrimaryActive: true,
				achievements          : null,
				news                  : [],
				user                  : {
					personaState: '',
				},
			};
		},
		created() {
			const gameID = parseInt(this.$route.params.appid);

			if (this.libraryAchievements.hasOwnProperty(gameID))
				this.achievements = this.libraryAchievements[ gameID ];

			this.getGameAchievements({
				gameID,
				userDataDir: remote.app.getPath('userData'),
			}).then(e => this.achievements = e);

			this.getGameNews({ gameID }).then(e => this.news = e);

			this.SteamClient.on('currentUser', user => {
				Vue.set(this.user, 'personaState', this.SteamClient.personaState);
				console.log('State: ' + this.SteamClient.personaState);
			});

			this.user.personaState = this.SteamClient.personaState;
		},
		mounted() {
			if (this.game) {
				if (Array.isArray(this.game.screenshots) && this.game.screenshots.length > 0) {
					this.preloadImages();
					this.cycleToScreenshot(Math.floor(Math.random() * this.game.screenshots.length) + 1);
				}
			}
		},
		methods : {
			...mapActions([
				'getGameAchievements',
				'getGameNews',
				'updateGameScreenshot',
				'updateGameAchievementIcon',
			]),
			getUser(steamid) {
				return this.SteamClient.getUser(steamid.toString());
			},
			getUserAvatar(steamid) {
				const user = this.getUser(steamid);
				return (user ? user.avatar_url_full : null);
			},
			getPersonaState(steamid, lowerCase = false) {
				const user  = this.getUser(steamid);
				const state = (user && user.persona_state ? EPersonaState[ user.persona_state ] : 'Offline');
				return (lowerCase ? state.toLowerCase() : state);
			},
			preloadImages() {
				const imageQueue = [];

				this.game.screenshots.forEach((image, key) => {
					if (image.startsWith('/dist/cache')) return;

					imageQueue.push(cache.grabImage(image, 'screenshots', null, key));
				});

				// We wait for all of the cache jobs to finish
				// that way it doesn't hold up the client
				Promise.all(imageQueue)
				       .then(values => {
					       const screenshots = values.map(v => {
						       return {
							       index       : v[ 2 ],
							       resourcePath: v[ 0 ],
						       };
					       });

					       this.updateGameScreenshot(({
						       screenshots,
						       gameID: this.gameID,
					       }));
				       });
			},
			cycleToScreenshot(index = null) {
				if (!this.game || !Array.isArray(this.game.screenshots)) return;
				if (index === null) index = this.slideshowIndex;
				if (index >= this.game.screenshots.length) index = 0;

				this.slideshow[ (this.slideshowPrimaryActive ? 'second' : 'first') ] = this.game.screenshots[ index ];

				this.slideshowPrimaryActive = !this.slideshowPrimaryActive;

				let maxRandomAttempts = 5;

				while (this.slideshowIndex === index) {
					this.slideshowIndex = Math.floor((Math.random() * this.game.screenshots.length) + 1);

					if (maxRandomAttempts-- <= 0) break;
				}

				if (this.slideshowIndex >= this.game.screenshots.length)
					this.slideshowIndex = 1;

				if (this.game.screenshots.length > 1)
					this.slideshowTimer = setTimeout(this.cycleToScreenshot.bind(this), 5000);
			},
			launchGame() {
				if (!this.game) return;

				remote.shell.openExternal(`steam://rungameid/${this.game.id}`);
			},
			getNewsContent(content, shorten = true) {
				let safeContent = content.replace(/(<(img)([^>]+)?>)|(<(iframe|video)([^>]+)?><\/(iframe|video)>)/ig, '');
				safeContent     = safeContent.replace(/<br[^>]+>/ig, ' ');
				safeContent     = safeContent.replace(/<h\d+>([^>]+)<\/h\d+>/ig, (match, p1) => {
					return p1;
				});

				if (shorten && safeContent.length > 300)
					safeContent = safeContent.substr(0, 300);

				return safeContent;
			},
			formatItemPosted(posted) {
				return moment.utc(posted).calendar(null, {
					sameDay : '[Today]',
					lastDay : '[Yesterday]',
					lastWeek: '[Last] dddd',
					sameElse: 'DD/MM/YYYY',
				});
			},
			friendTooltip(friend) {
				const tooltipData   = {
					content : friend.nickname,
					position: 'top',
				};
				const friendDetails = this.getUser(friend.steamIds.id64);
				let subContentClass = null;
				let subContent      = null;

				if (friendDetails) {
					if (friendDetails.game_name) {
						subContent      = `In-Game: ${friendDetails.game_name}`;
						subContentClass = 'theme-success';
					}
					else if (friendDetails.persona_state) {
						switch (EPersonaState[ friendDetails.persona_state ]) {
							case 'Away':
								subContent      = 'Away';
								subContentClass = 'theme-info-alternate';
								break;
							case 'Busy':
								subContent      = 'Busy';
								subContentClass = 'theme-danger';
								break;
							case 'Snooze':
								subContent      = 'Snooze';
								subContentClass = 'theme-warning';
								break;
							default:
								subContent      = 'Online';
								subContentClass = 'theme-accent';
								break;
						}
					}
				}

				if (subContent && subContentClass)
					tooltipData.subContent = `<span class='tooltip-friend-game ${subContentClass}'>${subContent}</span>`;

				return tooltipData;
			},
			achievementTooltip(achievement) {
				const data = {
					content : achievement.displayName,
					position: 'top',
				};

				return data;
			},
			openFriendsWindow() {
				ipcRenderer.send('createFriendWindow', (friendWindow) => {
				});
			},
		},
		computed: {
			...mapState({
				searchQuery        : ({ library }) => library.searchQuery,
				games              : ({ library }) => library.games,
				libraryAchievements: ({ library }) => library.achievements,
			}),
			game() {
				for (let i = 0; i < this.games.length; i++) {
					for (let c = 0; c < this.games[ i ].games.length; c++) {
						if (this.games[ i ].games[ c ].id === this.gameID) {
							return this.games[ i ].games[ c ];
						}
					}
				}

				return null;
			},
			gameFriends() {
				const game = this.game;

				if (game) {
					const friends = JSON.parse(JSON.stringify(game.friends));

					friends.forEach((friend, index) => {
						const user = this.getUser(friend.steamIds.id64);

						friend.avatarFull    = user.avatar_url_full;
						friend._personaState = user.persona_state;
						friend.personaState  = (user.persona_state ?
						                        EPersonaState[ user.persona_state ].toLowerCase() :
						                        'offline');

						if (user.game_name && user.gameid) {
							friend._personaState = EPersonaState[ 'Max' ];
							friend.personaState  = 'in-game';
						}
					});

					friends.sort((a, b) => {
						const aState = (a._personaState || 0);
						const bState = (b._personaState || 0);

						if (aState === 0) return 1;
						if (bState === 0) return -1;
						if (aState < bState) return 1;
						if (aState > bState) return -1;
						return 0;
					});

					return friends;
				}

				return [];
			},
			gameID() {
				const gameID = parseInt(this.$route.params.appid);
				return (isNaN(gameID) ? null : gameID);
			},
			onlineFriends() {
				const onlineFriends = [];
				const userIds       = Object.keys(this.SteamClient.client.users);

				Object.values(this.SteamClient.client.users).forEach((user, key) => {
					if (user.persona_state !== EPersonaState[ 'Offline' ] &&
					    user.persona_state !== null &&
					    userIds[ key ] !== this.SteamClient.steamID64) {
						onlineFriends.push(user);
					}
				});

				return onlineFriends;
			},
			personaState() {
				return this.SteamClient.personaState;
			},
			SteamClient() {
				return remote.app.SteamClient;
			},
		},
		watch   : {
			'game'(newValue, oldValue) {
				this.preloadImages();
				this.cycleToScreenshot(Math.floor(Math.random() * this.game.screenshots.length) + 1);
			},
		},
	}
</script>

<style scoped lang="scss">
	@import '../../../scss/variables';

	.library-game-view {
		position: absolute;
		top: 0;
		left: 0;
		width: 100%;
		height: 100%;
		overflow: hidden;

		.game-content .game-info {
			flex: 1 1 100%;
			overflow-y: auto;
			overflow-x: hidden;
			padding: 0 1em 0 2em;
			margin-right: 1em;

			> div {
				margin-top: 1em;
			}

			.section-title {
				margin-bottom: 0.5em;
				font-size: 1.1em;
				font-weight: 400;
				letter-spacing: 0.05em;
			}

			.game-title {
				display: flex;

				.game-icon {
					display: inline-block;
					width: 100px;
					height: 50px;
					margin-right: 1em;
					background-size: contain;
					background-repeat: no-repeat;
					background-position: 50%;
				}

				h2 {
					display: inline-block;
					line-height: 50px;
					margin: 0;
					font-weight: 500;
					letter-spacing: 0.05em;
				}
			}

			.game-play-stats {
				display: flex;

				.play-button {
					flex: 0 0 50px;
					line-height: 50px;
					color: $theme-accent-color;
					font-size: 2em;
					text-align: center;
					cursor: pointer;
					transition: transform ease-in-out 0.25s;

					&:hover {
						transform: scale(1.1);
					}
				}

				.play-stats {
					flex: 1 1 100%;
					line-height: 1.5em;
					margin-top: 0.25em;

					> div {
						display: flex;
					}

					.accent-highlight {
						flex: 0 0 7em;
						font-weight: 600;
					}

					.accent-highlight,
					.play-stats-counter {
						display: inline-block;
					}
				}
			}

			.game-friends {
				margin-top: 2em;
				margin-bottom: 2em;

				.section-sub-title {
					font-weight: 500;
					font-size: 0.9em;
				}

				.game-friends-group {
					display: flex;
					margin-top: 1em;

					.game-friends-item {
						flex: 0 0 40px;
						width: 40px;
						height: 40px;
						margin-right: 1em;
						border-radius: 50%;
						background-size: cover;
						background-repeat: no-repeat;
						background-position: 50%;
						cursor: pointer;
					}
				}
			}

			.game-achievements {
				.game-achievement-recent {
					display: flex;
					align-items: center;
					margin-bottom: 1em;

					.achievement-badge {
						flex: 0 0 50px;
						width: 50px;
						height: 50px;
						border-radius: 50%;
						margin-right: 1em;
					}

					.achievement-info {
						flex: 0 0 100%;
						font-weight: 500;

						.achievement-title,
						.game-achievement-stats {
							font-size: 0.9em;
						}
					}
				}

				.game-achievement-stats {
					font-size: 0.9em;
					margin-bottom: 1em;
				}

				.game-achievement-recent .achievement-badge,
				.game-achievements-locked .locked-achievement-item {
					background-repeat: no-repeat;
					background-size: cover;
					background-position: 50%;
				}

				.game-achievement-bar-outer {
					width: 100%;
					height: 2px;
					margin-bottom: 2em;
					background-color: rgba(255, 255, 255, 0.25);

					.game-achievement-bar-inner {
						height: 100%;
						background-color: rgba(255, 255, 255, 0.5);
						transition: width ease-in-out 1s;
					}
				}

				.section-sub-title {
					margin: 1em 0;
					color: inherit;
					text-transform: none;
					font-size: 0.9em;
					font-weight: 500;
				}

				.game-achievements-locked {
					display: flex;
					flex-wrap: wrap;
					max-height: 40px;
					margin-bottom: 1em;
					overflow: hidden;

					.locked-achievement-item {
						flex: 0 0 40px;
						width: 40px;
						height: 40px;
						margin-right: 1em;
						border-radius: 50%;
						filter: grayscale(1);
						cursor: pointer;
						margin-bottom: 0.1em;
					}
				}

				.game-achievements-view-all {
					font-weight: 600;
					text-transform: uppercase;
					font-size: 0.9em;
				}
			}

			.game-news {
				margin-top: 2.5em;
				margin-bottom: 2.5em;

				.game-news-group {
					.game-news-item {
						cursor: pointer;

						&:not(:last-child) {
							margin-bottom: 2em;
						}

						.news-title {
							font-weight: 600;
							font-size: 1.05em;
							margin-bottom: 0.5em;
						}

						.news-content {
							max-height: 2.75em;
							overflow: hidden;
							color: rgb(200, 200, 200);
							margin-bottom: 0.5em;
						}

						.news-info {
							font-size: 0.9em;
							color: rgba(150, 150, 150, 0.75);
							font-weight: 600;
						}
					}
				}
			}
		}

		.game-content .game-links {
			display: flex;
			flex-direction: column;
			flex: 0 0 200px;
			overflow-y: auto;
			margin-top: 1em;

			.section-title {
				margin-bottom: 0.5em;
			}

			.game-link-group {
				flex: 0 0 auto;
			}

			.game-category-group {
				flex: 0 0 auto;
			}

			[class*='router-link-'] {
				display: block;
				line-height: 1.75em;
			}

			.friends-status {
				text-align: right;
				padding: 1em;
				font-weight: 500;
				font-size: 0.9em;
				margin-top: auto;

				.friends-view-all {
					text-transform: uppercase;
					margin-bottom: 0.25em;
					cursor: pointer;
				}

				.status-group {
					.friends-online {
						display: inline-block;
						color: #999;
					}

					.user-status {
						display: inline-block;
						margin-left: 0.5em;
						color: #9E9E9E;

						&.online {
							color: #4CAF50;

							&::after {
								background-color: #4CAF50;
							}
						}

						&.away {
							color: #2196F3;

							&::after {
								background-color: #2196F3;
							}
						}

						&.busy {
							color: #F44336;

							&::after {
								background-color: #F44336;
							}
						}

						&::after {
							float: right;
							content: '';
							width: 8px;
							height: 8px;
							border-radius: 50%;
							margin-top: 0.35em;
							margin-left: 0.5em;
							background-color: #9E9E9E
						}
					}
				}
			}
		}

		.game-slideshow {
			position: absolute;
			top: 0;
			left: 0;
			width: 100%;
			height: 100%;
			pointer-events: none;
			filter: blur(5px);
			overflow: hidden;

			> [class^="screenshot-"] {
				position: absolute;
				top: 0;
				left: 0;
				width: 100%;
				height: 100%;
				background-repeat: no-repeat;
				background-size: cover;
				background-position: 50%;
				opacity: 0;
				transition: opacity ease-in-out 1s;

				&.active {
					opacity: 1;
				}
			}

			&::after {
				position: absolute;
				content: '';
				top: 0;
				left: 0;
				width: 100%;
				height: 100%;
				background-color: rgba(0, 0, 0, 0.75);
			}
		}

		.game-content {
			position: absolute;
			top: 0;
			left: 0;
			z-index: 1;
			display: flex;
			height: 100%;
			width: 100%;
		}
	}
</style>
