import actions from "../../../../src/service/plugs/instagram/actions";

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
                JSON.stringify({
                    user: {
                        username: "tester",
                        full_name: "Tester",
                        media: {
                            nodes: []
                        }
                    }
                })
            );

            // As is cached this should not happen!
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

    it("Like user posts", function () {
        var promis = actions.likeUserPosts("tester", 1, 4, false, {}).then(() => {
            chai.expect(requests).to.have.lengthOf(3);
        });

        setTimeout(function () {
            requests[0].respond(200, 
                { "Content-Type": "application/json" },
                JSON.stringify({
                    user: {
                        username: "tester",
                        full_name: "Tester",
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
                                }
                            ]
                        }
                    }
                })   
            );
            // Get post details
            if (requests[1])
                requests[1].respond(200, 
                    { "Content-Type": "application/json" },
                    JSON.stringify({
                        graphql: {
                            shortcode_media: {
                                viewer_has_liked: 10
                            }
                        }
                    })   
                );
            // Like user
            if (requests[2])
                requests[2].respond(200, 
                    { "Content-Type": "application/json" },
                    JSON.stringify({})   
                );

            console.log(requests.length)
        }, 0)

        return promis;
    })
})