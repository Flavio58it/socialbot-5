import { mount } from '@vue/test-utils'

import Vue from 'vue'

import LogScraper from '../../../src/shared/components/LogScraper.vue'

describe("#LogScraper", function () {
    context("Filter checks", function () {
        var calls = {
            send: [],
            receive: []
        }
    
        var wrapper = false 
    
        before(function () {
            wrapper = mount(LogScraper, {
                mocks: {
                    $send: function (action, data) {
                        calls.send.push({
                            action,
                            data
                        })
                    }
                }
            })
        })
        
        beforeEach(function () {
            calls.send = []
            calls.receive = []
        })
    
        it('Check if component renders', () => {
            chai.expect(wrapper.html()).to.contain('id="logScraper"')
        })
    
        it ('Check if default filter is selected', function () {
            var btn = wrapper.contains('.selected .fa-globe')
    
            chai.expect(btn).to.equal(true)
        })
    
        it ('Check if filter selection works', async function () {
            const button = wrapper.find('a .fa-instagram')
            button.trigger('click')
    
            await Vue.nextTick()
    
            var btn = wrapper.contains('.selected .fa-globe')
    
            chai.expect(btn).to.equal(false)
    
            btn = wrapper.contains('.selected .fa-instagram')
    
            chai.expect(btn).to.equal(true, "The new selected category should be instagram")
        })
    })

    context("Check filters", function () {
        it("Should show loading spinner", function () {
            var wrapper = mount(LogScraper, {
                data () {
                    return {
                        list: false
                    }
                }
            })

            chai.expect(wrapper.html()).to.not.contain('noLogs')
            chai.expect(wrapper.html()).to.contain('fa-spin')
        })

        it("Should show loading spinner", function () {
            var wrapper = mount(LogScraper, {
                data () {
                    return {
                        list: []
                    }
                }
            })

            chai.expect(wrapper.html()).to.not.contain('fa-spin')
            chai.expect(wrapper.html()).to.contain('noLogs')
        })

        it("Should show one like log with image", function () {
            var wrapper = mount(LogScraper, {
                data () {
                    return {
                        list: [{
                            action: "USER_LIKE",
                            details: {
                                img: "testImg",
                                tag: "testTag",
                                userName: "testUserName"
                            }
                        }]
                    }
                }
            })

            chai.expect(wrapper.html()).to.not.contain('fa-spin')
            chai.expect(wrapper.html()).to.not.contain('noLogs')

            chai.expect(wrapper.html()).to.contain('testImg')
            chai.expect(wrapper.html()).to.contain('testTag')
            chai.expect(wrapper.html()).to.contain('testUserName')

            chai.expect(wrapper.html()).to.contain('Liked')

            chai.expect(wrapper.html()).to.contain('Unlike it')
        })

        it("Should show one followback log with image", function () {
            var wrapper = mount(LogScraper, {
                data () {
                    return {
                        list: [{
                            action: "USER_FOLLOWBACK",
                            details: {
                                img: "testImg",
                                userName: "testUserName"
                            }
                        }]
                    }
                }
            })

            chai.expect(wrapper.html()).to.not.contain('fa-spin')
            chai.expect(wrapper.html()).to.not.contain('noLogs')

            chai.expect(wrapper.html()).to.contain('testImg')
            chai.expect(wrapper.html()).to.contain('testUserName')

            chai.expect(wrapper.html()).to.contain('Followed back')

            chai.expect(wrapper.html()).to.contain('Unfollow', "Should show unfollow button")
        })
    })
})