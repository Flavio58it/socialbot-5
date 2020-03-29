import actions from "../../../../src/service/plugs/instagram/actions";
import { 
    user
} from "./fakeData";

// Unique user data as is cached
const userdata = user()

describe("@actions", function () {
    var server = false

    beforeEach(function () {
        server = sinon.createFakeServer({
            respondImmediately: true
        });
    })

    it("Like a post", function () {
        let requested = false

        server.respondWith(/\/web\/likes\/\d\/like\/$/, function(xhr) {
            xhr.respond(200)
            chai.expect(xhr.url).to.match(/\/1\//)
            chai.expect(xhr.requestHeaders["x-csrftoken"]).to.equal("ABCD")

            requested = true
        })

        var promis = actions.likePost(1, "ABCD").then(() => {
            chai.expect(server.requests.length).to.equal(1)
        });

        return promis;
    });

    it("Get user data with cache", function () {

        let once = false

        server.respondWith(/\/tester\/\?__a=1$/, function (xhr) {
            if (!once)
                xhr.respond(200, 
                    { "Content-Type": "application/json" },
                    JSON.stringify(userdata)
                );
            else
                xhr.respond(200, 
                    { "Content-Type": "application/json" },
                    JSON.stringify({
                        user: {}
                    })
                );
            once = true
        })

        var promis = actions.getUserData("tester").then((data) => {
            chai.expect(data).to.have.property("username")

            // Test cache
            return actions.getUserData("tester").then((cached) => {
                chai.expect(cached).to.have.property("username")
            });
        });

        return promis;
    });

    it("Get notifications", function () {

        server.respondWith(/\/accounts\/activity\/\?__a=1$/, function (xhr) {
            xhr.respond(200, 
                { "Content-Type": "application/json" },
                JSON.stringify({
                    graphql: {
                        user: {
                            activity_feed: {
                                edge_web_activity_feed: {
                                    count: 1
                                }
                            }
                        }
                    }
                })
            )
        })

        var promis = actions.getNotifications().then((data) => {
            chai.expect(data).to.have.key("num")
        });

        return promis;
    });

    context("Likeback functionality", function () {
        it("When one new post, should like", function () {
            
            server.respondWith(/\/p\/\d/, function (xhr, id) {
                xhr.respond(200, 
                    { "Content-Type": "application/json" },
                    JSON.stringify({
                        graphql: {
                            shortcode_media: {
                                viewer_has_liked: false
                            }
                        }
                    })
                )
            })

            server.respondWith(/\/web\/likes\/.+\/like\//, function (xhr, id) {
                xhr.respond(200, 
                    { "Content-Type": "application/json" },
                    JSON.stringify({})
                )
            })
    
            var fakedLogger = sinon.fake.resolves()
            
            // This test depends on "Get user data with cache" test. It uses cached user setted here. 
            // If the cache test fails, it will also here.
            var promis = actions.likeUserPosts({
                username: "tester", 
                csrf: "1", 
                limit: "4", 
                checker: false, 
                log: {userInteraction: fakedLogger}
            }).then(() => {
                chai.expect(server.requests.length).to.equal(2)
                chai.expect(fakedLogger.callCount).to.equal(1)
            });
    
            return promis;
        })


        it("Should like 2 posts", function () {
            // These are above oin order to have 
            // Run timeouts for posts liking

            // User server response with 2 images
            server.respondWith(/\/testerone\//, function (xhr, id) {
                xhr.respond(200, 
                    { "Content-Type": "application/json" },
                    JSON.stringify({
                        user: {
                            username: "testerone",
                            user_name: "Testerone",
                            media: {
                                nodes: [
                                    {
                                        id: 105,
                                        likes: {
                                            count: 10
                                        },
                                        code: 100,
                                        thumbnail_src: "image",
                                        is_video: false
                                    },
                                    {
                                        id: 106,
                                        likes: {
                                            count: 12
                                        },
                                        code: 101,
                                        thumbnail_src: "image",
                                        is_video: false
                                    }
                                ]
                            }
                        }
                    })
                )
            })
            
            // Check if user has already liked the image
            server.respondWith(/\/p\/\d+/, function (xhr, id) {
                xhr.respond(200, 
                    { "Content-Type": "application/json" },
                    JSON.stringify({
                        graphql: {
                            shortcode_media: {
                                viewer_has_liked: false
                            }
                        }
                    })
                )
            })
            
            // Like image
            server.respondWith(/\/web\/likes\/.+\/like\//, function (xhr, id) {
                xhr.respond(200, 
                    { "Content-Type": "application/json" },
                    JSON.stringify({})
                )
            })
    
            var fakedLogger = sinon.fake.resolves()
            
            // This test depends on "Get user data with cache" test. It uses cached user setted here. 
            // If the cache test fails, it will also here.
            var promis = actions.likeUserPosts({
                username: "testerone", 
                csrf: "1", 
                limit: "4", 
                checker: false, 
                log: {userInteraction: fakedLogger}
            }).then(() => {
                chai.expect(server.requests.length).to.equal(5)
                chai.expect(fakedLogger.callCount).to.equal(2)
            });
    
            return promis;
        })


        it("Should like 2 posts with new instagram object", function () {
            // These are above oin order to have 
            // Run timeouts for posts liking

            // User server response with 2 images
            server.respondWith(/\/testerman\/\?__a=1$/, function (xhr, id) {
                xhr.respond(200, 
                    { "Content-Type": "application/json" },
                    JSON.stringify({
                        graphql: {
                            user: {
                                username: "testerman",
                                user_name: "Testerman",
                                edge_owner_to_timeline_media: {
                                    edges: [
                                        {
                                            node: {
                                                id: 105,
                                                likes: {
                                                    count: 10
                                                },
                                                shortcode: 100,
                                                thumbnail_src: "image",
                                                is_video: false
                                            }
                                        },
                                        {
                                            node: {
                                                id: 106,
                                                likes: {
                                                    count: 12
                                                },
                                                shortcode: 101,
                                                thumbnail_src: "image",
                                                is_video: false
                                            }
                                        }
                                    ]
                                }
                            }
                        }     
                    })
                )
            })
            
            // Check if user has already liked the image
            server.respondWith(/\/p\/\d+/, function (xhr, id) {
                xhr.respond(200, 
                    { "Content-Type": "application/json" },
                    JSON.stringify({
                        graphql: {
                            shortcode_media: {
                                viewer_has_liked: false
                            }
                        }
                    })
                )
            })
            
            // Like image
            server.respondWith(/\/web\/likes\/.+\/like\//, function (xhr, id) {
                xhr.respond(200, 
                    { "Content-Type": "application/json" },
                    JSON.stringify({})
                )
            })
    
            var fakedLogger = sinon.fake.resolves()
            
            // This test depends on "Get user data with cache" test. It uses cached user setted here. 
            // If the cache test fails, it will also here.
            var promis = actions.likeUserPosts({
                username: "testerman", 
                csrf: "1", 
                limit: "4", 
                checker: false, 
                log: {userInteraction: fakedLogger}
            }).then(() => {
                chai.expect(server.requests.length).to.equal(5)
                chai.expect(fakedLogger.callCount).to.equal(2)
            });
    
            return promis;
        })

        it("Should like nothing as user has not any photos", function () {
            // These are above oin order to have 
            // Run timeouts for posts liking

            // User server response with 2 images
            server.respondWith(/\/tester1\/\?__a=1$/, function (xhr, id) {
                xhr.respond(200, 
                    { "Content-Type": "application/json" },
                    JSON.stringify({
                        graphql: {
                            user: {
                                username: "tester1",
                                user_name: "Testerman",
                                edge_owner_to_timeline_media: {
                                    edges: []
                                }
                            }
                        }     
                    })
                )
            })
    
            var fakedLogger = sinon.fake.resolves()
            
            // This test depends on "Get user data with cache" test. It uses cached user setted here. 
            // If the cache test fails, it will also here.
            var promis = actions.likeUserPosts({
                username: "tester1", 
                csrf: "1", 
                limit: "4", 
                checker: false, 
                log: {userInteraction: fakedLogger}
            }).then(() => {
                chai.expect(server.requests.length).to.equal(1)
                chai.expect(fakedLogger.callCount).to.equal(0)
            });
    
            return promis;
        })
        
    })
})