/*global require,process*/

const Store = require("jfs");
const db = new Store("aria2client");

function configify(handler)
{
    return function(data, argv) {
        db.get("aria2", (err, obj) => {
            if (err)
                obj = {};
            handler(obj, data, argv);
        });
    };
}

const handlers = {
    "torrent": configify(require("./lib/torrent")),
    "config": function(data, argv) {
        try {
            let obj = JSON.parse(data);
            db.save("aria2", obj);
        } catch (e) {
            console.error(`couldn't parse config to save, '${e.message}'`);
        }
    }
};

const argv = require('minimist')(process.argv.slice(2));
for (let k in argv) {
    if (k in handlers) {
        handlers[k](argv[k], argv);
    }
}
