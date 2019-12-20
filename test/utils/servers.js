import urls from "../../src/service/plugs/instagram/urls";

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
        data: `
            <html>
                <body>
                    <script>window._sharedData = {"config": {"csrf_token": "TEST"}, "entry_data": {"LandingPage": false}}</script>
                </body>
            </html>
        `
    },
    "like_post": {
        url: /\/web\/likes\/\d+\/like\//,
        type: "json",
        data: JSON.stringify({
            success: true
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
            if (callbacks[routeName])
                callbacks[routeName](xhr, routeObj.url, routeObj.data);
            xhr.respond(
                200, 
                { "Content-Type": responseTypes[routeObj.type] },
                routeObj.data
            )
        })
    })

    // Add attachCallback functionality to sinon fake server. This allows to set an arbitrary callback to each of servers in order to increment counters and check that the route has been correctly called
    server.attachCallback = function (serverName, callback) {
        callbacks[serverName] = callback;
    }

    return server;
}