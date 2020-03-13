import { mount } from '@vue/test-utils'

import Vue from 'vue'

import LogScraper from '../../../src/shared/components/LogScraper.vue'

describe("#LogScraper", function () {
    var calls = {
        send: [],
        receive: []
    }

    const wrapper = mount(LogScraper, {
        mocks: {
            $send: function (action, data) {
                calls.send.push({
                    action,
                    data
                })
            }
        }
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

    it ('Check if changing the button', async function () {
        const button = wrapper.find('a .fa-instagram')
        button.trigger('click')

        await Vue.nextTick()

        var btn = wrapper.contains('.selected .fa-globe')

        chai.expect(btn).to.equal(false)

        btn = wrapper.contains('.selected .fa-instagram')

        chai.expect(btn).to.equal(true, "The new selected category should be instagram")
    })
})