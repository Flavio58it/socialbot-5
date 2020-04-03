import { mount } from '@vue/test-utils'
import BootstrapVue from 'bootstrap-vue';
import Vue from 'vue'
import sinon from 'sinon'
Vue.use(BootstrapVue)

import FilterOptions from '../../../src/manager/FilterOptions.vue'

import modalStub from '../../utils/ModalStub'

describe("#filterOptions", function () {
    var emitted = []

    beforeEach(function () {
        emitted = []
    })

    it("Should mount with no data", function () {
        const wrapper = mount(FilterOptions, {
            propsData: {
                value: []
            },
            mocks: {
                $emit: function (event, data) {
                    if (event === "input")
                        emitted.push(data)
                }
            }
        })

        chai.expect(wrapper.html()).to.contain("No filters", "Should show message")
    })

    it("Should mount with data and show it", async function () {
        const wrapper = mount(FilterOptions, {
            propsData: {
                value: ["#hashtag"]
            },
            stubs: {
                'b-modal': modalStub()
            },
            mocks: {
                $emit: function (event, data) {
                    if (event === "input")
                        emitted.push(data)
                }
            }
        })

        chai.expect(wrapper.html()).to.contain("1 filters", "Should show message")
        wrapper.find("button").trigger("click")
        await Vue.nextTick();
        chai.expect(wrapper.contains("#modalFilters")).to.equal(true, "Should open modal")

        let html1 = wrapper.html()
        chai.expect(wrapper.contains('.tag')).to.equal(true, "Should create tag row")
        chai.expect(html1).to.contain('#hashtag')
        chai.expect(html1).to.contain('Edit')
        chai.expect(wrapper.contains('.remove')).to.equal(true, "The hashtag is removable")
        chai.expect(wrapper.contains('.badge.badge-success')).to.equal(true, "The badge is of hashtag")
        chai.expect(html1).to.contain('Hashtag', "Hashtag text should be present in badge")
    })

    it("Should insert data in dom and trigger input", async function () {
        const wrapper = mount(FilterOptions, {
            propsData: {
                value: []
            },
            stubs: {
                'b-modal': modalStub()
            }
        })

        chai.expect(wrapper.html()).to.contain("No filters", "Should show message")
        wrapper.find("button").trigger("click")
        
        await Vue.nextTick();

        wrapper.find("button.add").trigger("click")

        await Vue.nextTick();

        chai.expect(wrapper.contains("input[type='text']")).to.equal(true, "Should open input")

        wrapper.find("input[type='text']").setValue("@usernamed")
        wrapper.find("input[type='text']").trigger("keypress")

        await Vue.nextTick();

        wrapper.find("i.fa-save").trigger("click")

        await Vue.nextTick();

        chai.expect(wrapper.emittedByOrder()).to.be.lengthOf(1, "Should emit 1 input event")
        chai.expect(wrapper.emittedByOrder()[0].args[0]).to.deep.equal(['@usernamed', ''])

        chai.expect(wrapper.contains('.badge.badge-primary')).to.equal(true, "The badge is of Person")
        chai.expect(wrapper.html()).to.contain('Person', "Person text should be present in badge")

        // TODO: Should check that closing the input removes second param, but before must be fixed
    })

    it("Should delete data from dom and array", async function () {
        this.timeout(5000); // Some html checks makes the test slow
        const wrapper = mount(FilterOptions, {
            propsData: {
                value: ['normaltext']
            },
            stubs: {
                'b-modal': modalStub()
            }
        })

        chai.expect(wrapper.html()).to.contain("1 filters", "Should show message")
        wrapper.find("button").trigger("click")
        
        await Vue.nextTick();

        let html1 = wrapper.html()
        chai.expect(wrapper.contains("input[type='text']")).to.not.equal(true, "Should not open input")

        chai.expect(wrapper.contains('.badge.badge-info')).to.equal(true, "The badge is of Text")
        chai.expect(html1).to.contain('Text', "Text text should be present in badge")

        chai.expect(html1).to.contain('normaltext', "Array content")

        wrapper.find("a.remove").trigger("click")

        await Vue.nextTick();
        await wrapper.vm.$forceUpdate()

        let html2 = wrapper.html()

        chai.expect(wrapper.emittedByOrder()[0].args[0]).to.be.empty
        chai.expect(html2).to.not.contain('>Text<', "Text text should not be present in badge")
        chai.expect(html2).to.not.contain('normaltext', "Array content")
        chai.expect(html2).to.contain("No filters", "Should show message")
    })

    it("Should edit data", async function () {
        this.timeout(5000); // Some html checks makes the test slow
        const wrapper = mount(FilterOptions, {
            propsData: {
                value: ['normaltext']
            },
            stubs: {
                'b-modal': modalStub()
            }
        })

        wrapper.find("button").trigger("click")
        
        await Vue.nextTick();

        wrapper.find("a.edit").trigger("click")

        await Vue.nextTick();
        await wrapper.vm.$forceUpdate()

        chai.expect(wrapper.contains("input[type='text']")).to.equal(true, "Should open input")

        wrapper.find("input[type='text']").setValue("@usernamed")
        wrapper.find("input[type='text']").trigger("keypress")

        await Vue.nextTick();

        wrapper.find("i.fa-save").trigger("click")

        await Vue.nextTick();

        chai.expect(wrapper.emittedByOrder()).to.be.lengthOf(1, "Should emit 1 input event")
        chai.expect(wrapper.emittedByOrder()[0].args[0]).to.deep.equal(['@usernamed', ''])

        chai.expect(wrapper.contains('.badge.badge-primary')).to.equal(true, "The badge is of Person")
        chai.expect(wrapper.html()).to.contain('Person', "Person text should be present in badge")
    })
})