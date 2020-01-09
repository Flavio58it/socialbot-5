import urls from "../../../../src/service/plugs/instagram/urls";

import { rawHomePageStructure, user } from "./fakeData";

/**
 * Function that allows rapid multiple inclusion of server sources trough fakeServer implementation
 * 
 * Example: 
 * 
 * server = createServer([
 *           "homepage_logged",
 *           "like_post"
 *       ])
 */

const routes = {
    "homepage_logged": {
        url: urls.home,
        type: "html",
        data: rawHomePageStructure()
    },
    "like_post": {
        url: /\/web\/likes\/\d+\/like\//,
        type: "json",
        data: JSON.stringify({
            success: true
        })
    },
    "user_data": {
        url: /\/(tester)|(testerman)\/$/, // Two main users for testing
        type: "json",
        data: JSON.stringify(user())
    },
    "notifications_list": { // Not yet useable. How to maintain it generic?
        url: /\/accounts\/activity\/\?__a=1/,
        type: "json",
        data: JSON.stringify({
            graphql: {
                user: {
                    activity_feed: {
                        edge_web_activity_feed: {
                            count: 1,
                            edges: [
                                {
                                    node: {
                                        type: 1,
                                        user: {
                                            id: 998,
                                            username: "testman",
                                            code: 1111
                                        }
                                    }
                                }
                            ]
                        }
                    }
                }
            }
        })
    }
}


const responseTypes = {
    "html": "text/html",
    "json": "application/json"
}

var callbacks = {}

export function createServer (routesToInclude) {
    var server = sinon.createFakeServer({
        // respondImmediately: true
        autoRespond: true
    });

    routesToInclude.forEach((route) => {
        var routeName = route,
            routeObj = routes[route];

        server.respond(routeObj.url, function (xhr) {
            console.log("[SERVER] Requesting ", xhr.url)
            var response = routeObj.data;

            if (callbacks[routeName]) {
                var overridedResponse = callbacks[routeName](xhr, routeObj.url, routeObj.data);
                if (overridedResponse)
                    response = overridedResponse
            }

            xhr.respond(
                200, 
                { "Content-Type": responseTypes[routeObj.type] },
                response
            )
        })
    })

    // Add attachCallback functionality to sinon fake server. This allows to set an arbitrary callback to each of servers in order to increment counters and check that the route has been correctly called
    server.attachCallback = function (serverName, callback) {
        callbacks[serverName] = callback;
    }

    return server;
}