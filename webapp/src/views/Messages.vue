<template>
  <div class="messages-container">
    <div
      v-if="
        $store.getters.IS_REQUESTING || !$store.getters.MESSAGES.length === 0
      "
      class="overlay"
    />

    <hash-loader
      class="centered"
      color="#bada55"
      :loading="$store.getters.IS_REQUESTING"
      :size="80"
      :sizeUnit="px"
      style="z-index: 3"
    ></hash-loader>

    <div style="max-height: 100%; overflow: auto">
      <template v-if="!$store.getters.IS_REQUESTING">
        <div
          v-for="(message, index) in this.$store.getters.MESSAGES"
          :key="index"
        >
          <Message :message="message"></Message>
        </div>
      </template>
    </div>
  </div>
</template>

<script>
import Message from "@/components/Message.vue";

export default {
  methods: {},
  components: { Message }
};
</script>

<style scoped>
.messages-container {
  padding: 10px;
  position: relative;
  height: calc(100% - 140px);
  background-color: rgb(30, 30, 30);
  border-radius: 8px;
}

.overlay {
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background-color: rgba(0, 0, 0, 0.5);
  z-index: 2;
  cursor: pointer;
  border-radius: 8px;
}

.centered {
  -webkit-box-align: center;
  -webkit-box-pack: center;
  display: -webkit-box;
  margin: 0;
  position: absolute;
  top: 50%;
  left: 50%;
  -ms-transform: translate(-50%, -50%);
  transform: translate(-50%, -50%);
}
</style>
