<template>
	<div class="chat-group-container">
		<div class="chat-message-group" ref="chatGroup">
			<div class="chat-message-item" v-for="group in chat.messages" :class="{ 'self': groupFromSelf(group) }">
				<div class="message-content-group">
					<div class="message-content" v-for="message in group.messages">
						{{ message }}
					</div>
				</div>

				<div class="message-sender-info">{{ group.sender.player_name }}</div>
				<div class="message-timestamp">{{ formatTimestampFromNow(group.latestTimestamp) }}</div>
			</div>
		</div>

		<div class="compose-message-container">
			<textarea v-model="composeMessage" placeholder="Send a message..." ref="composeMessage"
			          @keydown="typingMessage"></textarea>

			<div class="compose-send" @click="sendMessage">
				<svg fill="#FFFFFF" height="24" viewBox="0 0 24 24" width="24" xmlns="http://www.w3.org/2000/svg">
					<path d="M2.01 21L23 12 2.01 3 2 10l15 2-15 2z"/>
					<path d="M0 0h24v24H0z" fill="none"/>
				</svg>
			</div>
		</div>
	</div>
</template>

<script>
	import Vue from 'vue';
	import { remote } from 'electron';
	import moment from 'moment';

	export default {
		created() {
			this.SteamClient.on('chatMessage', this.scChatMessage.bind(this));

			if (!this.chatClient) {
				this.SteamClient.chatManager.createChat(this.roomID)
				    .then(data => {
					    this.$router.push({
						    params: {
							    roomid: data.chatRoom.room.accountid,
						    },
					    });
				    });
			}
			else this.load();
		},
		beforeDestroy() {
			this.SteamClient.removeListener('chatMessage', this.scChatMessage.bind(this));
		},
		data() {
			return {
				composeMessage: '',
				chat          : {
					messages: [],
				},
				recipientID   : null,
			}
		},
		computed: {
			SteamClient() {
				return remote.app.SteamClient;
			},
			roomID() {
				return this.$route.params.roomid.toString();
			},
			chatClient() {
				return this.SteamClient.chatManager.getChat(this.roomID);
			},
		},
		methods : {
			load() {
				if (!this.chatClient) return;

				this.recipientID = this.chatClient.room.getSteamID64();

				this.scChatMessage();
			},
			formatTimestampFromNow(timestamp) {
				return moment.utc(timestamp).fromNow();
			},
			groupFromSelf(group) {
				return (group.sender.player_name === this.SteamClient.currentUser.player_name);
			},
			sendMessage() {
				if (!this.composeMessage) return;

				this.SteamClient.chatManager.sendMessage(this.recipientID, this.roomID, this.composeMessage);

				this.composeMessage = '';
				this.$refs.composeMessage.focus();
			},
			typingMessage(e) {
				if (e.which === 13) {
					e.preventDefault();
					return this.sendMessage();
				}

				this.SteamClient.chatManager.sendTyping(this.roomID);
			},
			sortedChatMessages() {
				const chat = this.SteamClient.chatManager.getChat(this.roomID);

				if (!chat) return [];

				const messages = chat.messages;

				if (messages.length <= 0) return messages;

				messages.forEach((message) => {
					if (message.sender === 'other')
						message.sender = chat.sender;
					else if (message.sender === 'self')
						message.sender = this.SteamClient.currentUser;
				});

				let gIndex            = 0;
				const groupedMessages = [ {
					sender         : messages[ 0 ].sender,
					messages       : [ messages[ 0 ].message ],
					latestTimestamp: messages[ 0 ].timestamp,
				} ];

				for (let i = 1; i < messages.length; i++) {
					if (messages[ i - 1 ].sender.player_name === messages[ i ].sender.player_name) {
						groupedMessages[ gIndex ].messages.push(messages[ i ].message);
						groupedMessages[ gIndex ].latestTimestamp = messages[ i ].timestamp;
					} else {
						gIndex++;
						groupedMessages.push({
							sender         : messages[ i ].sender,
							messages       : [ messages[ i ].message ],
							latestTimestamp: messages[ i ].timestamp,
						});
					}
				}

				groupedMessages.forEach(group => {
					group.messages.sort((a, b) => a.timestamp > b.timestamp);
				});

				groupedMessages.sort((a, b) => a.latestTimestamp > b.latestTimestamp);

				return groupedMessages;
			},
			scChatMessage() {
				const chatMessages = this.sortedChatMessages();
				Vue.set(this.chat, 'messages', chatMessages);

				Vue.nextTick(() => this.scrollToBottom());
			},
			scrollToBottom() {
				if (!this.$refs.chatGroup) return;
				this.$refs.chatGroup.scrollTop = this.$refs.chatGroup.scrollHeight;
			},
		},
		watch   : {
			'$route'(newValue, oldValue) {
				Vue.nextTick(() => this.load());
			},
		},
	}
</script>

<style scoped lang="scss">
	@import '../../../scss/variables';

	.chat-group-container {
		display: flex;
		flex-direction: column;
		height: 100%;

		.chat-message-group {
			flex: 1 1 100%;
			display: flex;
			flex-direction: column;
			overflow: hidden;
			overflow-y: auto;
			padding-bottom: 1em;

			.chat-message-item {
				position: relative;
				flex: 0 0 auto;
				margin: 1em 1em 0;
				background-color: #1C2432;
				padding: 0.5em 1em;
				max-width: 80%;

				&.self {
					margin-left: auto;

					.message-sender-info {
						display: none;
					}
				}

				.message-content {
					padding: 0 0.5em 0.5em 0.5em;
					margin: 0 -0.5em 0.5em -0.5em;
					word-break: break-word;

					&:last-child {
						border-bottom: solid 1px rgba(255, 255, 255, 0.05);
					}
				}

				.message-sender-info {
					float: left;
					font-size: 0.8em;
				}

				.message-timestamp {
					float: right;
					font-size: 0.8em;
					opacity: 0.5;
				}
			}
		}

		.compose-message-container {
			display: flex;
			flex: 0 0 75px;
			background-color: $theme-primary-color;
			box-shadow: 0 -2px 3px rgba(0, 0, 0, 0.5);
			z-index: 1;

			textarea {
				flex: 1 1 100%;
				background-color: transparent;
				resize: none;
				border: 0;
				font: inherit;
				outline: none;
				cursor: initial;
				color: inherit;
				padding: 0.5em 1em;
			}

			.compose-send {
				flex: 0 0 75px;
				text-align: center;
				line-height: 75px;
				cursor: pointer;
				padding-top: 5px;
				background-color: rgba(0, 0, 0, 0.1);

				&:hover {
					background-color: rgba(0, 0, 0, 0.15);
				}
			}
		}
	}
</style>
