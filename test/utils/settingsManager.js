// Using instagram as is the default controller for the bot
import instagramSettings from "../../src/service/plugs/instagram/settings";


export function simulateSetting (object) {
    var newObj = Object.assign(instagramSettings, object);

    //console.log("Simulating setting: ", newObj);

    return {
        getAll: function () {
            return Promise.resolve(newObj);
        },
        getSetting: function (cat) {
            return Promise.resolve(newObj[cat])
        }
    }
}