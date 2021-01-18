import ViewUI from "view-design";
import locale from "view-design/dist/locale/en-US";
import "./assets/style.less";

import Vue from "vue";

import App from "./App.vue";
import router from "./router";
import store from "./store";

Vue.config.productionTip = false;

Vue.use(ViewUI, { locale });

new Vue({
  router,
  store,
  render: function(h) {
    return h(App);
  }
}).$mount("#app");
