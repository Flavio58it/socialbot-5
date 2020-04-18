import instagram from "../../../../src/service/plugs/instagram/instagram";
import urls from "../../../../src/service/plugs/instagram/urls";
import db from "../../../../src/service/bot/db";

import { simulateSetting } from "../../../utils/settingsManager";
import { createServer } from "./servers";
import { imageStructure, singleImage, user, rawHomePageStructure } from "./fakeData";

// Creates the main images object found in account
function createImagesObject(numberOfImages, viewed) {
    var object = imageStructure(), images = singleImage(viewed);

    for (let i = 0; i < numberOfImages; i++) {
        object.tag.media.nodes.push(images);
    }

    return object
}

describe("@instagram", function () {
    var server = false;

    beforeEach(function () {
        server = createServer([
            "homepage_logged",
            "like_post",
            "notifications_list"
        ]);

        // Reset database
        return db.history.clear().then(() => db.users.clear())
    });

    afterEach(function () {
        // Shut off server
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
            var instance = new instagram(simulateSetting());

            return instance.init().then(function (data) {
                chai.expect(server.requests.length).to.equal(1, "Should call server to get informations")
                chai.expect(data).to.have.property("connectionOk", true)
                chai.expect(data).to.have.property("logged", true)
                chai.expect(data).to.have.property("domain")
            })
        });
    });

    context("likeTagImages()", function () {
        it("Should perform calls to server and respond", function () {
            var instance = new instagram(simulateSetting());

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

            return instance.init()
                .then(() => instance.actions.likeTagImages("testtag")) // Tag, millisec wait, limit
                .then((error) => {
                    chai.expect(error).to.be.undefined
                    chai.expect(server.requests.length).to.equal(4)
                }).then(() => db.history.toArray()).then((database) => {
                    chai.expect(database).to.have.lengthOf(1, "One like in database")
                    chai.expect(database[0]).to.have.property("action", "USER_LIKE")
                })
        });

        it("Should not like as is tagged as already liked", function () {
            var instance = new instagram(simulateSetting());

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

            return instance.init()
                .then(() => instance.actions.likeTagImages("testtag")) // Tag, millisec wait, limit
                .then((error) => {
                    chai.expect(error.stoppedBy).to.equal("ALREADY_LIKED", "Ensure that the bot was stopped by the correct error")
                    chai.expect(server.requests.length).to.equal(3, "One less request as like is not performed")
                }).then(() => db.history.toArray()).then((database) => {
                    chai.expect(database).to.have.lengthOf(0, "No likes in database")
                })
        });

        it("Like until limit is reached", function () {
            var instance = new instagram(simulateSetting({
                modules: {
                    like: {
                        limits: {
                            tag: 4,
                            dash: 5,
                            explorer: 6
                        }
                    }
                }
            }));

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

            return instance.init()
                .then(() => instance.actions.likeTagImages("testtag")) // Tag, millisec wait, limit
                .then((error) => {
                    chai.expect(liked).to.equal(4, "Should like 4 photos as is default in settings")
                    chai.expect(error.stoppedBy).to.equal("LIKE_LIMIT_REACHED", "Ensure that the bot was stopped by the correct error")
                    chai.expect(server.requests.length).to.equal(10, "Check that the calls correspond")
                }).then(() => db.history.toArray()).then((database) => {
                    chai.expect(database).to.have.lengthOf(4, "Liked 4 photos")
                    chai.expect(database[0]).to.have.property("action", "USER_LIKE")
                })
        });

        it("Should not like as police rejects it", function () {
            var instance = new instagram(simulateSetting({
                modules: {
                    like: {
                        filters: {
                            isLikeNumber: 100,
                            isLikeNumberInclusive: true,
                            isLikeNumberMoreLess: true
                        }
                    }
                }
            }));

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

            return instance.init()
                .then(() => instance.actions.likeTagImages("testtag")) // Tag, millisec wait, limit
                .then((error) => {
                    chai.expect(liked).to.equal(false, "Should not like anything");
                    //chai.expect(server.requests.length).to.equal(3, "Like not performed")
                }).then(() => db.history.toArray()).then((database) => {
                    chai.expect(database).to.have.lengthOf(0, "No likes in database")
                })
        });

        it("Check next page functionality", function () {
            var instance = new instagram(simulateSetting()), nextPage = true;

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

            return instance.init()
                .then(() => instance.actions.likeTagImages("testtag")) // Tag, millisec wait, limit
                .then((error) => {
                    chai.expect(liked).to.equal(2, "Should like one image from first and one from the second page")
                }).then(() => db.history.toArray()).then((database) => {
                    chai.expect(database).to.have.lengthOf(2, "Two likes in database")
                    chai.expect(database[0]).to.have.property("action", "USER_LIKE")
                })
        });
        
        it("Should fail and ask to reload app as instagram 'crashed'", function () {
            var instance = new instagram(simulateSetting());

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

            return instance.init()
                .then(() => instance.actions.likeTagImages("testtag")) // Tag, millisec wait, limit
                .then((error) => {
                    throw new Error("Should not be a success")
                }, function (error) {
                    chai.expect(error).to.have.property("action", "RELOAD")
                    chai.expect(error).to.have.property("id", "CONNECTION_ERROR_TAG_LIKE")
                }).then(() => db.history.toArray()).then((database) => {
                    chai.expect(database).to.have.lengthOf(0, "No likes as has crashed")
                })
        })
    })

    context("likeDashboard()", function () {
        it("Should like 1 image as is the only present in dashboard", function (){
            var liked = 0, home = false, actionLog = false;

            server.attachCallback("like_post", function (xhr, url, data) {
                liked++;
            });

            server.respond(urls.home + "/?__a=1", function (xhr) {
                home = true;
                var obj = {
                    graphql: {
                        user: {
                            edge_web_feed_timeline: {
                                edges: createImagesObject(1).tag.media.nodes // Use already present system
                            }
                        }
                    }
                }

                xhr.respond(200,
                    { "Content-Type": "application/json" },
                    JSON.stringify(obj)
                );
            })

            var instance = new instagram(simulateSetting());

            return instance.init()
                .then(() => instance.actions.likeDashboard()) // Millisec wait, limit
                .then((error) => {
                    chai.expect(error).to.equal(undefined)
                    chai.expect(liked).to.equal(1, "Liked one image")
                    chai.expect(home).to.equal(true)
                }).then(() => db.history.toArray()).then((database) => {
                    chai.expect(database).to.have.lengthOf(1, "One like log should be present in database")
                    chai.expect(database[0]).to.have.property("action", "USER_LIKE")
                })
        });

        it("Should like 1 image as is the only present in dashboard. New instagram mode", function (){
            var liked = 0, home = false;

            server.attachCallback("like_post", function (xhr, url, data) {
                liked++;
            });

            // Json response is now broken in instagram. Here it simulate the empty object that is returned when this call is tried
            server.respond(urls.home + "/?__a=1", function (xhr) {
                var obj = {}

                xhr.respond(200,
                    { "Content-Type": "application/json" },
                    JSON.stringify(obj)
                );
            })

            // The fallback consists to the default homepage to be called
            server.attachCallback("homepage_logged", function (xhr) {
                home = true; // Check that the edited homepage has been called
                return rawHomePageStructure([
                    `window.__additionalDataLoaded('feed', {
                        user: {
                            edge_web_feed_timeline: {
                                edges: ${JSON.stringify(createImagesObject(1).tag.media.nodes)}
                            }
                        }});`
                ])
            })

            var instance = new instagram(simulateSetting());

            return instance.init()
                .then(() => instance.actions.likeDashboard()) // Millisec wait, limit
                .then((error) => {
                    chai.expect(error).to.equal(undefined)
                    chai.expect(liked).to.equal(1, "Liked one image")
                    chai.expect(home).to.equal(true)
                }).then(() => db.history.toArray()).then((database) => {
                    chai.expect(database).to.have.lengthOf(1, "One like log should be present in database")
                    chai.expect(database[0]).to.have.property("action", "USER_LIKE")
                })
        });

        it("Should not like anything as is already liked", function (){
            var liked = 0, home = false

            server.attachCallback("like_post", function (xhr, url, data) {
                liked++;
            });

            server.respond(urls.home + "/?__a=1", function (xhr) {
                home = true;
                var obj = {
                    graphql: {
                        user: {
                            edge_web_feed_timeline: {
                                edges: [
                                    {
                                        node: {
                                            id: 123456780,
                                            viewer_has_liked: true
                                        }
                                    }
                                ]
                            }
                        }
                    }
                }

                xhr.respond(200,
                    { "Content-Type": "application/json" },
                    JSON.stringify(obj)
                );
            })

            var instance = new instagram(simulateSetting());

            return instance.init()
                .then(() => instance.actions.likeDashboard()) // Millisec wait, limit
                .then((error) => {
                    chai.expect(error).to.have.property("stoppedBy", "ALREADY_LIKED")
                    chai.expect(liked).to.equal(0, "Already liked")
                    chai.expect(home).to.equal(true)
                }).then(() => db.history.toArray()).then((database) => {
                    chai.expect(database).to.have.lengthOf(0, "Nothing in database")
                })
        });

        it("Should be limited to 4 likes", function (){
            var liked = 0, home = false

            server.attachCallback("like_post", function (xhr, url, data) {
                liked++;
            });

            server.respond(urls.home + "/?__a=1", function (xhr) {
                home = true;
                var obj = {
                    graphql: {
                        user: {
                            edge_web_feed_timeline: {
                                edges: createImagesObject(10).tag.media.nodes // Use already present system
                            }
                        }
                    }
                }

                xhr.respond(200,
                    { "Content-Type": "application/json" },
                    JSON.stringify(obj)
                );
            })

            var instance = new instagram(simulateSetting({
                modules: {
                    like: {
                        limits: {
                            tag: 4,
                            dash: 5,
                            explorer: 6
                        }
                    }
                }
            }));

            return instance.init()
                .then(() => instance.actions.likeDashboard()) // Millisec wait, limit
                .then((error) => {
                    chai.expect(error).to.have.property("stoppedBy", "LIKE_LIMIT_REACHED")
                    chai.expect(liked).to.equal(5, "Liked four images")
                    chai.expect(home).to.equal(true)
                }).then(() => db.history.toArray()).then((database) => {
                    chai.expect(database).to.have.lengthOf(5, "4 likes in database")
                    chai.expect(database[0]).to.have.property("action", "USER_LIKE")
                })
        });
    
        it("Like filter, disallow all", function () {
            var liked = 0, home = false

            server.attachCallback("like_post", function (xhr, url, data) {
                liked++;
            });

            server.respond(urls.home + "/?__a=1", function (xhr) {
                home = true;
                var obj = {
                    graphql: {
                        user: {
                            edge_web_feed_timeline: {
                                edges: createImagesObject(3).tag.media.nodes // Use already present system
                            }
                        }
                    }
                }

                xhr.respond(200,
                    { "Content-Type": "application/json" },
                    JSON.stringify(obj)
                );
            })

            var instance = new instagram(simulateSetting({
                modules: {
                    like: {
                        filters: {
                            isLikeNumber: 2,
                            isLikeNumberInclusive: true,
                            isLikeNumberMoreLess: true
                        }
                    }
                }
            }));

            return instance.init()
                .then(() => instance.actions.likeDashboard()) // Millisec wait, limit
                .then((error) => {
                    chai.expect(liked).to.equal(0, "No likes as is filtered")
                    chai.expect(home).to.equal(true)
                }).then(() => db.history.toArray()).then((database) => {
                    chai.expect(database).to.have.lengthOf(0, "Nothing in database")
                })
        });
    });

    context("followManager()", function () {
        it("Followback, unFollowBack and onlyFetch disabled, should only update 'followed by' users", function () {
            var instance = new instagram(simulateSetting({
                modules: {
                    follow: {
                        followBack: false,
                        unFollowBack: false
                    }
                }
            }));

            server.attachCallback("homepage_logged", function () {
                return rawHomePageStructure({
                    config: {
                        viewer: user().user
                    }
                })
            })

            server.respondWith(/\/graphql\/query\//, function (xhr) {
                xhr.respond(200, { "Content-Type": "application/json" }, JSON.stringify({
                    data: {
                        user: {
                            edge_followed_by: {
                                edges: [
                                    {
                                        node: user().user
                                    }
                                ],
                                page_info: {}
                            }
                        }
                    }
                }));
            })

            return instance.init()
            .then(() => instance.actions.followManager(false)).then((users) => {
                chai.expect(users).to.be.lengthOf(1) // User is returden to caller
                return db.users.toArray();
            }).then((data) => {
                chai.expect(data).to.be.lengthOf(1, "User is inserted in database")
                chai.expect(data[0]).to.not.have.nested.property("details.autoFollowed", "The user was NOT autoFollowed")
            })
        });

        it("Should update follow", function () {
            var instance = new instagram(simulateSetting({
                followBack: false,
                unFollowBack: false
            }));

            server.attachCallback("homepage_logged", function () {
                return rawHomePageStructure({
                    config: {
                        viewer: user().user
                    }
                })
            })

            server.respondWith(/\/graphql\/query\//, function (xhr) {
                xhr.respond(200, { "Content-Type": "application/json" }, JSON.stringify({
                    data: {
                        user: {
                            edge_follow: {
                                edges: [
                                    {
                                        node: user().user
                                    }
                                ],
                                page_info: {}
                            }
                        }
                    }
                }));
            })

            return instance.init()
            .then(() => instance.actions.followManager(false)).then((users) => {
                chai.expect(users).to.be.lengthOf(1, "All users are returned") // User is returden to caller
                return db.users.toArray();
            }).then((data) => {
                chai.expect(data).to.be.lengthOf(1, "User is inserted in database")
            })
        });

        it("Should find next page users", function () {
            var instance = new instagram(simulateSetting({
                followBack: false,
                unFollowBack: false
            })), endCursor = "END_CURSR";

            server.attachCallback("homepage_logged", function () {
                return rawHomePageStructure({
                    config: {
                        viewer: user().user
                    }
                })
            })

            server.respondWith(/\/graphql\/query\//, function (xhr) {
                xhr.respond(200, { "Content-Type": "application/json" }, JSON.stringify({
                    data: {
                        user: {
                            edge_follow: {
                                edges: [
                                    {
                                        node: user().user
                                    }
                                ],
                                page_info: {
                                    has_next_page: true,
                                    end_cursor: endCursor
                                }
                            }
                        }
                    }
                }));
                if (!endCursor && xhr.url.indexOf("3129") > -1) // Check if the query contains the cursor at the second call. Filtered calls by part of query id
                    chai.expect(xhr.url).to.contain("END_CURSR")
                endCursor = false
            })

            return instance.init()
            .then(() => instance.actions.followManager(false)).then((users) => {
                chai.expect(users).to.be.lengthOf(2, "All users are returned, one per page") // User is returden to caller
                chai.expect(server.requests.length).to.equal(4, "Check if all calls are performed")
                return db.users.toArray();
            }).then((data) => {
                chai.expect(data).to.be.lengthOf(2, "Users are inserted in database")
            })
        })
    
        it("Should fail gracefully as user in database is corrupted", function () {
            var instance = new instagram(simulateSetting());

            server.attachCallback("homepage_logged", function () {
                return rawHomePageStructure({
                    config: {
                        viewer: user().user
                    }
                })
            })

            server.respondWith(/\/graphql\/query\//, function (xhr) {
                xhr.respond(200, { "Content-Type": "application/json" }, JSON.stringify({
                    data: {
                        user: {
                            edge_follow: {
                                edges: [
                                    {
                                        node: user().user
                                    }
                                ],
                                page_info: {
                                    has_next_page: true,
                                    end_cursor: false
                                }
                            }
                        }
                    }
                }));
            })

            return db.users.add({userid: undefined}).then(() => instance.init())
            .then(() => instance.actions.followManager(false)).then(() => {
                chai.assert.Throw("Should not be successful")
            }).catch((error) => {
                chai.expect(error).to.have.property("id", "DB_USER_CORRUPTED")

                return db.users.toArray();
            }).then((data) => {
                chai.expect(data).to.be.lengthOf(1, "Old corrupted user present")
            })
        });

        it("Should do nothing, the user exists", function () {
            var instance = new instagram(simulateSetting());

            server.attachCallback("homepage_logged", function () {
                return rawHomePageStructure({
                    config: {
                        viewer: user().user
                    }
                })
            })

            server.respondWith(/\/graphql\/query\//, function (xhr) {
                xhr.respond(200, { "Content-Type": "application/json" }, JSON.stringify({
                    data: {
                        user: {
                            edge_follow: {
                                edges: [
                                    {
                                        node: user().user
                                    }
                                ],
                                page_info: {
                                    has_next_page: true,
                                    end_cursor: false
                                }
                            }
                        }
                    }
                }));
            })

            var dbUser = user().user;

            return db.users.add({plug: "instagram", userid: dbUser.id, username: dbUser.username}).then(() => instance.init())
            .then(() => instance.actions.followManager(false)).then((data) => {
                chai.expect(data).to.be.lengthOf(1, "User remains to 1")

                return db.users.toArray();
            }).then((data) => {
                chai.expect(data).to.be.lengthOf(1, "User remains to 1")
            })
        });

        it("Should do nothing but the name in database is updated", function () {
            var instance = new instagram(simulateSetting());

            server.attachCallback("homepage_logged", function () {
                return rawHomePageStructure({
                    config: {
                        viewer: user().user
                    }
                })
            })

            server.respondWith(/\/graphql\/query\//, function (xhr) {
                xhr.respond(200, { "Content-Type": "application/json" }, JSON.stringify({
                    data: {
                        user: {
                            edge_follow: {
                                edges: [
                                    {
                                        node: user().user
                                    }
                                ],
                                page_info: {
                                    has_next_page: true,
                                    end_cursor: false
                                }
                            }
                        }
                    }
                }));
            })

            var dbUser = user().user;

            return db.users.add({plug: "instagram", userid: dbUser.id, username: "Chewbacca"}).then(() => instance.init())
            .then(() => instance.actions.followManager(false)).then((data) => {
                chai.expect(data).to.be.lengthOf(1, "User remains to 1")

                return db.users.toArray();
            }).then((data) => {
                chai.expect(data).to.be.lengthOf(1, "User remains to 1")
                chai.expect(data[0]).to.have.property("username", "Chewbacca")
            })
        });
    
        it("Should change status of user to likeBacked", function () {
            var instance = new instagram(simulateSetting());

            server.attachCallback("homepage_logged", function () {
                return rawHomePageStructure({
                    config: {
                        viewer: user().user
                    }
                })
            })

            server.respondWith(/\/graphql\/query\//, function (xhr) {
                xhr.respond(200, { "Content-Type": "application/json" }, JSON.stringify({
                    data: {
                        user: {
                            edge_follow: {
                                edges: [
                                    {
                                        node: user().user
                                    }
                                ],
                                page_info: {
                                    has_next_page: true,
                                    end_cursor: false
                                }
                            }
                        }
                    }
                }));
            })

            var dbUser = user().user;

            return db.users.add({plug: "instagram", userid: dbUser.id, username: "Chewbacca"}).then(() => instance.init())
            .then(() => instance.actions.followManager(false)).then((data) => {
                chai.expect(data).to.be.lengthOf(1, "User remains to 1")

                return db.users.toArray();
            }).then((data) => {
                chai.expect(data).to.be.lengthOf(1, "User remains to 1")
                chai.expect(data[0]).to.have.property("username", "Chewbacca")
            })
        });

        it("Should edit already present user in database and follow it", function () {
            var instance = new instagram(simulateSetting({
                modules: {
                    follow: {
                        followBack: true
                    }
                }
            }));

            server.attachCallback("homepage_logged", function () {
                return rawHomePageStructure({
                    config: {
                        viewer: user().user
                    }
                })
            })

            server.respondWith(/\/tester\/\?__a=1/, function (xhr) {
                xhr.respond(200, { "Content-Type": "application/json" }, JSON.stringify({}))
            })

            server.respondWith(/\/graphql\/query\//, function (xhr) {
                xhr.respond(200, { "Content-Type": "application/json" }, JSON.stringify({
                    data: {
                        user: {
                            edge_follow: {
                                edges: [
                                    {
                                        node: user().user
                                    }
                                ],
                                page_info: {
                                    has_next_page: false,
                                    end_cursor: false
                                }
                            }
                        }
                    }
                }));
            });

            var dbUser = user().user;

            return db.users.add({plug: "instagram", userid: dbUser.id, username: "tester", toFollow: 2}).then(() => instance.init())
            .then(() => instance.actions.followManager(false)).then((data) => {
                chai.expect(data).to.be.lengthOf(1, "User remains 1")

                return db.users.toArray();
            }).then((data) => {
                chai.expect(data).to.be.lengthOf(1, "User in db remains 1")
                return db.users.toArray()
            }).then((data) => {
                chai.expect(data).to.be.lengthOf(1, "One action performed")
                chai.expect(data[0]).to.have.nested.property("details.autoFollowed", true, "The user was autoFollowed")
            })
        });

        it("Should not followback as no users present so is first round", function () {
            var instance = new instagram(simulateSetting({
                modules: {
                    follow: {
                        followBack: true
                    }
                }
            }));

            server.attachCallback("homepage_logged", function () {
                return rawHomePageStructure({
                    config: {
                        viewer: user().user
                    }
                })
            })

            server.respondWith(/\/tester\/\?__a=1/, function (xhr) {
                xhr.respond(200, { "Content-Type": "application/json" }, JSON.stringify({}))
            })

            server.respondWith(/\/graphql\/query\//, function (xhr) {
                xhr.respond(200, { "Content-Type": "application/json" }, JSON.stringify({
                    data: {
                        user: {
                            edge_follow: {
                                edges: [
                                    {
                                        node: user().user
                                    }
                                ],
                                page_info: {
                                    has_next_page: false,
                                    end_cursor: false
                                }
                            }
                        }
                    }
                }));
            });

            return instance.init().then(() => instance.actions.followManager(false)).then((data) => {
                chai.expect(data).to.be.lengthOf(1, "User is 1")

                return db.users.toArray();
            }).then((data) => {
                chai.expect(data).to.be.lengthOf(1, "One action performed")
                chai.expect(data[0]).to.not.have.nested.property("details.autoFollowed", "The user was not autoFollowed as db was empty")
            })
        });
    });

    context("searchUsers()", function() {
        it("Search for one user", function () {
            var instance = new instagram(simulateSetting());

            server.respondWith(/\/web\/search\/topsearch\//, function (xhr) {
                chai.expect(xhr.url).contains("query=tester")
                xhr.respond(200, 
                    { "Content-Type": "application/json" },
                    JSON.stringify({
                        users: [
                            {
                                position: 1,
                                "user": {
                                    "pk": "1111111111",
                                    "username": "tester",
                                    "full_name": "tester",
                                    "profile_pic_url": "TESTIMG",
                                }
                            }
                        ]
                    })
                )
            });

            return instance.init().then(() => instance.directActions["searchUsers"]({username: "tester"})).then((result) => {
                chai.expect(result).to.be.lengthOf(1)
                chai.expect(result[0]).to.have.property("username", "tester")
                chai.expect(result[0]).to.have.property("fullName", "tester")
            })
        });
    });

    context("likeBack()", function () {
        it("Should likeBack one user image", function () {
            var instance = new instagram(simulateSetting()),
                required = {
                    liked: 0,
                    user: false,
                    homepage: false
                };

            server.attachCallback("homepage_logged", function () {
                required.homepage = true;
                return rawHomePageStructure()
            })

            server.attachCallback("like_post", function (xhr, url, data) {
                required.liked++;
            });

            server.respondWith(/\/testman\/\?__a=1/, function (xhr) {
                required.user = true;
                xhr.respond(200, { "Content-Type": "application/json" }, JSON.stringify(user("testman")));
            });

            server.respondWith(/\/p\/\d*\//, function (xhr) {
                chai.expect(xhr.url).to.contain("/100/", "Image code is correctly required");
                xhr.respond(200, { "Content-Type": "application/json" }, JSON.stringify({
                    graphql: {
                        shortcode_media: {
                            viewer_has_liked: false
                        }
                    }
                }));
            });

            return instance.init().then((data) => instance.actions.likeBack()).then((result) => {
                chai.expect(result).to.be.undefined
                chai.expect(required.user).to.equal(true, "User has been required")
                chai.expect(required.homepage).to.equal(true, "Homepage has been required")
                chai.expect(required.liked).to.equal(1, "An image has been liked")
            })
        });

        it("Should not likeBack as the image has already ben liked", function () {
            var instance = new instagram(simulateSetting()),
                required = {
                    liked: 0,
                    homepage: false
                };

            server.attachCallback("homepage_logged", function () {
                required.homepage = true;
                return rawHomePageStructure()
            })

            server.attachCallback("like_post", function (xhr, url, data) {
                required.liked++;
            });

            server.respondWith(/\/p\/\d*\//, function (xhr) {
                chai.expect(xhr.url).to.contain("/100/", "Image code is correctly required");
                xhr.respond(200, { "Content-Type": "application/json" }, JSON.stringify({
                    graphql: {
                        shortcode_media: {
                            viewer_has_liked: true
                        }
                    }
                }));
            });

            return instance.init().then((data) => instance.actions.likeBack()).then((result) => {
                chai.expect(result).to.be.undefined
                chai.expect(required.homepage).to.equal(true, "Homepage has been required")
                chai.expect(required.liked).to.equal(0, "Image already liked")
                return db.users.toArray()
            }).then((data) => {
                chai.expect(data).to.be.lengthOf(1)
                chai.expect(data[0]).to.have.property("userid", 998, "The user has been inserted in database")
            })
        });

        it("Should not likeBack as the user has already been liked recently", function () {
            var instance = new instagram(simulateSetting()),
                required = {
                    liked: 0,
                    homepage: false
                };

            server.attachCallback("homepage_logged", function () {
                required.homepage = true;
                return rawHomePageStructure()
            })

            server.attachCallback("like_post", function (xhr, url, data) {
                required.liked++;
            });

            server.respondWith(/\/p\/\d*\//, function (xhr) {
                chai.expect(xhr.url).to.contain("/100/", "Image code is correctly required");
                xhr.respond(200, { "Content-Type": "application/json" }, JSON.stringify({
                    graphql: {
                        shortcode_media: {
                            viewer_has_liked: false
                        }
                    }
                }));
            });

            return db.users.add({plug: "instagram", userid: 998, lastInteraction: new Date().getTime()}).then(() => instance.init())
                .then((data) => instance.actions.likeBack()).then((result) => {
                    chai.expect(result).to.be.undefined
                    chai.expect(required.homepage).to.equal(true, "Homepage has been required")
                    chai.expect(required.liked).to.equal(0, "User already liked")
                })
        });

        it("Should likeBack with user already in database. Update of lastInteraction", function () {
            var instance = new instagram(simulateSetting()),
                required = {
                    liked: 0,
                    homepage: false
                };

            server.attachCallback("homepage_logged", function () {
                required.homepage = true;
                return rawHomePageStructure()
            })

            server.attachCallback("like_post", function (xhr, url, data) {
                required.liked++;
            });

            server.respondWith(/\/p\/\d*\//, function (xhr) {
                chai.expect(xhr.url).to.contain("/100/", "Image code is correctly required");
                xhr.respond(200, { "Content-Type": "application/json" }, JSON.stringify({
                    graphql: {
                        shortcode_media: {
                            viewer_has_liked: false
                        }
                    }
                }));
            });

            return db.users.add({plug: "instagram", userid: 998, lastInteraction: 99999999}).then(() => instance.init())
                .then((data) => instance.actions.likeBack()).then((result) => {
                    chai.expect(result).to.be.undefined
                    chai.expect(required.homepage).to.equal(true, "Homepage has been required")
                    chai.expect(required.liked).to.equal(1, "User already liked")
                    return db.users.toArray()
                }).then((data) => {
                    chai.expect(data).to.be.lengthOf(1)
                    chai.expect(data[0]).to.have.property("userid", 998, "The user has been inserted in database")
                    chai.expect(data[0]).to.not.have.property("lastInteraction", 99999999, "Updates lastInteraction")
                    chai.expect(data[0]).to.have.property("lastInteraction")
                })
        });
    });
})