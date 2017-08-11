<template>
	<div v-if="errorData" id="backendError" class="row">
		<div class="col">
			<div class="head">
				Error from {{errorData.plug}} bot
			</div>
			<div class="description">
				<div class="detail">
					Code: {{errorData.data.id}}
				</div>
				<div class="detail">
					Description: {{errorData.data.error}}
				</div>
			</div>
		</div>
	</div>
</template>

<style lang="scss" scoped>
	.col {padding:0;} 
	.head {
		background-color: $background-color-darker;
		color: $font-color-error;
		padding: 10px;
	}
	.description {
		color: $font-color-error;
		padding: 10px;
		background-color: $background-color-error;

		.detail {
			font-size: $font-small;
		}
	}
</style>

<script>
	export default {
		data () {
			return {
				errorData: false
			}
		},
		message (action, data) {
			if (action == "backendError") {
				if (!data.remove)
					this.errorData = data.error
				else
					this.errorData = false
			}
		}
	}
</script>