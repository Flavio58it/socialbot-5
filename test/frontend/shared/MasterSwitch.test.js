import { mount } from '@vue/test-utils'
import BootstrapVue from 'bootstrap-vue';
import Vue from 'vue'

Vue.use(BootstrapVue)

import MasterSwitch from '../../../src/shared/components/MasterSwitch.vue'

describe("#MasterSwitch", function () {
    context("Main checks", function () {
        it("Should have correct defaults", function () {
            const wrapper = mount(MasterSwitch)

            chai.expect(wrapper.contains(".btnContainer.disabled")).to.equal(true, 'Should be disabled by default')
            chai.expect(wrapper.contains(".button.disabled")).to.equal(true, 'Should be disabled by default')
        })

        it("Should have correct values when enabled and running", function () {
            const wrapper = mount(MasterSwitch, {
                propsData: {
                    value: true,
                    running: true
                }
            })

            chai.expect(wrapper.contains(".btnContainer.running")).to.equal(true)
            chai.expect(wrapper.contains(".button.running")).to.equal(true)
        })

        it("Should have correct values when enabled and not running", function () {
            const wrapper = mount(MasterSwitch, {
                propsData: {
                    value: true,
                    running: false
                }
            })

            chai.expect(wrapper.contains(".btnContainer.standby")).to.equal(true)
            chai.expect(wrapper.contains(".button.standby")).to.equal(true)
        })

        it("Should have disabled value when status is invalid", function () {
            const wrapper = mount(MasterSwitch, {
                propsData: {
                    value: false,
                    running: true
                }
            })

            chai.expect(wrapper.contains(".btnContainer.disabled")).to.equal(true)
            chai.expect(wrapper.contains(".button.disabled")).to.equal(true)
        })

        it("Should emit event and become standby when clicked from disabled", async function () {
            const wrapper = mount(MasterSwitch, {
                propsData: {
                    value: false,
                    running: false
                }
            })

            chai.expect(wrapper.contains(".btnContainer.disabled")).to.equal(true)
            chai.expect(wrapper.contains(".button.disabled")).to.equal(true)

            wrapper.find(".button").trigger("click")

            wrapper.setProps({ value: true })

            await Vue.nextTick()

            chai.expect(wrapper.contains(".btnContainer.standby")).to.equal(true)
            chai.expect(wrapper.contains(".button.standby")).to.equal(true)

            chai.expect(wrapper.emitted()).to.have.deep.property("input", [[true]], "Should emit change to object")
        })
    })
});