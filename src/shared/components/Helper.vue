<template>
	<span>
		<i @click.prevent="showModal" class="fa fa-question-circle"/>

		<b-modal id="modalHelper" ref="modalHelper" :title="title" :ok-only="true">
			<slot/>
		</b-modal>
	</span>
</template>

<style scoped lang="scss">
	i {
		cursor: pointer;
	}
</style>

<style lang="scss">
	#modalHelper p {
		font-size: $font-mid;
		font-weight: normal;
	}
</style>

<script>
	export default {
		props: ["title"],
		methods: {
			showModal () {
				this.$refs.modalHelper.show();
			}
		}
	}
</script>