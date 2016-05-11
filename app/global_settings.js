const fs = require('fs');
const settingsPathname = 'settings.json';

var globalSettings = {
    settings: {
        maximize: 0,
        width: 1280,
        height: 768,
        always_on_top: 0,
        auto_lunch: 1,
        show_notification_on_message: 1,
        show_window_on_message: 0,
        configured: 1
    },
    init: function (settings) {
        this.settings = settings;
    },
    set: function (name, value) {
        this.settings[name] = value;
    },
    get: function (name) {
        return this.settings[name];
    },
    save: function () {
        try {
            fs.writeFileSync(settingsPathname, JSON.stringify(this.settings));
        } catch (err) {
        }
    }
};

try {
    //test to see if settings exist
    fs.openSync(settingsPathname, 'r+'); //throws error if file doesn't exist
    globalSettings.init(JSON.parse(fs.readFileSync(settingsPathname)));
} catch (err) {
    globalSettings.save();
}

module.exports = globalSettings;
