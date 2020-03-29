export function user (userId, userName) {
    return {
        user: {
            id: userId || 998,
            username: userName || "tester",
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
    }
}

export function imageStructure () {
    return {
        tag: {
            media: {
                nodes: [
                    
                ]
            }
        }
    }
}

export function singleImage (viewed) {
    return {
        id: 123456780,
        owner: {
            id: 1324,
            username: "tester"
        },
        caption: "This is a test",
        shortcode: "W1234",
        code: "1234",
        node: {
            id: 123456780,
            viewer_has_liked: viewed || false,
            likes: {
                count: 1
            }
        },
        display_src: "/i/testimagesrc",
        thumbnail_src: "/thumb/testimagesrc",
        likes: {
            count: 1
        }
    }
}

// Two operative modes. When the input is an array, all single items are treated as script
// Whenis an object is counted as an extension of default user object present in homepage.

export function rawHomePageStructure (extraData) {
    var defaultObj = {
        "config": {
            "csrf_token": "TEST"
        }, 
        "entry_data": {
            "LandingPage": false
        }
    },
    usedScripts = [];

    if (Array.isArray(extraData)) {
        usedScripts.push(extraData)
        usedScripts.push(`window._sharedData = ${JSON.stringify(defaultObj)}`)
    } else {
        usedScripts.push(`window._sharedData = ${JSON.stringify({...defaultObj, ...extraData})}`)
    }
        
    return `
        <html>
            <body>
                ${usedScripts.map((value) => `<script>${value}</script>`)}
            </body>
        </html>
    `
}