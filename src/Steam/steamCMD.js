const { app }      = require('electron');
const EventEmitter = require('events');
const request      = require('request');
const child        = require('child-process-promise');
const path         = require('path');
const fs           = require('fs');

const DEFAULT_OPTIONS = {
	steamcmd_url: 'https://steamcdn-a.akamaihd.net/client/installer/',
	install_path: path.join(app.getAppPath(), 'steamcmd'),
};

class SteamCMD extends EventEmitter {
	constructor(options = {}) {
		super();

		this._ready        = false;
		this._process      = null;
		this._platform     = null;
		this._isTouch      = false;
		this._outputBuffer = '';

		this.options = Object.assign({}, DEFAULT_OPTIONS, options);

		this.init();
	}

	_preInit() {
		let fileName = null;

		switch (process.platform) {
			case 'win32':
				this._platform = 'windows';
				fileName       = 'steamcmd.zip';
				break;
			case 'darwin':
				this._platform = 'mac';
				fileName       = 'steamcmd_osx.tar.gz';
				break;
			case 'linux':
				this._platform = 'linux';
				fileName       = 'steamcmd_linux.tar.gz';
				break;
			default:
				throw 'Unsupported Platform!';
		}

		// The steamCMD directory doesn't exist
		try {
			fs.accessSync(this.options.install_path, fs.constants.F_OK);
		} catch (e) {
			fs.mkdirSync(this.options.install_path);
		}

		// If steamcmd.exe doesn't exist - download it
		return new Promise((resolve, reject) => {
			try {
				const executablePath = path.join(this.options.install_path, 'steamcmd.' + (this._platform === 'windows' ? 'exe' : 'sh'));
				fs.accessSync(executablePath, fs.constants.R_OK);

				this.touch(executablePath)
				    .then(resolve)
				    .catch(reject);
			} catch (e) {
				this._download(fileName)
				    .then(filePath => {
					    this._install(filePath)
					        .then(() => {
						        this.touch()
						            .then(resolve)
						            .catch(reject);
					        })
					        .catch(reject);
				    })
				    .catch(reject);
			}
		});
	}

	_cleanup() {
		try {
			fs.rmdirSync(this.options.install_path);
			return true;
		} catch (e) {
			return e;
		}
	}

	_download(fileName) {
		return new Promise((resolve, reject) => {
			try {
				const cleanupStatus = this._cleanup();

				if (cleanupStatus !== true)
					return reject(cleanupStatus);

				const filePath = path.join(this.options.install_path, fileName);

				this.emit('download', true);

				request(this.options.steamcmd_url + fileName)
					.pipe(fs.createWriteStream(filePath))
					.on('close', () => {
						resolve(filePath);
						this.emit('download', false);
					});
			} catch (e) {
				this.emit('download', false);
				reject(e);
			}
		});
	}

	_install(filePath) {
		return new Promise((resolve, reject) => {
			this.emit('install', true);

			try {
				if (this._platform === 'windows') {
					fs.createReadStream(filePath)
					  .pipe(require('unzip').Extract({
						  path: this.options.install_path,
					  }))
					  .on('close', () => {
						  this.emit('install', false);
						  resolve();
					  });
				} else {
					(require('tar'))
						.x({
							file: filePath,
							C   : this.options.install_path,
						})
						.then(() => {
							this.emit('install', false);
							resolve();
						});
				}
			} catch (e) {
				this.emit('install', false);
				reject(e);
			}
		});
	}

	touch() {
		return this.launch('login anonymous');
	}

	launch(args = []) {
		if (typeof args === 'string')
			args = [ args ];

		return new Promise((resolve, reject) => {
			args.unshift('@ShutdownOnFailedCommand 0');
			args.push('find e', 'quit');
			args = args.map(a => '+' + a);

			child.spawn((this._platform === 'windows' ? 'steamcmd.exe' : 'steamcmd.sh'), args, {
				capture: [ 'stdout', 'stderr' ],
				cwd    : this.options.install_path,
			})
			     .then(data => {
				     let response = data.stdout.substr(0, data.stdout.indexOf('ConVars:\r\n'));
				     /*const truncateString = '"@ShutdownOnFailedCommand" = "0"';
				     const truncateIndex  = response.indexOf(truncateString);

				     if (truncateIndex >= 0) {
					     response = response.substr(truncateIndex + truncateString.length,
						     (response.length - truncateIndex) - truncateString.length);
				     }*/

				     response = response.replace('"@ShutdownOnFailedCommand" = "0"', '');

				     resolve(response.trim());
			     })
			     .catch(reject);
		});
	}

	init() {
		this._preInit()
		    .then(() => {
			    this._ready = true;
			    this.emit('ready');
		    })
		    .catch(err => this.emit('error', err));
	}

	// Helper functions
	installedApps() {
		return new Promise((resolve, reject) => {
			this.launch([ 'login anonymous', 'apps_installed' ])
			    .then(output => {
				    const data = {
					    count: 0,
					    list : [],
				    };

				    const appCount = output.match(/(\d+) apps installed :/i);
				    if (appCount) data.count = parseInt(appCount[ 1 ]);

				    const appRegex = /^AppID (\d+) : "(.*)" : (.*)$/igm;
				    let match      = appRegex.exec(output);

				    while (match) {
					    data.list.push({
						    id  : parseInt(match[ 1 ]),
						    name: match[ 2 ],
						    path: match[ 3 ],
					    });

					    match = appRegex.exec(output);
				    }

				    resolve(data);
			    })
			    .catch(reject);
		});
	}

	appStatus(appid) {
		return new Promise((resolve, reject) => {
			this.launch([ 'login anonymous', `app_status ${appid}` ])
			    .then(output => {
				    resolve(output);
			    })
			    .catch(reject);
		});
	}

	appUpdate(appid) {
		return new Promise((resolve, reject) => {
			this.launch([ 'login anonymous', `app_update ${appid} -validate` ])
			    .then(data => {
				    console.log(data);

				    resolve(null);
			    })
			    .catch(console.error);
		});
	}

	// Getters
	get process() {
		return this._process;
	}

	get isTouch() {
		return this._isTouch;
	}

	get isReady() {
		return this._ready;
	}
}

module.exports = SteamCMD;
