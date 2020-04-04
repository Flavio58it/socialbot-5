import db from "../bot/db";

/**
 * 
 * @param {String} plug - Plug name (Required)
 * @param {Number} offsetStart - Index of days to go backward starting from now (Not required)
 * @param {Number} offsetEnd  - Index of days to go backward starting from now (Not required)
 * @param {Object} Config - Configuration object (Not required)
 */

export async function getPeriodStats (
    plug, 
    offsetStart = 0, 
    offsetEnd = 1, 
    {sum = false} = {}
    ) {
    var list = [];
    for (let i = offsetStart; i < offsetEnd; i++) {
        list.push({
            likes: await getData("USER_LIKE", i),
            likeBack: await getData("USER_LIKEBACK", i),
            followBack: await getData("USER_FOLLOWBACK", i),
            unfollow: await getData("USER_UNFOLLOW", i),
            comment: await getData("USER_COMMENT", i)
        });
    }
    
    if (sum)
        return list.reduce((s, o) => ({
            likes: s.likes + o.likes,
            likeBack: s.likeBack + o.likeBack,
            followBack: s.followBack + o.followBack,
            unfollow: s.unfollow + o.unfollow,
            comment: s.comment + o.comment
        }))
    else
        return list;

    // Seems to be PAINFULLY slow.
    async function getData (action, offsetDay) {
        var time = new Date(new Date().getTime() - (offsetDay * 24 * 60 * 60 * 1000));
        return await db.history.where({plug, action})
            .filter((row) => isSameDay(new Date(row.time), time))
            .count()
    }
}

function isSameDay(dateToCheck, actualDate) {
    return (
        dateToCheck.getDate() === actualDate.getDate() && 
        dateToCheck.getMonth() === actualDate.getMonth() && 
        dateToCheck.getFullYear() === actualDate.getFullYear()
    )
}

/**
 * 
 * @param {String} filter Filter of which plugs are available
 * @param {Number} limit 
 */

export async function getHistory (filter = "all", limit = 10) {
    let query = db
        .history

    if (filter !== "all")
        query = query.where("plug").equals(filter)

    return query
        .limit(limit)
        .reverse()
        .toArray()
}

export class interactor {
    /**
     * Insert interactions into history table
     * @param {Object} settings Settings of interactor class
     * * plug: Plug name. Defaults to _generic_
     */
    constructor ({plug = "_generic_"} = {}) {
        this.plug = plug
    }

    /**
     * 
     * @param {String} type Type of user interaction
     * * LIKE
     * * LIKEBACK
     * * FOLLOWBACK
     * * UNFOLLOW
     * * NEW
     * * COMMENT
     * @param {Object} userData User details related to liked post
     * * img
     * * userId
     * * username
     * @param {Object} extraData Data related to post action
     * * isVideo
     * * tag
     */

    userInteraction (type, userData, extraData) {
        var data = {
            username: "Unknown",
            ...extraData, 
            ...userData
        };

        console.log(`[${this.plug}] Adding interaction ${type} - DATA: `, data);
        return db.history.add({
            plug: this.plug,
            action: "USER_" + type.toUpperCase(),
            details: {
                img: data.img, // Can be also img of the user if is followback etc.
                imgId: data.id,
                userId: data.userId,
                userName: data.username,
                video: data.isVideo,
                //comment: data.comment || undefined,
                tag: data.tag || undefined
            },
            time: new Date().getTime()
        })
    }
}