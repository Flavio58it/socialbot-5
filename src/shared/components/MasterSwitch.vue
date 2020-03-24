<template>
    <div @click="updateStatus" :class="['btnContainer', stateClass]">
        <div :class="['button', stateClass]">
            Start
        </div>
    </div>
</template>

<style lang="scss" scoped>
    $mainColorSuccess: #4dde67;
    $mainColorStandby: #f3c473;
    $mainColorStopped: #c73627;
    $mainColorDisabled: #9d9d9d;

    @mixin statuses ($opacity) {
        transition: background-color 0.3s ease;
        &.running {
            background-color: rgba($mainColorDisabled, $opacity);
        }

        &.enabled {
            background-color: rgba($mainColorSuccess, $opacity);
        }

        &.standby {
            background-color: rgba($mainColorStandby, $opacity);
        }

        &.disabled {
            background-color: rgba($mainColorStopped, $opacity);
        }
    }

    .btnContainer {
        $size: 100px;
        width: $size;
        height: $size;
        border-radius: $size;
        margin: 30px auto;
        position: relative;
        text-align: center;
        line-height: $size;
        cursor: pointer;
        
        @include statuses(0.3);

        &:hover {
            @include statuses(0.5);
        }

        .button {
            @include statuses(0.7);
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