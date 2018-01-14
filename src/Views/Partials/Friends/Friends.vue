<template>
	<div class="friends-list-container">
		<div class="friends-item" v-for="friend in sortedFriends"
		     :class="'persona-state-' + friend.personaState.toLowerCase()" @click="createChatWindow(friend.steamid64)">
			<div class="friend-avatar persona-state" :style="{ 'background-image': `url(${friend.avatarFull})` }"
			     :class="friend.personaState.toLowerCase()"></div>

			<div class="friend-info">
				<div class="name">{{ friend.player_name }}</div>
				<div class="persona">{{ friend.personaState }}</div>
				<div class="game">{{ friend.game_name }}</div>
			</div>
		</div>
	</div>
</template>

<script>
	import { remote, ipcRenderer } from 'electron';
	import EPersonaState from 'steam-user/enums/EPersonaState';

	export default {
		data() {
			return {
				searchQuery: '',
			}
		},
		methods : {
			createChatWindow(accountid) {
				ipcRenderer.send('createChatWindow', { accountid });
			},
		},
		computed: {
			sortedFriends() {
				const queryRegex = /(game|state):([\w-]+)/ig;

				let users     = Object.keys(this.SteamClient.users);
				const friends = [];

				users.forEach(friend => {
					if (friend === this.SteamClient.steamID64) return;

					const user = this.SteamClient.getUser(friend.toString());

					if (!user) return;

					user.steamid64     = friend.toString();
					user.avatarFull    = user.avatar_url_full;
					user._personaState = user.persona_state;
					user.personaState  = (user.persona_state ? EPersonaState[ user.persona_state ] : 'Offline');

					if (user.game_name && user.gameid) {
						user._personaState = EPersonaState[ 'Max' ];
						user.personaState  = 'In-Game';
					}

					if (this.searchQuery) {
						let query      = this.searchQuery;
						let queryCheck = false;

						const matches = query.match(queryRegex);

						if (matches) {
							for (let i = 0; i < matches.length; i++) {
								const query = matches[ i ].toLowerCase().split(':');

								switch (query[ 0 ]) {
									case 'game':
										if (user.gameid && user.game_name)
											queryCheck = ~user.game_name.toLowerCase().indexOf(query[ 1 ]);
										break;
									case 'state':
										queryCheck = ~user.personaState.toLowerCase().indexOf(query[ 1 ]);
										break;
								}

								if (queryCheck) break;
							}

							if (!queryCheck) return;

							query = query.replace(matches.join(' '), '').trim();
						}

						// Match player names
						let userQueryCheck = false;

						if (query) {
							if (!~user.player_name.toLowerCase().indexOf(query.toLowerCase()))
								return;
						}
					}

					friends.push(user);
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
			},
			SteamClient() {
				return remote.app.SteamClient;
			},
		},
		watch   : {
			'$route'(newValue, oldValue) {
				this.searchQuery = newValue.query.q;
			},
		},
	}
</script>

<style scoped lang="scss">
	.friends-list-container {
		height: 100%;
		overflow: hidden;
		overflow-y: scroll;

		.friends-item {
			display: flex;
			flex: 0 0 auto;
			align-items: center;
			padding: 0.25em 1em;
			cursor: pointer;
			transition: background-color ease-in-out 0.1s;

			&:hover {
				background-color: rgba(255, 255, 255, 0.05);
			}

			.friend-avatar {
				flex: 0 0 40px;
				width: 40px;
				height: 40px;
				border-radius: 50%;
				background-position: 50%;
				background-size: cover;
				background-repeat: no-repeat;
				margin-right: 1em;
			}

			.friend-info {
				flex: 1 1 100%;
				font-size: 0.9em;
				font-weight: 600;
				overflow: hidden;

				> div {
					overflow: hidden;
					text-overflow: ellipsis;
					white-space: nowrap;
				}

				.persona,
				.game {
					font-size: 0.9em;
				}

				.game {
					min-height: 1.3em;
				}
			}
		}
	}
</style>
