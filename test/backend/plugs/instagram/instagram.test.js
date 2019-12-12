import instagram from "../../../../src/service/plugs/instagram/instagram";
import { simulateSetting } from "../../../utils/settingsManager";

import urls from "../../../../src/service/plugs/instagram/urls";

describe("@instagram", function () {
    var server = false

    beforeEach(function () {
        server = sinon.createFakeServer({
            respondImmediately: true
        });

        server.respond(urls.home, function (xhr) {
            xhr.respond(
                200, 
                { "Content-Type": "text/html" },
                `
                    <html>
                        <body>
                            <script>window._sharedData = {"config": {"csrf_token": "TEST"}, "entry_data": {"LandingPage": false}}</script>
                        </body>
                    </html>
                `
            )
        })
    });

    afterEach(function () {
        server = false;
    })

    context("init()", function () {
        it("Without parameters, should fail", function () {
            var instance = new instagram();
            return instance.init().then(function () {
                chai.assert.throw();
            }, function (e) {
                chai.expect(e).to.have.property("error", "NO_SETTINGS")
            });
        });

        it("Init with basic settings, should return object with main params", function () {
            var instance = new instagram();

            return instance.init(simulateSetting()).then(function (data) {
                chai.expect(data).to.have.property("connectionOk", true)
                chai.expect(data).to.have.property("logged", true)
                chai.expect(data).to.have.property("domain")
            })
        });
    });

    context("likeTagImages()", function () {
        it("Like by tag, should perform calls to server and respond ", function () {
            var instance = new instagram()

            server.respond(/\/explore\/tags\/testtag\//, function (xhr) {
                xhr.respond(200, 
                    { "Content-Type": "application/json" },
                    JSON.stringify({
                        tag: {
                            media: {
                                nodes: [
                                    {
                                        id: 123456780,
                                        owner: {
                                            id: 1324,
                                            username: "tester"
                                        },
                                        caption: "This is a test",
                                        viewer_has_liked: false,
                                        shortcode: "W1234",
                                        code: "1234",
                                        display_src: "/i/testimagesrc",
                                        thumbnail_src: "/thumb/testimagesrc",
                                        likes: {
                                            count: 1
                                        }
                                    }
                                ]
                            }
                        }
                    })
                )
            })

            return instance.init(simulateSetting())
                .then(() => instance.actions.likeTagImages("testtag", 1000, 4)) // Tag, millisec wait, limit
                .then((result) => {
                    console.log(result)
                })
        });
    })
})