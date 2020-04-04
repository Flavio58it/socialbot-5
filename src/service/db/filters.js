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