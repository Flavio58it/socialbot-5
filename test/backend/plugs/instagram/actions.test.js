import actions from "../../../../src/service/plugs/instagram/actions";
import { user } from "./fakeData";

// Unique user data as is cached
var userdata = user()

describe("@actions", function () {

    var xhr = false
    var requests =  []

    before(function () {
        xhr = sinon.useFakeXMLHttpRequest();

        xhr.onCreate = function (xhr) {
            requests.push(xhr);
        };
    });

    after(function () {
        xhr.restore();
    })

    beforeEach(function () {
        requests = []
    })


    it("Like a post", function () {
        var promis = actions.likePost(1, "ABCD").then(() => {
            chai.expect(requests[0].url).to.match(/\/1\//)
            chai.expect(requests[0].requestHeaders["x-csrftoken"]).to.equal("ABCD")
        });

        setTimeout(function () {
            requests[0].respond(200);
        }, 0)


        return promis;
    });

    it("Get user data with cache", function () {
        var promis = actions.getUserData("tester").then((data) => {
            chai.expect(data).to.have.property("username")

            // Test cache
            return actions.getUserData("tester").then((cached) => {
                chai.expect(cached).to.have.property("username")
            });
        });

        setTimeout(function () {
            requests[0].respond(200, 
                { "Content-Type": "application/json" },
                JSON.stringify(userdata)
            );

            // As is cached this should not happen! If happens broken data is provided in order to throw an error
            if (requests[1])
                requests[1].respond(200, 
                    { "Content-Type": "application/json" },
                    JSON.stringify({
                        user: {}
                    })
                );
        }, 0)

        return promis;
    });

    it("Get notifications", function () {
        var promis = actions.getNotifications().then((data) => {
            chai.expect(data).to.have.key("num")
        });
        

        setTimeout(function () {
            requests[0].respond(200, 
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
            );
        }, 0)

        return promis;
    });

    context("Likeback functionality", function () {
        it("When one new post, should like", function () {
            var server = sinon.createFakeServer({
                respondImmediately: true
            });
            
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
            var promis = actions.likeUserPosts("tester", "1", "4", false, {userInteraction: fakedLogger}).then(() => {
                chai.expect(server.requests.length).to.equal(2)
                chai.expect(fakedLogger.callCount).to.equal(1)
            });
    
            return promis;
        })


        it("Should like 2 posts", function () {
            // These are above oin order to have 
            // Run timeouts for posts liking
            var server = sinon.createFakeServer({
                    respondImmediately: true
                });

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
            var promis = actions.likeUserPosts("testerone", "1", "4", false, {userInteraction: fakedLogger}).then(() => {
                chai.expect(server.requests.length).to.equal(5)
                chai.expect(fakedLogger.callCount).to.equal(2)
            });
    
            return promis;
        })
        
    })

    context("searchUsers()", function() {
        it("Search for one user", function () {
            var server = sinon.createFakeServer({
                respondImmediately: true
            });

            server.respondWith(/\/web\/search\/topsearch\//, function (xhr) {
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

            return actions.searchUsers("tester").then((result) => {
                chai.expect(result).to.be.lengthOf(1)
                chai.expect(result[0]).to.have.property("username", "tester")
                chai.expect(result[0]).to.have.property("fullName", "tester")
            })
        });
    });
})