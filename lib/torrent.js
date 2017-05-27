/*global require,module*/

const Aria2 = require("aria2");
const fs = require("fs");

function handler(cfg, torrent, argv) {
    const quiet = ("quiet" in argv);
    const aria2 = new Aria2(cfg.ariacfg);
    aria2.getVersion().then(res => {
        fs.readFile(torrent, (err, data) => {
            if (err) {
                if (!quiet)
                    console.error(`Error reading '${torrent}'`, err);
                return;
            }
            const base64 = data.toString("base64");
            aria2.addTorrent(base64).then(res => {
                //console.log("ok", res);
                // set x number of peers
                aria2.changeOption(res, { "bt-max-peers": 500 }).then(res => {}, err => {
                    if (!quiet)
                        console.error("Couldn't change max peers", err);
                });
                if ("pause" in argv) {
                    // pause the torrent
                    const gid = res;
                    aria2.pause(gid).then(res => {
                        if (!quiet)
                            console.log("added, paused");
                    }, err => {
                        if (!quiet)
                            console.error("Couldn't pause torrent", err);
                        aria2.remove(gid).then(res => {}, err => {
                            if (!quiet)
                                console.error("Couln't remove torrent", err);
                        });
                    });
                }
            }, err => {
                if (!quiet)
                    console.error("Couldn't add torrent", err);
            });
        });
    }, err => {
        if (!quiet)
            console.error("Couldn't connect", err);
    });
}

module.exports = handler;
