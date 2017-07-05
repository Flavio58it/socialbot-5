import Vue from 'vue'

import BootstrapVue from 'bootstrap-vue';
import 'bootstrap/dist/css/bootstrap.css'
import 'bootstrap-vue/dist/bootstrap-vue.css'

import App from './App.vue'
import frontComm from "comm/frontComm";

// This functionality insert into Vue the ability to send and receive directly messages from backend.
Vue.use(frontComm, {name: "manager", debug: false});
// Use bootstrap
Vue.use(BootstrapVue);

new Vue({
  el: '#app',
  render: h => h(App)
})
