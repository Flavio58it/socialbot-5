import { mount } from '@vue/test-utils'
import BootstrapVue from 'bootstrap-vue';
import Vue from 'vue'
import sinon from 'sinon'
Vue.use(BootstrapVue)

import StatsViewer from '../../../src/manager/StatsViewer/StatsViewer.vue'

describe("#StatsViewer", function () {
    it("Should mount with empty contents", function () {
        var wrapper = mount(StatsViewer)

        chai.expect(wrapper.contains("canvas#line-chart")).to.equal(true, "Chart should exist")
    })
})