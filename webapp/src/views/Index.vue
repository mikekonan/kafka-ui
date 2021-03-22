<template>
  <div>
    <div class="container">
      <Header></Header>
      <Messages style="top: 10px"></Messages>
    </div>
  </div>
</template>

<script>
import Header from "./Header/Index.vue";
import Messages from "./Messages.vue";

export default {
  components: { Header, Messages }
};
</script>

<style scoped>
.container {
  position: relative;
  height: 98vh;
  width: 98vw;
  margin-top: 1vh;
  margin-bottom: 1vh;
  margin-left: 1vw;
  margin-right: 1vw;
}
</style>
