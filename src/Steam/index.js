const SteamUser    = require('steam-user');
const EventEmitter = require('events');
const fs           = require('fs');
const cache        = require('../cache');

const ChatManager = require('./chatManager');
const SteamCMD    = require('./steamCMD');

const DEFAULT_OPTIONS = {
	logOnDetails: {
		machineName: 'TecnoSteam-Client',
	},
};

class SteamClient extends EventEmitter {
	constructor(options = {}) {
		super();

		this.options = Object.assign({}, DEFAULT_OPTIONS, options);
		this.client  = new SteamUser({
			promptSteamGuardCode: false,
			enablePicsCache     : true,
		});

		this._chatManager = new ChatManager(this);
		this._steamCMD    = new SteamCMD();

		/*this._steamCMD.on('ready', () => {
			console.log('ready');
			this._steamCMD.appUpdate(252490);
		});*/

		this._steamGuardCallback = null;
		this._personaState       = 'Offline';

		this.bindEvents();
		this.readSettings();
	}

	autoLogin() {
		fs.access('login_key', fs.constants.F_OK, (err) => {
			if (err) {
				if (this.options.logonDetails && this.options.logonDetails.password)
					this.login();

				return;
			}

			fs.readFile('login_key', (err, data) => {
				if (err) throw err;
				this.login({
					logonDetails: {
						accountName: this.options.logonDetails.accountName || '[INSERT USERNAME HERE]', // MODIFY HERE
						loginKey   : data.toString(),
					},
				});
			});
		});
	}

	bindEvents() {
		this.client.on('loggedOn', (details, parental) => {
			this._steamGuardCallback = null;

			this.emit('loggedOn', arguments);
			this.emit('loginAttempt', false);

			// Without this we won't receive persona data about our friends
			this.personaState = SteamUser.EPersonaState.Online;
		});

		this.client.on('accountInfo', (name, country, authedMachines, flags, facebookID, facebookName) => {
			console.log(`Welcome, ${name} (${country})`);
		});

		this.client.on('friendsList', (...e) => this.emit('friendsList', ...e));

		this.client.on('error', (...e) => {
			// Check if someone is listening for errors
			// otherwise node.js throws it and the process exits
			// https://nodejs.org/api/events.html#events_error_events
			if (this.listenerCount('error') > 0)
				this.emit('error', ...e);

			fs.writeFile('error.log', JSON.stringify(...e), () => {
			});
		});

		this.client.on('disconnected', (result, message) => {
			this.emit('disconnected', arguments);

			/*if (this.options.autoReconnect)
				this.autoLogin();*/
		});

		this.client.on('steamGuard', (domain, callback) => {
			this._steamGuardCallback = ((code) => {
				this.emit('loginAttempt', true);
				callback(code);
			}).bind(this);

			this.emit('steamGuard', [
				domain,
				callback,
			]);
		});

		this.client.on('loginKey', (key) => fs.writeFile('login_key', key, () => {
		}));

		this.client.on('user', (sid, user) => {
			if (user.avatar_url_full) {
				// Cache user avatars
				cache.grabImage(user.avatar_url_full, 'users')
				     .then(data => this.getUser(sid).avatar_url_full = data[ 0 ])
				     .catch(console.error);
			}

			if (sid.accountid === this.client.steamID.accountid) {
				if (this.currentUser.persona_state !== user.persona_state)
					this._personaState = user.persona_state;
				this.emit('currentUser', user);
			}
		});

		this.client.on('friendRelationship', (sid, relationship) => {
			console.log(`${sid} relationship: ${SteamUser.EFriendRelationship[ relationship ]} (${relationship})`);
		});
	}

	readSettings() {
		try {
			fs.accessSync('settings', fs.constants.R_OK);

			const settings = JSON.parse(fs.readFileSync('settings').toString());

			Object.keys(settings).forEach(key => {
				switch (key) {
					case 'accountName':
						this.options.logOnDetails.accountName = settings[ key ];
						break;
					case 'rememberPassword':
						this.options.logOnDetails.rememberPassword = settings[ key ];
						break;
				}
			});
		} catch (e) {
			console.error(e);
		}
	}

	login(options) {
		this.emit('loginAttempt', true);

		options = Object.assign({}, this.options.logonDetails, options.logonDetails || options);

		if (options.hasOwnProperty('loginKey') && options.hasOwnProperty('password'))
			options.password = null;
		if (options.hasOwnProperty('loginKey'))
			options.rememberPassword = true;

		const settings = {
			accountName     : options.accountName,
			rememberPassword: options.rememberPassword,
		};

		fs.writeFile('settings', JSON.stringify(settings), () => {
		});

		this.client.logOn(options);
	}

	logout() {
		this.client.logOff();
	}

	getUser(steamid) {
		return this.client.users[ steamid ];
	}

	// Getters
	get currentUser() {
		return (this.getUser(this.steamID64) || null);
	}

	get steamID64() {
		return this.client.steamID.getSteamID64();
	}

	get personaState() {
		if (!this.currentUser) return 'Offline';
		return SteamUser.EPersonaState[ this.currentUser.persona_state ];
	}

	get walletBalance() {
		if (!this.client.wallet.hasWallet) return 0;
		return SteamUser.formatCurrency(this.client.wallet.balance, this.client.wallet.currency);
	}

	get accountInfo() {
		return this.client.accountInfo;
	}

	get chatManager() {
		return this._chatManager;
	}

	get steamCMD() {
		return this._steamCMD;
	}

	get users() {
		return this.client.users;
	}

	// Setters
	set personaState(value) {
		if (typeof value === 'string')
			value = SteamUser.EPersonaState[ value ];
		this._personaState = SteamUser.EPersonaState[ value ];
		this.client.setPersona(value);
	}
}

module.exports = SteamClient;
