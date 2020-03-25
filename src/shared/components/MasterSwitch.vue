<template>
    <div @click="updateStatus" :class="['btnContainer', stateClass]" draggable="false">
        <div :class="['button', stateClass]" draggable="false">
            <template v-if="stateClass == 'disabled'">
                Start
            </template>
            <template v-else-if="stateClass == 'running'">
                Stop
            </template>
            <template v-else-if="stateClass == 'standby'">
                Stop
            </template>
            <template v-else>
                Unknown
            </template>
        </div>
    </div>
</template>

<style lang="scss" scoped>
    $mainColorSuccess: #4dde67;
    $mainColorStandby: #ff7b00;
    $mainColorStopped: #e03e2c;
    $mainColorDisabled: #9d9d9d;

    @mixin statuses ($opacity, $size) {
        $shadow: 0px 0px 15px 0px;

        width: $size;
        height: $size;
        border-radius: $size;

        transition: all 0.3s ease;

        &.running {
            background-color: rgba($mainColorDisabled, $opacity);
            box-shadow: $shadow rgba($mainColorDisabled, $opacity);
        }

        &.enabled {
            background-color: rgba($mainColorSuccess, $opacity);
            box-shadow: $shadow rgba($mainColorSuccess, $opacity);
        }

        &.standby {
            background-color: rgba($mainColorStandby, $opacity);
            box-shadow: $shadow rgba($mainColorStandby, $opacity);
        }

        &.disabled {
            background-color: rgba($mainColorStopped, $opacity);
            box-shadow: $shadow rgba($mainColorStopped, $opacity);
        }
    }

    .btnContainer {
        $size: 100px;
        $centerer: 0.15;

        margin: 30px auto;
        position: relative;
        text-align: center;
        cursor: pointer;
        user-select: none;
        line-height: $size;

        font-weight: bold;

        @include statuses(0.3, $size + 30);

        &:hover {
            @include statuses(0.5, $size + 30);
        }

        .button {
            z-index: 1;
            position: absolute;
            user-select: none;
            left: $size * $centerer;
            top: $size * $centerer;
            @include statuses(0.65, $size);
        }
    }
</style>

<script>
    export default {
        props: {
            value: {
                type: Boolean,
                default: false
            },
            running: {
                type: Boolean,
                default: false
            }
        },
        methods: {
            updateStatus () {
                this.$emit("input", !this.value);
            }
        },
        computed: {
            stateClass () {
                if (!this.running && this.value)
                    return "standby"
                if (this.running && this.value)
                    return "running"
                if (this.value)
                    return "enabled"
                return "disabled"
            }
        }
    }
</script>