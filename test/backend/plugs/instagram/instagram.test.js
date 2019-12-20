import instagram from "../../../../src/service/plugs/instagram/instagram";

import { simulateSetting } from "../../../utils/settingsManager";
import { createServer } from "../../../utils/servers";

// Creates the main images object found in account
function createImagesObject(numberOfImages) {
    var object = {
        tag: {
            media: {
                nodes: [
                    
                ]
            }
        }
    }, images = {
        id: 123456780,
        owner: {
            id: 1324,
            username: "tester"
        },
        caption: "This is a test",
        shortcode: "W1234",
        code: "1234",
        display_src: "/i/testimagesrc",
        thumbnail_src: "/thumb/testimagesrc",
        likes: {
            count: 1
        }
    };

    for (let i = 0; i < numberOfImages; i++) {
        object.tag.media.nodes.push(images);
    }

    return object
}

describe("@instagram", function () {
    var server = false

    beforeEach(function () {
        server = createServer([
            "homepage_logged",
            "like_post"
        ])
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
                chai.expect(server.requests.length).to.equal(1, "Should call server to get informations")
                chai.expect(data).to.have.property("connectionOk", true)
                chai.expect(data).to.have.property("logged", true)
                chai.expect(data).to.have.property("domain")
            })
        });
    });

    context("likeTagImages()", function () {
        it("Should perform calls to server and respond", function () {
            var instance = new instagram();

            server.respond(/\/explore\/tags\/testtag\//, function (xhr) {
                xhr.respond(200, 
                    { "Content-Type": "application/json" },
                    JSON.stringify(createImagesObject(1))
                )
            })

            server.respond(/\/p\/\d*\//, function (xhr) {
                xhr.respond(200,
                    { "Content-Type": "application/json" },
                    JSON.stringify({
                        graphql: {
                            shortcode_media: {
                                viewer_has_liked: false
                            }
                        }
                    })
                );
            });

            return instance.init(simulateSetting())
                .then(() => instance.actions.likeTagImages("testtag", 1000, 4)) // Tag, millisec wait, limit
                .then((error) => {
                    chai.expect(error).to.be.undefined
                    chai.expect(server.requests.length).to.equal(4)
                })
        });

        it("Should not like as is tagged as already liked", function () {
            var instance = new instagram();

            server.respond(/\/explore\/tags\/testtag\//, function (xhr) {
                xhr.respond(200, 
                    { "Content-Type": "application/json" },
                    JSON.stringify(createImagesObject(1))
                )
            })

            server.respond(/\/p\/\d*\//, function (xhr) {
                xhr.respond(200,
                    { "Content-Type": "application/json" },
                    JSON.stringify({
                        graphql: {
                            shortcode_media: {
                                viewer_has_liked: true
                            }
                        }
                    })
                );
            });

            return instance.init(simulateSetting())
                .then(() => instance.actions.likeTagImages("testtag", 1000, 4)) // Tag, millisec wait, limit
                .then((error) => {
                    chai.expect(error.stoppedBy).to.equal("ALREADY_LIKED", "Ensure that the bot was stopped by the correct error")
                    chai.expect(server.requests.length).to.equal(3, "One less request as like is not performed")
                })
        });

        it("Like until limit is reached", function () {
            var instance = new instagram();

            server.respond(/\/explore\/tags\/testtag\//, function (xhr) {
                xhr.respond(200, 
                    { "Content-Type": "application/json" },
                    JSON.stringify(createImagesObject(10))
                )
            })

            server.respond(/\/p\/\d*\//, function (xhr) {
                xhr.respond(200,
                    { "Content-Type": "application/json" },
                    JSON.stringify({
                        graphql: {
                            shortcode_media: {
                                viewer_has_liked: false
                            }
                        }
                    })
                );
            });

            var liked = 0

            server.attachCallback("like_post", function () {
                liked++
            })

            return instance.init(simulateSetting())
                .then(() => instance.actions.likeTagImages("testtag", 1000, 4)) // Tag, millisec wait, limit
                .then((error) => {
                    chai.expect(liked).to.equal(4, "Should like 4 photos as is default in settings")
                    chai.expect(error.stoppedBy).to.equal("LIKE_LIMIT_REACHED", "Ensure that the bot was stopped by the correct error")
                    chai.expect(server.requests.length).to.equal(10, "Check that the calls correspond")
                })
        });

        it("Should not like as police rejects it", function () {
            var instance = new instagram();

            server.respond(/\/explore\/tags\/testtag\//, function (xhr) {
                xhr.respond(200, 
                    { "Content-Type": "application/json" },
                    JSON.stringify(createImagesObject(1))
                )
            })

            server.respond(/\/p\/\d*\//, function (xhr) {
                xhr.respond(200,
                    { "Content-Type": "application/json" },
                    JSON.stringify({
                        graphql: {
                            shortcode_media: {
                                viewer_has_liked: false
                            }
                        }
                    })
                );
            });

            var liked = false

            server.attachCallback("like_post", function () {
                liked = true
            })

            return instance.init(simulateSetting({
                filters: {
                    likes: {
                        isLikeNumber: 100,
                        isLikeNumberInclusive: true,
                        isLikeNumberMoreLess: true
                    }
                }
            }))
                .then(() => instance.actions.likeTagImages("testtag", 1000, 4)) // Tag, millisec wait, limit
                .then((error) => {
                    chai.expect(liked).to.equal(false, "Should not like anything");
                    //chai.expect(server.requests.length).to.equal(3, "Like not performed")
                })
        });

        it("Check next page functionality", function () {
            var instance = new instagram(), nextPage = true;

            server.respond(/\/explore\/tags\/testtag\//, function (xhr, url) {
                var obj = createImagesObject(1);
                // Add next page functionality
                if (nextPage) {
                    obj.tag.media.page_info = {
                        end_cursor: "TESTCURSOR"
                    }
                    nextPage = false; // Prevent from recursively calling
                } else {
                    // Second call, here must be params with correct data
                    chai.expect(xhr.url).to.contain("query_id=", "Should have query_id parameter")
                    chai.expect(xhr.url).to.contain('"after":"TESTCURSOR"', "Should have cursor we added before")
                    chai.expect(xhr.url).to.contain('"tag_name":"testtag"', "Should have testtag tag name")
                }

                xhr.respond(200, 
                    { "Content-Type": "application/json" },
                    JSON.stringify(obj)
                )
            })

            server.respond(/\/p\/\d*\//, function (xhr) {
                xhr.respond(200,
                    { "Content-Type": "application/json" },
                    JSON.stringify({
                        graphql: {
                            shortcode_media: {
                                viewer_has_liked: false
                            }
                        }
                    })
                );
            });

            var liked = 0

            server.attachCallback("like_post", function () {
                liked++
            })

            return instance.init(simulateSetting())
                .then(() => instance.actions.likeTagImages("testtag", 1000, 4)) // Tag, millisec wait, limit
                .then((error) => {
                    chai.expect(liked).to.equal(2, "Should like one image from first and one from the second page")
                })
        });
        
        it("Should fail and ask to reload app as instagram 'crashed'", function () {
            var instance = new instagram();

            server.respond(/\/explore\/tags\/testtag\//, function (xhr) {
                xhr.respond(200, 
                    { "Content-Type": "application/json" },
                    JSON.stringify(createImagesObject(1))
                )
            })

            server.respond(/\/p\/\d*\//, function (xhr) {
                xhr.respond(500);
            });

            var liked = false

            server.attachCallback("like_post", function () {
                liked = true
            })

            return instance.init(simulateSetting())
                .then(() => instance.actions.likeTagImages("testtag", 1000, 4)) // Tag, millisec wait, limit
                .then((error) => {
                    throw new Error("Should not be a success")
                }, function (error) {
                    chai.expect(error).to.have.property("action", "RELOAD")
                    chai.expect(error).to.have.property("id", "CONNECTION_ERROR_TAG_LIKE")
                })
        })
    })
})