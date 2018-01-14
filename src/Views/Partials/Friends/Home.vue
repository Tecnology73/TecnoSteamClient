<template>
	<div class="home-container">
		<div class="body">
			<div class="user-info">
				<div class="user-avatar persona-state" :class="[ 'persona-state-' + personaState.toLowerCase() ]"
				     :style="{ 'background-image': `url(${currentUser.avatar_url_full})` }"></div>

				<div class="user-name" :class="[ 'persona-state-' + personaState.toLowerCase() ]">
					{{ currentUser.player_name }}

					<div class="user-persona">
						{{ personaState }}
					</div>
				</div>

				<dropdown alignment="right">
					<div slot="button">
						<span class="fa fa-caret-down"></span>
					</div>

					<div slot="content">
						<div class="dropdown-item" @click="setPersona('Online')">Online</div>
						<div class="dropdown-item" @click="setPersona('Away')">Away</div>
						<div class="dropdown-item" @click="setPersona('Busy')">Busy</div>
						<div class="dropdown-item" @click="setPersona('Offline')">Offline</div>
					</div>
				</dropdown>
			</div>

			<div class="search-bar">
				<input class="form-control form-control-block" placeholder="Search..." v-model="searchQuery">
			</div>

			<div class="friends-container">
				<div class="tab-group">
					<div class="tab-item selected">Friends</div>
					<div class="tab-item">Groups</div>
				</div>

				<div class="tab-body">
					<transition name="growShrink">
						<router-view></router-view>
					</transition>
				</div>
			</div>
		</div>
	</div>
</template>

<script>
	import Vue from 'vue';
	import { remote } from 'electron';
	import Dropdown from '../../../Components/Dropdown.vue';
	import EPersonaState from 'steam-user/enums/EPersonaState';

	export default {
		data() {
			return {
				searchQuery : '',
				personaState: '',
			}
		},
		created() {
			this.updateUserPersona();

			this.SteamClient.on('currentUser', (user) => this.updateUserPersona(this.SteamClient._personaState));
		},
		beforeDestroy() {
			this.SteamClient.removeListener('currentUser', this.updateUserPersona.bind(this));
		},
		computed  : {
			currentUser() {
				return this.SteamClient.currentUser;
			},
			SteamClient() {
				return remote.app.SteamClient;
			},
		},
		methods   : {
			updateUserPersona(overrideState = null) {
				let state  = this.SteamClient._personaState;
				const user = this.SteamClient.currentUser;

				if (overrideState && typeof overrideState !== 'string')
					state = EPersonaState[ overrideState ];

				if (user.gameid !== null && user.game_name)
					state = 'In-Game';

				if (typeof state !== 'string')
					state = EPersonaState[ state ];

				this.personaState = state;
			},
			setPersona(state) {
				state = EPersonaState[ state ];

				this.SteamClient.personaState = state;
				this.updateUserPersona(state);
			},
		},
		watch     : {
			'searchQuery'(newValue, oldValue) {
				if (newValue !== oldValue)
					this.$router.push({ query: { q: newValue } });
			},
		},
		components: {
			Dropdown,
		},
	}
</script>

<style scoped lang="scss">
	@import '../../../scss/variables';

	.home-container {
		display: flex;
		flex-direction: column;
		height: 100%;

		.body {
			display: flex;
			flex-direction: column;

			.user-info {
				display: flex;
				flex: 0 0 75px;
				align-items: center;
				box-shadow: 0 2px 3px rgba(0, 0, 0, 0.5);

				.user-avatar {
					position: relative;
					flex: 0 0 50px;
					width: 50px;
					height: 50px;
					border-radius: 50%;
					background-size: cover;
					background-position: 50%;
					background-repeat: no-repeat;
					margin: 10px;

					&::after {
						transition: border-color ease-in-out 0.5s;
					}

					@each $state, $color in $persona-states {
						&.persona-state-#{$state}::after {
							border-color: $color;
						}
					}
				}

				.user-name {
					font-weight: 600;
					transition: color ease-in-out 0.5s;

					.user-persona {
						font-size: 0.9em;
					}
				}

				.v-dropdown {
					flex: 0 0 50px;
					margin-left: auto;
				}
			}

			.search-bar {
				flex: 0 0 30px;

				.form-control {
					margin: 0;
					padding: 0.5em 0.75em;
					font-size: 0.9em;
					background-color: rgba(255, 255, 255, 0.1);
				}
			}

			.friends-container {
				display: flex;
				flex-direction: column;
				flex: 1 1 100%;

				.tab-group {
					flex: 0 0 auto;
					display: flex;
					background-color: darken($theme-primary-color, 5%);
					box-shadow: 0 2px 3px rgba(0, 0, 0, 0.5);

					.tab-item {
						position: relative;
						flex: 0 0 auto;
						padding: 0.5em 1em;
						cursor: pointer;
						transition: background-color ease-in-out 0.1s;

						&:not(:last-child)::after {
							display: block;
						}

						&.selected,
						&:hover {
							background-color: $theme-primary-color;
						}

						&::after {
							position: absolute;
							content: '';
							top: 15%;
							right: 0;
							width: 1px;
							height: 70%;
							display: none;
							background-color: $theme-primary-color;
						}
					}
				}

				.tab-body {
					flex: 1 1 100%;
					overflow: hidden;
				}
			}
		}
	}
</style>

<style lang="scss">
	@import '../../../scss/variables';

	.home-container .user-info > .v-dropdown {
		&.open {
			> .dropdown-button {
				background-color: #282F3C;
			}
		}

		> .dropdown-button {
			cursor: pointer;
			line-height: 75px;
			text-align: center;
			transition: background-color ease-in-out 0.1s;

			&:hover {
				background-color: #282F3C;
			}
		}

		> .dropdown-button,
		> .dropdown-content {
			background-color: $theme-primary-color;
		}

		> .dropdown-content {
			min-width: 100px;
		}
	}
</style>
