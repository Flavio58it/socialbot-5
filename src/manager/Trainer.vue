<template>
	<div class="container">
		<h3 v-if="plug">Trainer for {{plug}}</h3>
		<template v-if="!exported">
			<div v-if="trainImages" id="aitrainer" class="row">
	          <hr/>
	          <div v-for="(image, i) in trainImages" :class="['col-2', 'image']">
	            <img :src="image.src">
	            <div class="container">
		            <div class="row">
			            <input v-model="image.output[0]" class="col"></input>
			            <input v-model="image.output[1]" class="col"></input>
			        </div>
			        <div class="row">
			            <input v-model="image.output[2]" class="col"></input>
			            <input v-model="image.output[3]" class="col"></input>
			        </div>
			    </div>
	          </div>
	          <hr/>
	          <a href="#" @click.prevent="save" class="button apply">Export</a>
	      </div>
      	  <Loading v-else/>
      </template>
      <textarea v-if="exported" v-model="exported" cols="30" rows="10" class="col-12" :readonly="true"></textarea>
	</div>
</template>

<style lang="scss" scoped>
	.image {
		//min-height: 200px;
		padding: 15px;

		img {
			cursor: pointer;
			width: 100%;
			height: 70%;
		}
	}
</style>

<script>
	import Loading from "components/Loading.vue";

	export default {
		data () {
			return {
				plug: false,
				trainImages: false,
				exported: false
			}
		},
		mounted () {
			this.$send('sendAll', {forwardAction: 'getImages', data: {plug: 'instagram'}});
		},
		message (action, data){
	      if (action == "moderateImages") {
	        this.trainImages = data.arr;
	        this.plug = data.plug;
	      }
	    },
	    methods: {
	    	save () {
	    		this.trainImages.forEach((images) => {
	    			delete images.src;
	    		})
	    		this.exported = JSON.stringify(this.trainImages)
	    	}
	    },
		components: {
			Loading
		}
	}
</script>