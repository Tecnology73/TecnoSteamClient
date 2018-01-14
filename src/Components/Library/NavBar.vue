<template>
	<div class="ts-library-nav-bar">
		<div class="search-container" :class="{ 'collapse': sidebarCollapsed }">
			<input class="search-box" placeholder="Search" @input="search" ref="searchInput"/>
			<div class="clear-search" :class="{ 'is-searching': searchQuery }" @click="clearSearch">&times;</div>

			<div class="search-icon" @click="internalToggleSidebar" v-tooltip="{ 'content': 'Search' }">
				<span class="fa fa-search"></span>
			</div>
		</div>

		<div class="nav-group">
			<router-link class="nav-item" :to="{ name: 'store' }" v-tooltip="{ content: 'Store' }">
				<span class="fa fa-shopping-cart"></span>
			</router-link>

			<router-link class="nav-item" :to="{ name: 'library' }" v-tooltip="{ content: 'Library' }">
				<span class="fa fa-gamepad"></span>
			</router-link>

			<router-link class="nav-item" :to="{ name: 'community' }" v-tooltip="{ content: 'Community' }">
				<span class="fa fa-users"></span>
			</router-link>
		</div>

		<div class="user-info-group">
			<dropdown class="user-messages" :class="{ 'has-messages': unreadCounter }"
			          alignment="right" @open="clearUnread" ref="userMessagesDropdown">
				<div slot="button" v-tooltip="{ content: 'Messages' }">
					<span class="user-messages-count" v-if="unreadCounter">
						{{ unreadCounter }}
					</span>

					<span class="fa fa-envelope"></span>
				</div>

				<div slot="content" class="user-message-group">
					<div class="dropdown-item user-message-item" v-for="message in chatMessages"
					     @click="openChatWindow(message.room.accountid)" v-if="message.lastMessage">
						<div class="sender-avatar" :style="{ 'background-image':
						`url(${message.sender.avatar_url_full})` }"></div>

						<div class="message">{{ message.lastMessage.message }}</div>

						<div class="timestamp">{{ formatTimestampFromNow(message.lastMessage.timestamp) }}</div>
					</div>

					<div class="dropdown-item user-message-item empty" v-if="chatMessages.length <= 0">
						You don't have any recent messages
					</div>
				</div>
			</dropdown>

			<div class="user-wallet">
				{{ scWalletBalance }}
			</div>

			<dropdown class="user-info">
				<div slot="button">
					<div class="user-name">
						{{ scAccountInfo.name }}
					</div>

					<div class="user-avatar"
					     :style="{ 'background-image': `url(${user.avatar})` }"></div>
				</div>

				<div slot="content">
					<div class="dropdown-item">
						<router-link :to="{ name: 'settings' }">Settings</router-link>
					</div>

					<div class="dropdown-seperator"></div>

					<div class="dropdown-item">
						<router-link :to="{ name: 'auth.logout' }">Logout</router-link>
					</div>
				</div>
			</dropdown>
		</div>
	</div>
</template>

<script>
	import { remote, ipcRenderer } from 'electron';
	import { mapActions, mapState } from 'vuex';
	import Dropdown from '../Dropdown.vue';
	import cache from '../../cache';
	import moment from 'moment';

	export default {
		data() {
			return {
				user         : {
					avatar: null,
				},
				unreadCounter: 0,
				chatMessages : [],
			};
		},
		created() {
			this.SteamClient.on('currentUser', user => {
				cache.grabImage(user.avatar_url_full, 'users')
				     .then(data => this.user.avatar = data[ 0 ])
				     .catch(console.error);
			});

			this.SteamClient.on('chatMessage', (sender, message, room) => {
				this.unreadCounter = this.SteamClient.chatManager.unreadChatMessages;
				this.chatMessages  = this.getChatMessages();
				// TODO: If chat window isn't open... Notify the user
			});

			if (this.SteamClient.currentUser && this.SteamClient.currentUser.avatar_url_full) {
				cache.grabImage(this.SteamClient.currentUser.avatar_url_full, 'users')
				     .then(data => this.user.avatar = data[ 0 ])
				     .catch(console.error);
			}
		},
		methods   : {
			...mapActions([
				'searchLibrary',
				'toggleSidebar',
			]),
			search(e) {
				this.searchLibrary(e.target.value);
			},
			clearSearch() {
				this.searchLibrary(null);
				this.$refs.searchInput.value = '';
			},
			formatTimestampFromNow(timestamp) {
				return moment(timestamp).fromNow();
			},
			getChatMessages() {
				const messages = this.SteamClient.chatManager.chats;

				messages.sort((a, b) => {
					const aLMessage = a.lastMessage;
					const bLMessage = b.lastMessage;

					if (!aLMessage || !bLMessage) return 0;
					if (!aLMessage) return -1;
					if (!bLMessage) return 1;

					return aLMessage.timestamp < bLMessage.timestamp;
				});

				return messages;
			},
			clearUnread() {
				this.SteamClient.chatManager.clearUnreadChat();
				this.unreadCounter = this.SteamClient.chatManager.unreadChatMessages;
			},
			openChatWindow(accountid) {
				ipcRenderer.send('createChatWindow', { accountid });
				this.$refs.userMessagesDropdown.close();
			},
			internalToggleSidebar() {
				this.toggleSidebar();
				this.$refs.searchInput.focus();
			},
		},
		computed  : {
			...mapState({
				userInfo        : ({ user }) => user.userInfo,
				searchQuery     : ({ library }) => library.searchQuery,
				sidebarCollapsed: ({ global }) => global.sidebarCollapsed,
			}),
			scWalletBalance() {
				return this.SteamClient.walletBalance;
			},
			scAccountInfo() {
				return this.SteamClient.accountInfo;
			},
			SteamClient() {
				return remote.app.SteamClient;
			},
		},
		components: {
			Dropdown,
		},
	}
