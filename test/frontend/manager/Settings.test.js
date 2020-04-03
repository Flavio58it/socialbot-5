import { mount } from '@vue/test-utils'
import BootstrapVue from 'bootstrap-vue';
import Vue from 'vue'

Vue.use(BootstrapVue)

import * as config from "../../../src/config.js"

config.default = {
    plugs: {
        testplug: {
            enabled: true,
            completeName: "TestPlug",
            fontawesomeIcon: "fa-test-icon"
        }
    }
}

import Settings from '../../../src/manager/Settings.vue'

describe("#Settings", function () {
    it("Should mount with correct content", function () {
        const wrapper = mount(Settings, {
            mocks: {
                $route: {
                    name: ""
                }
            }
        })

        chai.expect(wrapper.html()).to.contain("TestPlug", "Should contain plug name in header")
    })
})