<template>
  <div class="buttons-container">
    <div style="width: 50px; height: 150px; position: relative">
      <Button
        style="margin-left: 10px; margin-top: 10px; width: 120px"
        type="primary"
        shape="circle"
        icon="ios-settings"
        >Options</Button
      >

      <Button
        style="margin-left: 10px; margin-top: 5px; width: 120px"
        type="primary"
        shape="circle"
      >
        <Icon type="ios-mail-outline" />
        Send
      </Button>

      <Button
        style="margin-left: 10px; margin-top: 5px; width: 120px"
        type="primary"
        shape="circle"
        icon="ios-search"
        :disabled="$store.getters.TOPIC == '' || $store.getters.IS_REQUESTING"
        @click="request"
        >Search</Button
      >
    </div>
  </div>
</template>

<script>
export default {
  methods: {
    request: function () {
      this.$store.dispatch("request");
    }
  }
};
</script>

<style scoped>
.buttons-container {
  width: 140px;
  height: 125px;
  position: relative;
  border-radius: 8px;
  background-color: rgb(30, 30, 30);
}
</style>

