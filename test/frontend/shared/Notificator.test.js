import { mount } from '@vue/test-utils'
import BootstrapVue from 'bootstrap-vue';
import Vue from 'vue'

Vue.use(BootstrapVue)

import * as config from "../../../src/config.js"

import Notificator from "../../../src/shared/components/Notificator.vue"

config.default = {
    plugs: {
        testplug: {
            enabled: true,
            fontawesomeIcon: "fa-test-icon"
        }
    }
}

describe("#Notificator", function () {
    it("Should mount without notifications", async function () {
        const wrapper = mount(Notificator);

        chai.expect(wrapper.contains(".noNotifs")).to.equal(true, "Should show that no notifs are present")
        chai.expect(wrapper.contains(".notification")).to.equal(false, "Should not have any notification")
        chai.expect(wrapper.contains("#notifications[style*='display: none;']")).to.equal(true, "The popup should be hidden")

        wrapper.find(".notifButton").trigger("click")

        await Vue.nextTick()

        chai.expect(wrapper.contains("#notifications[style*='display']")).to.equal(false, "Should show the popup")
    })

    it("Should show notifications with correct icons and bg", async function () {
        const wrapper = mount(Notificator, {
            data () {
                return {
                    notifications: [
                        {
                            id: 1,
                            plug: "testplug",
                            toRead: true,
                            time: new Date().getTime(),
                            type: "error",
                            data: {
                                id: "ERROR_ID",
                                message: "Error message"
                            }
                        }
                    ]
                }
            }
        });

        chai.expect(wrapper.contains(".notification")).to.equal(true, "Should have a notification")
        chai.expect(wrapper.contains(".fab.fa-test-icon")).to.equal(true, "Should have correct icon")
        chai.expect(wrapper.contains(".notification.error")).to.equal(true, "Should have error class")

        chai.expect(wrapper.html()).to.contain("ERROR_ID", "Should show error id")
        chai.expect(wrapper.html()).to.contain("Error message", "Should show error message")
    })

    it("Should show default icon", async function () {
        const wrapper = mount(Notificator, {
            data () {
                return {
                    notifications: [
                        {
                            id: 1,
                            toRead: true,
                            time: new Date().getTime(),
                            type: "error",
                            data: {
                                id: "ERROR_ID",
                                message: "Error message"
                            }
                        }
                    ]
                }
            }
        });

        chai.expect(wrapper.contains(".notification")).to.equal(true, "Should have a notification")
        chai.expect(wrapper.contains(".fab.fa-robot")).to.equal(true, "Should have correct icon")
        chai.expect(wrapper.contains(".notification.error")).to.equal(true, "Should have error class")
    })
})