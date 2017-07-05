<template>
  <div id = "app">
    <a :href="links.settings" target="_blank">Settings</a>
  </div>
</template>

<style lang="scss">
  #app {
    font-family: 'Avenir', Helvetica, Arial, FontAwesome, sans-serif!important;
    -webkit-font-smoothing: antialiased;
    -moz-osx-font-smoothing: grayscale;
    color: $font_color;
    background-color: $background-color;
  }
</style>

<script>

  export default {
    data () {
      return {
        links: {
          settings: chrome.extension.getURL('/pages/manager.html#/settings/')
        }
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
      
    }
  }
</script>