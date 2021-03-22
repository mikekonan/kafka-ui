<template>
  <div style="background-color: rgb(70, 70, 70)" id="app">
    <router-view />
  </div>
</template>

<script>
export default {
  watch: {
    "$store.getters.IS_CONNECTED": function (isConnected) {
      if (isConnected) {
        this.$socket.sendObj({ request: "topics" });
      }
    }
  }
};
</script>

<style lang="less">
#app {
  font-family: Avenir, Helvetica, Arial, sans-serif;
  -webkit-font-smoothing: antialiased;
  -moz-osx-font-smoothing: grayscale;
}

html {
  background-color: rgb(70, 70, 70);
}
</style>
