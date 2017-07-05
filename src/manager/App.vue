<template>
  <div id = "app">
    <Head/>
    <router-view />
  </div>
</template>

<style lang="scss">
  #player {
    font-family: 'Avenir', Helvetica, Arial, FontAwesome, sans-serif!important;
    -webkit-font-smoothing: antialiased;
    -moz-osx-font-smoothing: grayscale;
    color: $font_color;
    background-color: $background-color;
  }
</style>

<script>
  import Head from "components/Head.vue";

  export default {
    data () {
      return {

      }
    },
    mounted () {
      this.$send("init");
    },
    message (action, data){

    },
    methods: {

    },
    components: {
      Head
    }
  }
</script>