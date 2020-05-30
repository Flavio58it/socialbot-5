<template>
    <div id="notificationsContainer">
        <i @click="toggleModal" class="fa fa-bell notifButton" />
        <div v-show="visible" id="notifications">
            <template v-if="notifications.length">
                <b-row 
                    v-for="notification in notifications" 
                    :key="notification.id" 
                    :class="['notification', notification.type]"
                >
                    <b-col cols="2">
                        <i :class="['fab', getNotifIcon(notification), 'fa-2x', 'icon']"/>
                    </b-col>
                    <b-col class="text-left details">
                        <div class="title">{{ parseMessages(notification).title }}</div>
                        <div class="message">{{ parseMessages(notification).message }}</div>
                    </b-col>
                </b-row>
            </template>
            <div v-else class="noNotifs">No notifications. Stay tuned!</div>
        </div>
    </div>
</template>

<style lang="scss" scoped>
    #notificationsContainer {
        position: relative;
    }
    
    #notifications {
        min-height: 50px;
        z-index: 2;
        overflow-x: hidden;
        overflow-y: auto;
        background: $background-color;
        border: 1px solid $font-color;
        border-radius: 2px;
        width: 600px;
        max-width: 100vw;

        -webkit-box-shadow: 0px 0px 19px -2px rgba(0,0,0,0.75);
        -moz-box-shadow: 0px 0px 19px -2px rgba(0,0,0,0.75);
        box-shadow: 0px 0px 19px -2px rgba(0,0,0,0.75);

        .noNotifs {
            text-align: center;
            line-height: 100px;
        }

        .notification {
            height: 40px;

            &.error {
                background-color: rgba(#F2DDA4, 0.6);
            }

            &.info {
                background-color: rgba(#A3C4BC, 0.6);
            }

            &.warn {
                background-color: rgba(#E7EFC5, 0.6);
            }

            .icon {
                line-height: 40px;
            }

            .details {
                line-height: 17px;

                .title {
                    font-weight: bold;
                }

                .message {
                    font-size: 12px;
                }
            }
        }
    }
    .notifButton {
        cursor: pointer;
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
            if (action === "notifications") {
                this.notifications = data
                console.log('[Notificator] List', this.notifications)
            }
        },
        mounted () {
            const button = this.$el.querySelector(".notifButton")
            const container = this.$el.querySelector("#notifications")

            this.popperInstance = createPopper(button, container, {
                placement: "top-end",
                modifiers: [
                    {
                        name: 'offset',
                        options: {
                            offset: [5, 20],
                        },
                    },
                ]
            })
        },
        beforeDestroy () {
            this.popperInstance.destroy()
            this.popperInstance = null
        },
        methods: {
            toggleModal () {
                this.visible = !this.visible
                this.$nextTick(() => {
                    this.popperInstance.forceUpdate()
                })
            },
            getNotifIcon (notification) {
                if (notification.plug && config.plugs[notification.plug])
                    return config.plugs[notification.plug].fontawesomeIcon
                else
                    return "fa-robot"
            },
            parseMessages (notification) {
                const data = notification.data.data || notification.data
                return {
                    title: data.id || data.description || data.message,
                    message: data.error || data.message ||  data.id
                }
            }
        }
    }
</script>