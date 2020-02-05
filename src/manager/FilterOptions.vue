<template>
	<div id="main" class="row">
		<div v-if="value && value.length" class="col-8">
			{{value.length}} filters
		</div>
		<div v-else class="col-8">
			No filters
		</div>
		<div class="clear"></div>
		<div class="col-4">
			<b-button @click="addEditModal" variant="primary" block>Edit</b-button>
		</div>
		<b-modal id="modalFilters" ref="modalFilters" title="Add/Edit comment filters" :ok-only="true" @hide="cleanArray" @show="editIndex = false">
			<div class="content">
				Text will be counted as lowercase. The spaces cannot be used!
			</div>
			<hr/>
			<div v-if="value.length">
				<div v-for="(option, i) in value" :key="i">
					<div v-if="editIndex !== false && editIndex == i" class="row filterrow">
						<div class="col-2 text-center">
							<b-badge v-if="variantCreator(option)" :variant="variantCreator(option).badge">{{variantCreator(option).text}}</b-badge>
						</div>
						<div class="col-7">
							<b-form-input
								v-model="value[i]"
								@keyup.enter.stop="saveEl"
								@keyup.space.prevent.stop="saveEl"
							/>
						</div>
						<div class="col-3 align-left">
							<i @click.prevent.stop="saveEl" class="fa fa-save"/>
							<template v-if="(value[i] != '' && i == (value.length-1)) || (i != (value.length-1))">
								<i @click.prevent.stop="closeEditEl(i)" class="fa fa-remove"/>
								<i @click.prevent.stop="remEl(i)" class="fa fa-trash"/>
							</template>
						</div>
					</div>
					<div v-else class="editable tags row filterrow">
						<div class="col-2 text-center">
							<b-badge :variant="variantCreator(option).badge">{{variantCreator(option).text}}</b-badge>
						</div>
						<div class="col-7">
							<b class="tag">{{option}}</b>
						</div>
						<div class="col-3">
							<a href="#" @click.prevent="editEl(i)">Edit</a> <a href="#" @click.prevent="remEl(i)" class="remove">Remove</a>
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
	.filterrow {
		line-height: 40px;
	}
	.fa-remove {
		padding: 5px;
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
		props: {
			value: {
				type: Array,
				retuired: true
			}
		},
		data () {
			return {
				editIndex: false,
				oldValue: false
			}
		},
		methods: {
			addEditModal () {
				this.$refs.modalFilters.show()
			},
			saveEl () {
				this.editIndex = false
				this.cleanArray();
				this.$emit("input", this.value);
				this.newEntry();
			},
			cleanArray () {
				var tt = this;
				this.value.forEach(function(filter, i) {
					if (!filter)
						tt.value.splice(i, 1);
					else
						filter = filter.trim();
				})
			},
			remEl (i) {
				var newArray = this.value;
				newArray.splice(i, 1);
				this.$emit("input", newArray);
				this.editIndex = false;
			},
			updateValue (index, value) {
				var newArray = this.value;
				newArray[index] = value;
				this.$emit("input", newArray);
			},
			editEl (index) {
				this.cleanArray();
				this.editIndex = index;
				this.oldValue = this.value[index]
			},
			closeEditEl () {
				if (this.oldValue)
					this.updateValue(this.editIndex, this.oldValue);
				else
					this.updateValue(this.editIndex, ""); // When no old value is provided just use an empty one, so cleanArray can dispose of the row
				this.editIndex = false;
				this.oldValue = false;
				this.cleanArray();
			},
			focusInput () {
				this.$nextTick(() => {// Wait a moment!
					this.$el.querySelector("input").focus();
				});
			},
			newEntry () {
				if (this.editIndex !== false)
					return;
				this.value.push("");
				this.editIndex = this.value.length - 1;
				this.focusInput()
			},
			variantCreator (opt) {
				if (!opt)
					return false;
				if (opt.indexOf("#") == 0)
					return {
						badge: "success",
						text: "Hashtag"
					}
				if (opt.indexOf("@") == 0)
					return {
						badge: "primary",
						text: "Person"
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