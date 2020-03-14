import { mount } from '@vue/test-utils'

import Vue from 'vue'

import Headbar from '../../../src/shared/components/Headbar.vue'

describe("#Headbar", function () {
    before(function () {
        window.chrome = {}
        chrome = {
            extension: {
                getURL: function() {
                    return ""
                }
            }
        }
    })

    it('Check if component renders', () => {
        const wrapper = mount(Headbar)

        chai.expect(wrapper.html()).to.contain('id="headBar"')
    })

    it("Should show settings icon", function () {
        const wrapper = mount(Headbar, {
            propsData: {
                showsettings: true
            },
            data: function () {
                return {
                    links: {
                        home: "homeLink",
                        settings: "settingsLink"
                    }
                }
            }
        })

        chai.expect(wrapper.html()).to.contain('settingsLink', "Should show settings icon as is requested by props")
    })

    it("Should hide settings icon", function () {
        const wrapper = mount(Headbar, {
            propsData: {
                showsettings: false
            },
            data: function () {
                return {
                    links: {
                        home: "homeLink",
                        settings: "settingsLink"
                    }
                }
            }
        })

        chai.expect(wrapper.html()).to.not.contain('settingsLink', "Should hide settings icon as is requested by props")
    })

    it("Should show header without link", function () {
        const wrapper = mount(Headbar, {
            propsData: {
                titlelink: false
            },
            data: function () {
                return {
                    links: {
                        home: "homeLink",
                        settings: "settingsLink"
                    }
                }
            }
        })

        chai.expect(wrapper.html()).to.not.contain('homeLink', "Should generate header without link")
    })

    it("Should show header with link", function () {
        const wrapper = mount(Headbar, {
            propsData: {
                titlelink: true
            },
            data: function () {
                return {
                    links: {
                        home: "homeLink",
                        settings: "settingsLink"
                    }
                }
            }
        })

        chai.expect(wrapper.html()).to.contain('homeLink', "Should generate header with link")
    })
})