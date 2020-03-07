// Test Police js implementation

import police from "../../src/service/police"
import { simulateSetting } from "../utils/settingsManager"

describe('#police()', function() {

    it('Constructor is object', function() {
        var policeObj = new police();

        chai.expect(policeObj).to.be.an("object");
    });

    it('Service stopped', function () {
        var policeObj = new police(simulateSetting({enabled: false}));

        var result = policeObj.shouldLike();

        return result.then(function () {
            chai.assert.fail()
        }, function (data) {
            chai.expect(data).to.have.property("stopped");
        });
    });

    context("Liker", function () {

        it("Like as is video and settings allows that", function () {
            var policeObj = new police(simulateSetting({
                enabled: true, 
                filters: {
                    likes: {
                        videos: true
                    }
                }
            }));
    
            return policeObj.shouldLike({
                isVideo: true
            }).then((result) => {
                chai.expect(result).to.equal(true);
            })
        });

        it("Do not like as is video and settings disallow that", function () {
            var policeObj = new police(simulateSetting({
                enabled: true, 
                filters: {
                    likes: {
                        videos: false
                    }
                }
            }));
    
            return policeObj.shouldLike({
                isVideo: true
            }).then((result) => {
                chai.expect(result).to.equal(false);
            })
        });
    
    
        it("Disallow like. Likenumber inclusive more", function () {
            var policeObj = new police(simulateSetting({
                enabled: true, 
                filters: {
                    likes: {
                        isLikeNumber: 100, // Simulate 100 treshold for likes
                        isLikeNumberInclusive: true, // True if the like should be done, false if not
                        isLikeNumberMoreLess: true // True if the like number should be more than or less than
                    }
                }
            }));
    
    
            return policeObj.shouldLike({
                likes: 90 // The actual number of likes scrubbed from site
            }).then((result) => {
                chai.expect(result).to.equal(false);
            });
        });
    
        it("Allow like. Likenumber inclusive more", function () {
            var policeObj = new police(simulateSetting({
                enabled: true, 
                filters: {
                    likes: {
                        isLikeNumber: 80,
                        isLikeNumberInclusive: true,
                        isLikeNumberMoreLess: true
                    }
                }
            }));
    
            return policeObj.shouldLike({
                likes: 90 
            }).then((result) => {
                chai.expect(result).to.equal(true);
            })
        });
    
        it("Disallow like. Likenumber exclusive more", function () {
            var policeObj = new police(simulateSetting({
                enabled: true, 
                filters: {
                    likes: {
                        isLikeNumber: 80,
                        isLikeNumberInclusive: false,
                        isLikeNumberMoreLess: true
                    }
                }
            }));
    
            return policeObj.shouldLike({
                likes: 90 
            }).then((result) => {
                chai.expect(result).to.equal(false);
            });
        });
    
        it("Allow like. Likenumber exclusive less", function () {
            var policeObj = new police(simulateSetting({
                enabled: true, 
                filters: {
                    likes: {
                        isLikeNumber: 100,
                        isLikeNumberInclusive: true,
                        isLikeNumberMoreLess: false
                    }
                }
            }));
    
            return policeObj.shouldLike({
                likes: 90 
            }).then((result) => {
                chai.expect(result).to.equal(true);
            });
        });
    
        it("Disallow like. Likenumber exclusive less - likenumber 100", function () {
            var policeObj = new police(simulateSetting({
                enabled: true, 
                filters: {
                    likes: {
                        isLikeNumber: 100,
                        isLikeNumberInclusive: true,
                        isLikeNumberMoreLess: false
                    }
                }
            }));

            return policeObj.shouldLike({
                likes: 90 
            }).then((result) => {
                chai.expect(result).to.equal(true);
            })
        });

        it("Allow like. Text filter with present text", function () {
            var policeObj = new police(simulateSetting({
                enabled: true, 
                filters: {
                    likes: {
                        isTextInclusive: true,
                        textFilters: [
                            "Woot woot",
                            "Rule"
                        ]
                    }
                }
            }));

            return policeObj.shouldLike({
                comment: "This is a day for woot woot"
            }).then((result) => {
                chai.expect(result).to.equal(true);
            })
        });

        it("Disallow like. Text filter with present text but with inverted inclusion", function () {
            var policeObj = new police(simulateSetting({
                enabled: true, 
                filters: {
                    likes: {
                        isTextInclusive: false,
                        textFilters: [
                            "Woot woot",
                            "Rule"
                        ]
                    }
                }
            }));

            return policeObj.shouldLike({
                comment: "This is a day for woot woot"
            }).then((result) => {
                chai.expect(result).to.equal(false);
            })
        });

        it("Disallow like. Text not present and not inclusive", function () {
            var policeObj = new police(simulateSetting({
                enabled: true, 
                filters: {
                    likes: {
                        isTextInclusive: false,
                        textFilters: [
                            "Woot woot",
                            "Rule"
                        ]
                    }
                }
            }));

            return policeObj.shouldLike({
                comment: "This is a day for heyla"
            }).then((result) => {
                chai.expect(result).to.equal(false);
            })
        });

        it("Disallow like. Text not present but inclusive", function () {
            var policeObj = new police(simulateSetting({
                enabled: true, 
                filters: {
                    likes: {
                        isTextInclusive: true,
                        textFilters: [
                            "Woot woot",
                            "Rule"
                        ]
                    }
                }
            }));

            return policeObj.shouldLike({
                comment: "This is a day for heyla"
            }).then((result) => {
                chai.expect(result).to.equal(false);
            })
        });
    });

    context("Follow", function () {
        it("Autofollow disabled", function () {
            var policeObj = new police(simulateSetting({
                enabled: false
            }));

            return policeObj.shouldFollow().then(function () {
                chai.assert.fail()
            }, function (data) {
                chai.expect(data).to.have.property("stopped");
            });
        });

        it("Follow as defaults are all 0", function () {
            var policeObj = new police(simulateSetting({
                enabled: true, 
                filters: {
                    follow: {
                        followers: {
                            number: 0,
                            more: false
                        },
                        following: {
                            number: 0,
                            more: false
                        }
                    }
                }
            }));

            return policeObj.shouldFollow({
                user: {
                    follows: 10,
                    followedBy: 10
                }
            }).then((result) => {
                chai.expect(result).to.equal(true);
            })
        });

        it("No Follow as followers are less than in settings and more is true", function () {
            var policeObj = new police(simulateSetting({
                enabled: true, 
                filters: {
                    follow: {
                        followers: {
                            number: 15,
                            more: true
                        },
                        following: {
                            number: 0,
                            more: false
                        }
                    }
                }
            }));

            return policeObj.shouldFollow({
                user: {
                    follows: 10,
                    followedBy: 10
                }
            }).then((result) => {
                chai.expect(result).to.equal(false);
            })
        });

        it("No follow as following is less than in settings and more is true", function () {
            var policeObj = new police(simulateSetting({
                enabled: true, 
                filters: {
                    follow: {
                        followers: {
                            number: 0,
                            more: false
                        },
                        following: {
                            number: 11,
                            more: true
                        }
                    }
                }
            }));

            return policeObj.shouldFollow({
                user: {
                    follows: 10,
                    followedBy: 10
                }
            }).then((result) => {
                chai.expect(result).to.equal(false);
            })
        });

        it("No follow as following is less than in settings and more is true", function () {
            var policeObj = new police(simulateSetting({
                enabled: true, 
                filters: {
                    follow: {
                        followers: {
                            number: 0,
                            more: false
                        },
                        following: {
                            number: 11,
                            more: true
                        }
                    }
                }
            }));

            return policeObj.shouldFollow({
                user: {
                    follows: 10,
                    followedBy: 10
                }
            }).then((result) => {
                chai.expect(result).to.equal(false);
            })
        });

        it("Follow as following is more than in settings and more is true", function () {
            var policeObj = new police(simulateSetting({
                enabled: true, 
                filters: {
                    follow: {
                        followers: {
                            number: 0,
                            more: false
                        },
                        following: {
                            number: 9,
                            more: true
                        }
                    }
                }
            }));

            return policeObj.shouldFollow({
                user: {
                    follows: 10,
                    followedBy: 10
                }
            }).then((result) => {
                chai.expect(result).to.equal(true);
            })
        });

        it("Follow as following is more than in settings and more is false", function () {
            var policeObj = new police(simulateSetting({
                enabled: true, 
                filters: {
                    follow: {
                        followers: {
                            number: 0,
                            more: false
                        },
                        following: {
                            number: 16,
                            more: false
                        }
                    }
                }
            }));

            return policeObj.shouldFollow({
                user: {
                    follows: 10,
                    followedBy: 10
                }
            }).then((result) => {
                chai.expect(result).to.equal(true);
            })
        });

        it("Follow as followers/following is more and both true", function () {
            var policeObj = new police(simulateSetting({
                enabled: true, 
                filters: {
                    follow: {
                        followers: {
                            number: 8,
                            more: true
                        },
                        following: {
                            number: 6,
                            more: true
                        }
                    }
                }
            }));

            return policeObj.shouldFollow({
                user: {
                    follows: 10,
                    followedBy: 10
                }
            }).then((result) => {
                chai.expect(result).to.equal(true);
            })
        });

        it("Follow as followers is less and true", function () {
            var policeObj = new police(simulateSetting({
                enabled: true, 
                filters: {
                    follow: {
                        followers: {
                            number: 8,
                            more: true
                        },
                        following: {
                            number: 0,
                            more: true
                        }
                    }
                }
            }));

            return policeObj.shouldFollow({
                user: {
                    follows: 10,
                    followedBy: 10
                }
            }).then((result) => {
                chai.expect(result).to.equal(true);
            })
        });

        it("Follow as followers is more and more is false", function () {
            var policeObj = new police(simulateSetting({
                enabled: true, 
                filters: {
                    follow: {
                        followers: {
                            number: 15,
                            more: false
                        },
                        following: {
                            number: 0,
                            more: true
                        }
                    }
                }
            }));

            return policeObj.shouldFollow({
                user: {
                    follows: 10,
                    followedBy: 10
                }
            }).then((result) => {
                chai.expect(result).to.equal(true);
            })
        });
        
    });
});