</script>

<style scoped lang="scss">
	@import '../../scss/variables';

	.ts-library-nav-bar {
		display: flex;
		line-height: $ts-library-nav-bar-height;
		color: $color;

		.search-container {
			position: relative;
			flex: 0 0 $ts-library-sidebar-width;
			overflow: hidden;
			transition: flex-basis ease-in-out 0.5s;

			&.collapse {
				flex-basis: $ts-library-nav-bar-height;

				.search-box {
					opacity: 0;
					pointer-events: none;
				}

				.search-icon {
					opacity: 1;
					pointer-events: all;
				}
			}

			.search-box {
				width: $ts-library-sidebar-width;
				border: 0;
				background-color: rgba(255, 255, 255, 0.05);
				padding: 0 1.25em;
				line-height: $ts-library-nav-bar-height;
				outline: 0;
				color: $color;
				transition: opacity ease-in-out 0.5s;
			}

			.search-icon {
				position: absolute;
				top: 0;
				left: 0;
				width: $ts-library-nav-bar-height;
				height: $ts-library-nav-bar-height;
				opacity: 0;
				text-align: center;
				pointer-events: none;
				cursor: pointer;
				transition: opacity ease-in-out 0.5s, background-color ease-in-out 0.1s;

				&:hover {
					background-color: rgba(255, 255, 255, 0.05);
				}
			}
		}

		.clear-search {
			position: absolute;
			left: $ts-library-sidebar-width;
			margin-left: -2.6em;
			padding: 0 1em;
			cursor: pointer;
			background-color: rgba(255, 255, 255, 0.05);
			pointer-events: none;
			opacity: 0;
			transition: opacity ease-in-out 0.25s;

			&.is-searching {
				opacity: 1;
				pointer-events: all;
			}
		}

		.nav-group {
			flex: 1 1 auto;
			display: flex;

			.nav-item {
				flex: 0 0 $ts-library-nav-bar-height;
				text-align: center;
				cursor: pointer;
				transition: background-color ease-in-out 0.1s;

				&:hover {
					background-color: rgba(255, 255, 255, 0.05);
				}

				&.router-link-active {
					color: #03A9F4;
				}
			}
		}

		.user-info-group {
			display: flex;
			flex: 0 0 auto;

			> :not(.user-messages) {
				font-size: 0.9em;
			}

			.user-wallet {
				cursor: pointer;
				transition: background-color ease-in-out 0.1s;

				&:hover {
					background-color: rgba(255, 255, 255, 0.05);
				}
			}

			.user-messages {
				position: relative;

				&.has-messages {
					color: $theme-accent-color;

					&::before {
						display: block;
						animation: user-message-blip linear 2s infinite;
					}
				}

				&::before {
					position: absolute;
					display: none;
					content: '';
					top: 0;
					left: 0;
					width: 100%;
					height: 100%;
					background-color: transparentize($theme-accent-color, 0.75);
					border-radius: 50%;
					z-index: 101;
					pointer-events: none;
				}

				.dropdown-content {
					.dropdown-item {
						padding: 1em;
					}

					.user-message-group {
						color: white;

						.user-message-item {
							display: flex;

							&.empty {
								display: block;
								background-color: initial;
								text-align: center;
								cursor: default;
							}

							.sender-avatar {
								flex: 0 0 30px;
								width: 30px;
								height: 30px;
								border-radius: 50%;
								margin-top: -0.35em;
								background-position: 50%;
								background-size: cover;
								background-repeat: no-repeat;
							}

							.message {
								flex: 1 1 100%;
								margin: 0 1em;
								overflow: hidden;
								white-space: nowrap;
								text-overflow: ellipsis;
							}

							.timestamp {
								flex: 0 0 auto;
								font-size: 0.75em;
								float: right;
								opacity: 0.25;
								line-height: 2em;
							}
						}
					}
				}
			}

			.user-wallet {
				padding: 0 1em;
			}

			.user-info {
				flex: 0 0 auto;

				.dropdown-button {
					.user-name {
						display: inline-block;
						padding: 0 1em;
					}

					.user-avatar {
						float: right;
						width: 30px;
						height: 30px;
						border-radius: 50%;
						margin-top: 10px;
						background-size: cover;
						background-position: 50%;
						background-repeat: no-repeat;
					}
				}
			}
		}
	}

	@keyframes user-message-blip {
		0% {
			opacity: 0;
			transform: scale(0);
		}
		50% {
			opacity: 0.5;
			transform: scale(0.5);
		}
		100% {
			opacity: 0;
			transform: scale(1);
		}
	}
</style>

<style lang="scss">
	@import '../../scss/variables';

	.v-dropdown {
		&.open {
			> .dropdown-button {
				background-color: #282F3C;
			}
		}

		&.user-info > .dropdown-button {
			padding-right: 1em;
		}

		&.user-messages > .dropdown-button {
			padding: 0 1em;
		}

		> .dropdown-button {
			cursor: pointer;
			transition: background-color ease-in-out 0.1s;

			&:hover {
				background-color: #282F3C;
			}
		}

		> .dropdown-button,
		> .dropdown-content {
			background-color: $theme-primary-color;
		}
	}

	.v-dropdown.user-messages > .dropdown-content {
		min-width: 300px;
	}
</style>
