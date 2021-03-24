import ViewUI from "view-design";
import locale from "view-design/dist/locale/en-US";
import "./assets/style.less";

import Vue from "vue";

import App from "./App.vue";
import router from "./router";
import store from "./store";

import VueNativeSock from "vue-native-websocket";

Vue.use(VueNativeSock, `${window.location.protocol == "https:" ? "wss": "ws"}://${window.location.hostname}/ws`, {
  store: store,
  format: "json",
});

import VueClipboard from "vue-clipboard2";
Vue.use(VueClipboard);

import VueRamda from "vue-ramda";
Vue.use(VueRamda);

import { VueSpinners } from "@saeris/vue-spinners";
Vue.use(VueSpinners);

import { PrismEditor } from "vue-prism-editor";
import "vue-prism-editor/dist/prismeditor.min.css";
Vue.component("PrismEditor", PrismEditor);

Vue.config.productionTip = false;

Vue.use(ViewUI, { locale });

new Vue({
  router,
  store,
  render: function(h) {
    return h(App);
  },
}).$mount("#app");
