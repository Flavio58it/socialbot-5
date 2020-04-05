<template>
    <div>
        <i @click="toggleModal" class="fa fa-bell notifButton" />
        <div v-show="visible" id="notifications">
            <template v-if="notifications.length">
                <b-row 
                    v-for="notification in notifications" 
                    :key="notification.id" 
                    :class="['notification', notification.type]"
                >
                    <b-col cols="2">
                        <i :class="['fa', getNotifIcon(notification), 'fa-2x']"/>
                    </b-col>
                    <b-col>
                        <b>{{notification.data.description || notification.data.message}}</b>
                        <p>{{notification.data.id}}</p>
                    </b-col>
                </b-row>
            </template>
            <div v-else class="noNotifs">No notifications. Stay tuned!</div>
        </div>
    </div>
</template>

<style lang="scss" scoped>
    #notifications {
        min-height: 50px;
        background: $background-color-darker;
        border: 1px solid $font-color;
        border-radius: 2px;

        -webkit-box-shadow: 0px 0px 19px -2px rgba(0,0,0,0.75);
        -moz-box-shadow: 0px 0px 19px -2px rgba(0,0,0,0.75);
        box-shadow: 0px 0px 19px -2px rgba(0,0,0,0.75);

        .noNotifs {
            text-align: center;
            padding-top: 25px;
        }
    }
</style>

<script>
    import { createPopper } from "@popperjs/core"
    import config from "../../config"
    import moment from "moment"

    export default {
        data () {
            return {
                notifications: [],
                visible: false,
                popperInstance: false
            }
        },
        message (action, data) {
            if (action === "notifications")
                this.notifications = data
        },
        mounted () {
            const button = this.$el.querySelector(".notifButton")
            const container = this.$el.querySelector("#notifications")

            this.popperInstance = createPopper(button, container, {
                placement: "top-end"
            })
        },
        beforeDestroy () {
            this.popperInstance.destroy()
            this.popperInstance = null
        },
        methods: {
            toggleModal () {
                this.visible = !this.visible
            },
            getNotifIcon (notification) {
                if (notification.plug && config.plugs[notification.plug])
                    return config.plugs[notification.plug].fontawesomeIcon
                else
                    return "fa-robot"
            }
        }
    }
</script>