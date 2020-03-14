<template>
    <b-row>
        <b-col>
            <b-form-checkbox v-model="data.settings.enabled">
                <b>Bot enabled</b>
                <div class="description">Enable the bot</div>
            </b-form-checkbox>
        </b-col>
        <b-col class="showStatus">
            Status: <i :class="{'fa':true, 'fa-thumbs-up': data.running, 'fa-thumbs-down': !data.running}"/>
        </b-col>
    </b-row>
</template>

<style lang="scss" scoped>
    .showStatus {
		line-height: 40px;
		text-align: right;
		
		i {
			color: $blue;
		}
	}
</style>

<script>
    export default {
        props: ['data']
    }
</script>