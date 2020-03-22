import { mount } from '@vue/test-utils'
import BootstrapVue from 'bootstrap-vue';
import Vue from 'vue'
import sinon from 'sinon'
Vue.use(BootstrapVue)

import {
    withWrapper
} from "../../utils/testUtils";

import StatsViewer from '../../../src/manager/StatsViewer/StatsViewer.vue'

describe("#StatsViewer", function () {
    it("Should mount with empty contents", function () {
        var wrapper = mount(StatsViewer)

        chai.expect(wrapper.contains("canvas#line-chart")).to.equal(true, "Chart should exist")
    })

    it("Should show current day stats vs yesterday", function () {
        var wrapper = mount(StatsViewer, {
            propsData: {
                stats: {
                    today: [
                        {
                            likes: 10,
                            likeBack: 5,
                            followBack: 3
                        }
                    ],
                    month: [
                        {
                            likes: 2,
                            likeBack: 10,
                            followBack: 3
                        }
                    ]
                }
            }
        })

        chai.expect(wrapper.contains("canvas#line-chart")).to.equal(true, "Chart should exist")

        chai.expect(withWrapper(wrapper).find(".statsCol").havingText("likes").html()).to.contain("fa-sort-up", "Should show positive trend")
        chai.expect(withWrapper(wrapper).find(".statsCol").havingText("liked back").html()).to.contain("fa-sort-down", "Should show negative trend")
        chai.expect(withWrapper(wrapper).find(".statsCol").havingText("follow back").html()).to.contain("fa-equals", "Should show neutral trend")
    })
})