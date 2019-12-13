import urls from "../../src/service/plugs/instagram/urls";

/**
 * Function that allows rapid multiple inclusion of server sources trough fakeServer implementation
 * 
 * Example: 
 * 
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
    }
}


const responseTypes = {
    "html": "text/html",
    "json": "application/json"
}

export function createServer (routesToInclude) {
    var server = sinon.createFakeServer({
        respondImmediately: true
    });

    routesToInclude.forEach((route) => {
        var routeName = route,
            routeObj = routes[route];

        server.respond(routeObj.url, function (xhr) {
            console.log("[SERVER] Requesting ", routeObj.url)
            xhr.respond(
                200, 
                { "Content-Type": responseTypes[routeObj.type] },
                routeObj.data
            )
        })
    })

    return server;
}