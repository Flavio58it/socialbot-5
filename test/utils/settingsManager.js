// Using instagram as is the default controller for the bot
import instagramSettings from "../../src/service/plugs/instagram/settings";

/**
 * 
 * Function that simulates the settings local storage of browser
 * 
 * @param {Object} Changes to apply to settings object. The setting will not be saved 
 */

export function simulateSetting (object) {
    var newObj = Object.assign(instagramSettings, object);

    //console.log("Simulating setting: ", newObj);

    return {
        getAll: function () {
            return Promise.resolve(newObj);
        },
        getSetting: function (cat) {
            return Promise.resolve(newObj[cat])
        },
        get: function(attr) {
            return Promise.resolve(newObj[attr])
        }
    }
}