<template>
	<div class="chat-navbar-container">
		<div class="user-avatar" :style="{ 'background-image': `url(${user.avatar_url_full})` }"></div>

		<div class="user-name">
			{{ user.player_name }}

			<div class="typing-message" v-if="chat.typeeMessage">
				{{ chat.typeeMessage }}
			</div>
		</div>

		<dropdown alignment="right">
			<div slot="button">
				<div class="dropdown-button">
					<span class="fa fa-caret-down"></span>
				</div>
			</div>

			<div slot="content">
				<div class="dropdown-item">Close Chat</div>
			</div>
		</dropdown>
	</div>
</template>

<script>
	import Vue from 'vue';
	import { remote } from 'electron';
	import Dropdown from '../Dropdown.vue';

	export default {
		created() {
			this.load();
		},
		beforeDestroy() {
			this.SteamClient.removeListener(`friendTyping#${this.chatClient.room.getSteamID64()}`,
				this.scTypersUpdate.bind(this));
		},
		data() {
			return {
				user: {},
				chat: {
					typeeMessage: null,
				},
			}
		},
		computed  : {
			SteamClient() {
				return remote.app.SteamClient;
			},
			roomID() {
				const roomID = parseInt(this.$route.params.roomid);
				return (isNaN(roomID) ? null : roomID);
			},
			chatClient() {
				return this.SteamClient.chatManager.getChat(this.roomID);
			},
			recipientID() {
				return this.chatClient.room.getSteamID64()
			},
		},
		methods   : {
			load() {
				if (this.chatClient) {
					this.user = this.chatClient.sender;
					this.SteamClient.on(`friendTyping#${this.recipientID}`, this.scTypersUpdate.bind(this));
				}
			},
			scTypersUpdate(clear) {
				Vue.set(this.chat, 'typeeMessage', (clear ? null : this.chatClient.typeeMessage()));
			},
		},
		watch     : {
			'$route'(newValue, oldValue) {
				this.load();
			},
		},
		components: {
			Dropdown,
		},
	}
</script>

<style scoped lang="scss">
	.chat-navbar-container {
		display: flex;
		align-items: stretch;
		padding-left: 1em;

		.user-avatar {
			flex: 0 0 50px;
			width: 50px;
			height: 50px;
			border-radius: 50%;
			background-position: 50%;
			background-size: cover;
			background-repeat: no-repeat;
			margin: auto 0;
		}

		.user-name {
			flex: 1 1 100%;
			margin: auto 1em;
			font-weight: 500;

			.typing-message {
				opacity: 0.5;
				font-size: 0.8em;
			}
		}

		.v-dropdown {
			flex: 0 0 50px;
			line-height: 75px;
		}

		.v-dropdown {
			.dropdown-button {
				text-align: center;
				cursor: pointer;
			}

			.dropdown-item {
				font-size: 0.9em;
			}
		}
	}
</style>

<style lang="scss">
	@import '../../scss/variables';

	.chat-navbar-container .v-dropdown {
		&.open {
			> .dropdown-button {
				background-color: #282F3C;
			}
		}

		> .dropdown-button,
		> .dropdown-content {
			background-color: $theme-primary-color;
		}

		> .dropdown-content {
			width: 100px;
		}

		> .dropdown-button {
			cursor: pointer;
			transition: background-color ease-in-out 0.1s;

			&:hover {
				background-color: #282F3C;
			}
		}
	}
</style>
