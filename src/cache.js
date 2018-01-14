const path     = require('path');
const url      = require('url');
const request  = require('request');
const fs       = require('fs');
const electron = require('electron');
let remote     = electron.app;

if (electron.remote)
    remote = electron.remote.app;

const cacheDirectory = path.join(remote.getPath('userData'), 'cache');

module.exports = {
    grabImage(uri, filePath, fileName = null, ...e) {
        return new Promise((resolve, reject) => {
            if (!uri) {
                if (filePath) {
                    return resolve([
                        this.unknownImage(filePath),
                        ...e,
                    ])
                }

                return reject('\'uri\' cannot be null!');
            }
            if (!filePath) return reject('\'filePath\' cannot be null!');

            if (fileName === null)
                fileName = path.basename(url.parse(uri).pathname);

            if (fileName === null)
                return reject('\'fileName\' cannot be null!');

            const cacheFolderName = filePath;

            filePath = path.join(path.join(cacheDirectory, filePath), fileName);

            let response = filePath;

            const resourcePath = '/dist/' + path.join('cache', cacheFolderName,
                path.basename(response)).replace(/\\/g, '\/');

            if (e.length > 0)
                response = [ response, ...e ];

            if (Array.isArray(response))
                response = [ resourcePath, ...response ];
            else
                response = [ resourcePath, response ];

            if (fs.existsSync(filePath))
                return resolve(response);

            request(uri).pipe(fs.createWriteStream(filePath))
                        .on('close', () => resolve(response));
        });
    },
    unknownImage(type) {
        switch (type.toLowerCase()) {
            case 'achievements':
            case 'achievement':
                return '/dist/imgs/unknown-achievement.png';
                break;
        }
    },
};
