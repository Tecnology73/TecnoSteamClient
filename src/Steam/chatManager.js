const EventEmitter = require('events');
const SteamID      = require('steamid');
const moment       = require('moment');

class ChatManager extends EventEmitter {
	constructor(parent) {
		super();

		this._parent = parent;
		this._chats  = [];

		this.bindEvents();
	}

	bindEvents() {
		this._parent.client.on('friendOrChatMessage', (senderID, message, room) => {
			const chat = this.getChat(room.accountid);

			if (!chat)
				this._chats.push(this._createChat(room));

			chat.messages.push({
				sender   : 'other',
				message,
				timestamp: Date.now(),
				readAt   : null,
			});

			this._parent.emit('chatMessage', senderID, message, room);
		});

		this._parent.client.on('friendTyping', (senderID) => this.userTyping(senderID));
	}

	userTyping(senderID, clear = false) {
		const chat = this.getChat(senderID.accountid);

		if (!chat) return;

		const steamid64 = senderID.getSteamID64();
		let typee       = chat.typers.find(t => t.steamid64 === steamid64);

		if (!typee) {
			chat.typers.push({
				steamid64,
				nickname: this._parent.getUser(steamid64).nickname,
				timer   : null,
			});

			typee = chat.typers[ chat.typers.length - 1 ];
		}

		this._parent.emit(`friendTyping#${steamid64}`, clear);

		if (typee && typee.timer) {
			clearTimeout(typee.timer);
			typee.timer = null;
		}

		if (clear) return;

		typee.timer = setTimeout(() => this.userTyping(senderID, true), 2500);
	}

	getChat(accountid) {
		return this.chats.find(c => c.room.accountid.toString() === accountid.toString());
	}

	sendMessage(steamid, roomid, content) {
		const self = this;
		this._parent.client.chatMessage(steamid, content);

		new Promise(() => {
			const chat = self.getChat(roomid);

			if (chat) {
				chat.messages.push({
					sender   : 'self',
					message  : content,
					timestamp: Date.now(),
					readAt   : Date.now(),
				});

				self._parent.emit('chatMessage', this._parent.steamID64, content, chat.room);
			}
		});

		return true;
	}

	sendTyping(roomid) {
		const chat = this.getChat(roomid);

		if (chat)
			this._parent.client.chatTyping(chat.room.getSteamID64());
	}

	clearUnreadChat() {
		this.chats.forEach(chat => {
			chat.messages.forEach(message => {
				message.readAt = Date.now()
			});
		});
	}

	createChat(steamid) {
		const steamID = new SteamID(steamid.toString());

		return new Promise((resolve, reject) => {
			// DOES FUCKING NOTHING
			//this._parent.client.joinChat(steamID, (result, chatID) => {
			this._parent.client.createChatRoom(steamID, this._parent.client.steamID, (result, chatID) => {
				this._chats.push(this._createChat(steamID));

				this.getChatHistory(steamID.accountid, steamID);

				resolve({ result, chatRoom: this._chats[ this._chats.length - 1 ] });
			});
		});
	}

	getChatHistory(accountid, steamid) {
		this._parent.client.getChatHistory(steamid, (result, messages) => {
			const chat = this.getChat(accountid);

			if (chat) {
				messages.forEach(message => {
					chat.messages.push({
						sender   : (message.steamID.getSteamID64() === this._parent.steamID64 ? 'self' : 'other'),
						message  : message.message,
						timestamp: +moment(message.timestamp),
						readAt   : (message.unread ? null : Date.now()),
					});
				});
			}

			this._parent.emit('chatMessage');
		});
	}

	_createChat(steamID) {
		const self = this;

		return {
			room    : steamID,
			get sender() {
				return self._parent.getUser(this.room.getSteamID64());
			},
			messages: [],
			typers  : [],
			typeeMessage(maxlength = 2) {
				if (this.typers.length <= 0) return null;
				const typers = this.typers.filter(t => t.timer !== null);
				if (typers.length > maxlength) return `${typers.length} people are typing...`;
				return typers.map(t => t.nickname).join(',') + ' is typing...'; // Going to have a problem here...
			},
			get lastMessage() {
				if (this.messages.length <= 0) return null;
				const _msgs = this.messages.filter(m => m.sender === 'other');
				return (_msgs.length <= 0 ? null : _msgs[ 0 ]);
			},
			get unreadCount() {
				const lMessage = this.lastMessage;
				if (!lMessage) return 0;
				return this.messages.filter(m => !m.readAt).length;
			},
		};
	}

	// Getters
	get chats() {
		return this._chats;
	}

	get unreadChatMessages() {
		return this.chats.reduce((sum, chat) => sum + chat.unreadCount, 0);
	}
}

module.exports = ChatManager;
