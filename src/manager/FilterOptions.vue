<template>
	<div id="main" class="row">
		<div v-if="value && value.length" class="col-9">
			{{value.length}} filters
		</div>
		<div v-else class="col-9">
			No filters
		</div>
		<div class="clear"></div>
		<div class="col-3">
			<i @click="addEditModal" class="fa fa-gear fa-2x"/>
		</div>
		<b-modal id="modalFilters" ref="modalFilters" title="Add/Edit comment filters" :ok-only="true">
			<div class="content">
				Text will be counted as lowercase
			</div>
			<div v-if="value.length">
				<div v-for="(option, i) in value">
					<div v-if="editIndex !== false && editIndex == i" class="row">
						<div class="col-2 text-center">
							<b-badge :variant="variantCreator(option).badge">{{variantCreator(option).text}}</b-badge>
						</div>
						<div class="col-8">
							<b-form-input
								v-model="value[i]"
								@keyup.enter.stop="saveEl"
							/>
						</div>
						<div class="col-2 align-left"><i @click.prevent.stop="saveEl" class="fa fa-save"/><i @click.prevent.stop="remEl(i)" class="fa fa-remove"/></div>
					</div>
					<div v-else class="editable tags row">
						<div class="col-2">
							<b-badge :variant="variantCreator(option).badge">{{variantCreator(option).text}}</b-badge>
						</div>
						<div class="col-7">
							<b class="tag">{{option}}</b>
						</div>
						<div class="col-3">
							<a href="#" @click.prevent="editIndex = i">Edit</a> <a href="#" @click.prevent="remEl(i)" class="remove">Remove</a>
						</div>
					</div>
				</div>
			</div>
			<div v-else class="text-center">No entries</div>
			<button v-if="editIndex === false" @click="newEntry" class="btn btn-primary float-right">Add</button>
		</b-modal>
	</div>
</template>

<style lang="scss" scoped>
	#main {
		max-height: 50px;
		overflow: hidden;
		div {
			line-height: 40px;
		}
	} 
	.fa-remove {
		padding: 10px;
	}
	.remove {
		color: $font-color-error;
	}
	.tags {
		
		a {
			font-size: $font-mid;
		}
	}
	i, .editable {cursor: pointer;}
</style>

<script>
	export default {
		props: ["value"],
		data () {
			return {
				editIndex: false
			}
		},
		methods: {
			addEditModal () {
				this.$refs.modalFilters.show()
			},
			saveEl () {
				this.editIndex = false
				this.value.forEach(function(t, i) {
					if (!t)
						this.value.splice(i, 1);
				})
				this.$emit("input", this.value);
				this.newEntry();
			},
			remEl (i) {
				this.value.splice(i, 1);
			},
			newEntry () {
				if (this.editIndex !== false)
					return;
				this.value.push("");
				this.editIndex = this.value.length - 1;
			},
			variantCreator (opt) {
				if (opt.indexOf("#") == 0)
					return {
						badge: "success",
						text: "Hashtag"
					}
				else if(/^\/.+\/$/.test(opt))
					return {
						badge: "warning",
						text: "RegEx"
					}
				else
					return {
						badge: "info",
						text: "Text"
					}
			}
		}
	}
</script>