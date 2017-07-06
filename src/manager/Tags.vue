<template>
	<div>
		<div v-for="(tag, i) in list" class="row">
			<div class="col">#{{tag}}</div>
			<div class="col text-right">
				<i @click="removeTag(i)" class="fa fa-close point"></i>
			</div>
		</div>
		<div v-if="!value.length">No tags</div>
		<hr/>
		<div class="form-inline">
			<b-form-input 
				v-model="text"
				type="text"
				class="mb-2 mr-sm-2"
				placeholder="Enter tag"
				:state="state"
				:formatter="onlyTag"
				@keyup.enter="saveTag"
			/>
			<button @click="saveTag" class="btn mb-2">+</button>
		</div>
	</div>
</template>

<style scoped lang="scss">
	.point {cursor: pointer;}
</style>

<script>
	export default {
		props: ["value"],
		data () {
			return {
				text: "",
				list: this.value,
				state: "success"
			}
		},
		methods: {
			saveTag () {
				if (this.text == "") {
					this.state = "error";
					return;
				}
				this.list.push(this.text);
				this.text = "";
				this.$emit("input", this.list);
				this.state = "success";
			},
			removeTag (i) {
				this.list.splice(i, 1);
				this.$emit("input", this.list);
			},
			onlyTag (text) {
				return text.replace(/#/, "").replace(/(.+)\s.+/, "$1").toLowerCase();
			}
		}
	}
</script>