<template>
  <div class="message-container">
    <div class="message-header-container">
      <MessageChip name="name" value="value" color="blue"></MessageChip>
      <MessageChip name="name" value="value" color="green"></MessageChip>
      <MessageChip name="name" value="value" color="green"></MessageChip>
      <MessageChip name="name" value="value" color="green"></MessageChip>
      <MessageChip name="name" value="value" color="green"></MessageChip>
      <MessageChip name="name" value="value" color="green"></MessageChip>
      <MessageChip name="name" value="value" color="green"></MessageChip>
      <MessageChip name="name" value="value" color="green"></MessageChip>
      <MessageChip name="name" value="value" color="green"></MessageChip>
      <MessageChip name="name" value="value" color="green"></MessageChip>
      <MessageChip name="name" value="value" color="green"></MessageChip>
      <MessageChip name="name" value="value" color="green"></MessageChip>
      <MessageChip name="name" value="value" color="green"></MessageChip>
      <MessageChip name="name" value="value" color="green"></MessageChip>
      <MessageChip name="name" value="value" color="green"></MessageChip>
      <MessageChip name="name" value="value" color="green"></MessageChip>
      <MessageChip name="name" value="value" color="green"></MessageChip>
      <MessageChip name="name" value="value" color="green"></MessageChip>
      <MessageChip name="name" value="value" color="green"></MessageChip>
      <MessageChip name="name" value="value" color="green"></MessageChip>
      <MessageChip name="name" value="value" color="green"></MessageChip>
      <MessageChip name="name" value="value" color="green"></MessageChip>
      <MessageChip name="name" value="value" color="green"></MessageChip>
      <MessageChip name="name" value="value" color="green"></MessageChip>
      <MessageChip name="name" value="value" color="green"></MessageChip>
      <MessageChip name="name" value="value" color="green"></MessageChip>
      <MessageChip name="name" value="value" color="green"></MessageChip>
    </div>

    <template v-if="message && message.payload">
      <div class="message-divider" />

      <div class="message-payload-container">
        <div class="message-payload-container-collapsed">
          {{ JSON.stringify(message.payload) }}
        </div>
      </div>

      <Button size="small" style="margin-top: -30px; float: right"
        >Prettify</Button
      >
    </template>
  </div>
</template>

<script>
import MessageChip from "./MessageChip.vue";

export default {
  components: { MessageChip },
  props: {
    message: Object
  }
};
</script>

<style scoped>
.message-container {
  min-height: 30px;
  border: 1px solid #1d3557;
  border-radius: 16px;
  background-color: rgb(70, 70, 70);
}

.message-header-container {
  min-height: 30px;
  padding-bottom: 10px;
}

.message-payload-container {
  min-height: 20px;
  padding-left: 5px;
  padding-bottom: 5px;
  padding-top: 5px;
}

.message-payload-container-collapsed {
  display: -webkit-box;
  -webkit-line-clamp: 1;
  -webkit-box-orient: vertical;
  overflow: hidden;
}

.message-divider {
  border-bottom: 1px solid #6f6f6f;
}
</style>