import { mount } from '@vue/test-utils'
import BootstrapVue from 'bootstrap-vue';
import Vue from 'vue'
import sinon from 'sinon'
Vue.use(BootstrapVue)

import FollowManager from '../../../src/manager/FollowManager.vue'

//TODO: Basic test, to integrate when the component will be refactored.

describe("#Tags", function () {
    it("Should mount with no data", function () {
        var sent = sinon.fake()
        const wrapper = mount(FollowManager, {
            propsData: {
                plug: 'testplug'
            },
            mocks: {
                $send: sent
            }
        })

        chai.expect(sent.called).to.equal(true, "Should call backend for info")
        chai.expect(wrapper.html()).to.contain("fa-circle-notch", "Should show loading")
    })

    it("Should mount with a user and show it", async function () {
        var sent = sinon.fake()
        const wrapper = mount(FollowManager, {
            propsData: {
                plug: 'testplug',
            },
            data () {
                return {
                    users: [
                        {
                            img: "user_test_image",
                            profile_url: "user_profile_url",
                            fullname: "user_full_name"
                        }
                    ]
                }
            },
            mocks: {
                $send: sent
            }
        })

        chai.expect(sent.called).to.equal(true, "Should call backend for info")
        chai.expect(wrapper.html()).to.not.contain("fa-circle-notch", "Should not show loading")

        chai.expect(wrapper.contains("img[src='user_test_image']")).to.equal(true)
        chai.expect(wrapper.contains("a[href='user_profile_url']")).to.equal(true)
        chai.expect(wrapper.html()).to.contain("user_full_name", "Should have user name")
    })
})

