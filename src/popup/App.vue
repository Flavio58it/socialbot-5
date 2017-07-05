<template>
  <div>
    <div v-if="tabStatus == 'connected'" id="player" :class="[menuBar?'':'bigger']">
        <Controller @buttonClick="action" :status="playerStatus?playerStatus:undefined"/>
        <TabBar v-if="menuBar"/>
    </div>
    <div v-else-if="tabStatus == 'connecting'" id="connectingPlayer">
      <p>Connecting</p>
      <i class="fa fa-circle-o-notch fa-spin fa-3x"></i>
    </div>
    <div v-else id="errorPlayer">
      <p>Cannot connect</p>
      <div>Please open a <a href="http://open.spotify.com/" target="_blank">spotify tab</a></div>
      <div>or</div>
      <div>reload the player page</div>
    </div>
  </div>
</template>

<style lang="scss">
  #player {
    overflow: hidden;
    font-family: 'Avenir', Helvetica, Arial, FontAwesome, sans-serif!important;
    -webkit-font-smoothing: antialiased;
    -moz-osx-font-smoothing: grayscale;
    text-align: center;
    color: $font_color;
    background-color: $background-color; //TODO: If you remove this the layout is automatically clear. Implement it as separate theme

    &.bigger {
      padding: 15px;
    }
  }
  #connectingPlayer {
    @extend #player;
    padding: $default_padding;
    padding-bottom: 25px;
    text-align: center;

    color: $font_color;
  }
  #errorPlayer {
    @extend #player;
    padding: $default_padding;
    padding-bottom: 25px;
    text-align:center;

    p {
      color: $font_color_error;
      font-weight: bold;
    }
    a {color: $font_color;}
  }
</style>

<script>
  import Controller from "./Controller.vue";
  import TabBar from "./TabBar.vue";

  var resize = false;

  export default {
    data: function(){
      return {
        tabStatus: "connecting", // Manage the visuals of connection status
        playerStatus: false,     // Data container for the player status
        menuBar: true            // Show or hide the bottom bar
      }
    },
    mounted () {
      var t = this;
      document.body.style.width = "350px";

      this.$send("init", {});
      setTimeout(function(){ // Show error if is not responding
        if (t.tabStatus == "connecting")
          t.tabStatus = "error";
      }, 3000)
      if (location.href.indexOf("?ext_interfaceDetached=true") > 0){ // Disable the menu bar if is the popup page
        this.menuBar = false;
        resize = true;
      }
    },
    beforeDestroy (){
      this.$send("stopListener", {});
    },
    message (action, data){
      console.log("Action: ", action);
      if (action == "updatePlayer") {
        this.playerStatus = data.status;
        this.tabStatus = "connected";
        if (resize) {
          this.$nextTick(() => {
            window.resizeTo(this.$el.clientWidth + 2, this.$el.clientHeight + 25);
            resize = false;
          })
        }
      }
    },
    methods: {
      action (type) {
        this.$send("playerAction", {actionName: type});
      }
    },
    components: {
      Controller,
      TabBar
    }
  }
</script>