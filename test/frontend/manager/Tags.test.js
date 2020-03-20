import { mount } from '@vue/test-utils'
import BootstrapVue from 'bootstrap-vue';
import Vue from 'vue'
Vue.use(BootstrapVue)

import Tags from '../../../src/manager/Tags.vue'

describe("#Tags", function () {
    it("Should render with empty array", function () {
        const wrapper = mount(Tags, {
            propsData: {
                value: []
            }
        })

        chai.expect(wrapper.html()).to.contain('No tags', "Should have 'no tags' message")
        chai.expect(wrapper.contains('input')).to.equal(true, "Should have input")
        chai.expect(wrapper.contains('button')).to.equal(true, "Should have button")
    });
    
    it("Should render with elements in array", function () {
        const wrapper = mount(Tags, {
            propsData: {
                value: ['test1', 'test2']
            }
        })

        chai.expect(wrapper.html()).to.not.contain('No tags', "Should not have 'no tags' message")
        chai.expect(wrapper.html()).to.contain('test1')
        chai.expect(wrapper.html()).to.contain('test2')
    });

    it("Should add tag", async function () {
        const wrapper = mount(Tags, {
            propsData: {
                value: []
            }
        })

        chai.expect(wrapper.html()).to.contain('No tags', "Should have 'no tags' message")

        wrapper.find('input').setValue('testtag')
        wrapper.find('button').trigger('click')

        await Vue.nextTick()

        chai.expect(wrapper.html()).to.not.contain('No tags', "Should not have 'no tags' message")
        chai.expect(wrapper.html()).to.contain('testtag')
    });
})