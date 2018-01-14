const { app, BrowserWindow, ipcMain, Tray, Menu } = require('electron');
const url                                         = require('url');
const path                                        = require('path');
const fs                                          = require('fs');
const SteamUser                                   = require('steam-user');

let SteamClient, window, tray;
let clientWindow;

const DEV_ENV = (process.env.NODE_ENV === 'development');

function createWindow() {
    window = new BrowserWindow({
        width : 400,
        height: 600,
        title : 'TecnoSteam',
        frame : false,
        show  : false,
    });

    if (DEV_ENV) {
        window.loadURL('http://localhost:3000/electron-views/auth.html');
        //window.webContents.openDevTools();
    } else {
        window.loadURL(url.format({
            pathname: path.join(__dirname, 'electron-views', 'auth.html'),
            protocol: 'file:',
            slashes : true,
        }));
    }

    window.on('ready-to-show', () => window.show());

    app.SteamClient = SteamClient = new (require('./src/Steam'))();

    app.SteamClient.on('loggedOn', (details, parental) => {
        if (clientWindow)
            return clientWindow.show();

        clientWindow = new BrowserWindow({
            width : 1600,
            height: 900,
            title : 'TecnoSteam',
            frame : false,
            show  : false,
        });

        if (!tray) {
            tray = new Tray('./steam.ico');

            tray.on('double-click', () => clientWindow.show());

            tray.setToolTip('TecnoSteam');
            tray.setContextMenu(Menu.buildFromTemplate([
                {
                    label: 'Exit',
                    click() {
                        app.isQuiting = true;
                        app.quit();
                    },
                },
            ]));
        }

        if (DEV_ENV) {
            clientWindow.loadURL('http://localhost:3000/electron-views/index.html');
            //clientWindow.webContents.openDevTools();
        } else {
            clientWindow.loadURL(url.format({
                pathname: path.join(__dirname, 'electron-views', 'index.html'),
                protocol: 'file:',
                slashes : true,
            }));
        }

        clientWindow.on('close', e => {
            if (!app.isQuiting) {
                e.preventDefault();
                clientWindow.hide();
            }
        });
        clientWindow.on('ready-to-show', () => clientWindow.show());

        if (window) window.close();
    });

    window.on('closed', () => window = null);
}

app.on('ready', createWindow);
app.on('window-all-closed', () => {
    if (process.platform !== 'darwin')
        app.quit();
});
app.on('activate', () => {
    if (window === null)
        createWindow();
});

// Setup directory structures
const userData       = app.getPath('userData');
const cacheDirectory = [
    path.join(userData, 'cache'),
    'achievements',
    'screenshots',
    'users',
];

fs.access(cacheDirectory[ 0 ], fs.constants.F_OK, (err) => {
    if (err !== null)
        fs.mkdir(cacheDirectory[ 0 ]);
});

for (let i = 1; i < cacheDirectory.length; i++) {
    const filePath = path.join(cacheDirectory[ 0 ], cacheDirectory[ i ]);

    fs.access(filePath, fs.constants.F_OK, (err) => {
        if (err !== null)
            fs.mkdir(filePath);
    });
}

// Events
ipcMain.on('scCreateAccount', (e, data) => {
    SteamClient.createAccount(data.accountName, data.password, data.email, (result, steamid) => {
        ipcMain.emit('scCreateAccount', {
            success        : (result === SteamUser.EResult.OK),
            steamid,
            duplicateName  : (result === SteamUser.EResult.DuplicateName),
            illegalPassword: (result === SteamUser.EResult.IllegalPassword),
            unknownError   : (result !== SteamUser.EResult.OK &&
                              result !== SteamUser.EResult.DuplicateName &&
                              result !== SteamUser.EResult.IllegalPassword),
        });
    });
});

let chatWindow   = null;
let friendWindow = null;

ipcMain.on('createChatWindow', (e, data) => {
    if (!chatWindow) {
        chatWindow = new BrowserWindow({
            width : 400,
            height: 500,
            title : 'TecnoSteam - Chat',
            frame : false,
            show  : false,
        });

        const HASH = (data.accountid ? '#/' + data.accountid : '');

        if (process.env.NODE_ENV === 'development') {
            chatWindow.loadURL(`http://localhost:3000/electron-views/chat.html${HASH}`);
        } else {
            chatWindow.loadURL(url.format({
                pathname: path.join(__dirname, 'electron-views', `index.html${HASH}`),
                protocol: 'file:',
                slashes : true,
            }));
        }

        chatWindow.on('closed', () => chatWindow = null);
        chatWindow.on('ready-to-show', () => chatWindow.show());

        ipcMain.emit('createChatWindow', { chatWindow });
    } else
        chatWindow.focus();
});

ipcMain.on('createFriendWindow', (e) => {
    if (!friendWindow) {
        friendWindow = new BrowserWindow({
            width : 300,
            height: 450,
            title : 'TecnoSteam - Friends',
            frame : false,
            show  : false,
        });

        if (DEV_ENV) {
            friendWindow.loadURL('http://localhost:3000/electron-views/friends.html');
        } else {
            friendWindow.loadURL(url.format({
                pathname: path.join(__dirname, 'electron-views', 'friends.html'),
                protocol: 'file:',
                slashes : true,
            }));
        }

        friendWindow.on('closed', () => friendWindow = null);
        friendWindow.on('ready-to-show', () => friendWindow.show());

        ipcMain.emit('createFriendWindow', { friendWindow });
    } else
        friendWindow.focus();
});

