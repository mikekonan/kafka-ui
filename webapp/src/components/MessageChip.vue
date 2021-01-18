<template>
  <div class="message-chip">
    <a>
      <div
        @click="copyName"
        :style="`background-color: ${colors[color]}`"
        class="message-chip-key"
      >
        {{ name }}
      </div>
      <span class="message-chip-value" v-if="!!value" @click="copyValue">
        {{ value }}
      </span>
    </a>
  </div>
</template>

<script>
export default {
  props: {
    onTrash: Function,
    filterOnTrash: Boolean,
    name: String,
    value: String,
    color: String
  },
  data() {
    return {
      colors: {
        blue: "#215E87",
        dark: "#1E1E1E",
        green: "#003940"
      }
    };
  }
};
</script>

<style scoped>
.message-chip-key {
  display: inline-block;
  padding: 0 10px;
  margin-left: -10px;
  height: 20px;
  line-height: 20px;
  border-top-left-radius: 10px;
  border-bottom-left-radius: 10px;
  color: #fff;
}
.message-chip-value {
  color: #fff;
}

.message-chip {
  margin: 5px 0 0 5px;
  background-color: #6f6f6f;
  color: #fff;
  display: inline-block;
  padding: 0 10px;
  height: 20px;
  font-size: 13px;
  line-height: 20px;
  border-radius: 10px;
}
</style>
