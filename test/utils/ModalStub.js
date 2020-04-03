export default () => ({
    data () {
        return {
            shown: false
        }
    },
    methods: {
        show () {
            this.shown = true
        }
    },
    template:'<div v-if="shown"><slot></slot></div>'
})