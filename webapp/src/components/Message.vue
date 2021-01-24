<template>
  <div class="message-container">
    <div class="message-header-container">
      <a v-for="(value, key) in headers" :key="key">
        <MessageChip :name="key" :value="value" color="blue" />
      </a>
      <a v-for="(value, key) in this.message.headers" :key="key">
        <MessageChip :name="key" :value="value" color="green" />
      </a>
    </div>

    <template v-if="message && message.payload">
      <div class="message-divider" />

      <div class="message-payload-container">
        <Button
          @click="copyPayload"
          size="small"
          style="display: inline-block; margin-right: 5px; float: right"
        >
          <Icon shape="circle" type="ios-copy" />
        </Button>

        <Button
          @click="swapCollapsed"
          size="small"
          style="display: inline-block; float: right"
        >
          <Icon v-if="collapsed" shape="circle" type="ios-arrow-dropdown" />
          <Icon v-if="!collapsed" shape="circle" type="ios-arrow-dropup" />
        </Button>

        <div v-if="collapsed" class="message-payload-container-collapsed">
          <prism-editor
            v-model="payload"
            :highlight="highlighter"
            readonly="true"
          ></prism-editor>
        </div>

        <div v-if="!collapsed" class="message-payload-container-expanded">
          <prism-editor
            v-model="payloadFormatted"
            :highlight="highlighter"
            readonly="true"
          ></prism-editor>
        </div>
      </div>
    </template>
  </div>
</template>

<script>
import MessageChip from "./MessageChip.vue";

import { highlight, languages } from "prismjs/components/prism-core";
import "prismjs/components/prism-clike";
import "prismjs/components/prism-json";
import "prismjs/themes/prism-tomorrow.css";

export default {
  methods: {
    highlighter(code) {
      return highlight(code, languages.json);
    },
    swapCollapsed() {
      this.collapsed = !this.collapsed;
    },
    copyPayload() {
      if (!this.collapsed) {
        this.$copyText(this.payloadFormatted).catch((err) =>
          console.error(err)
        );

        return;
      }

      this.$copyText(this.payload).catch((err) => console.error(err));
    }
  },
  data() {
    return {
      collapsed: true
    };
  },
  components: { MessageChip },
  computed: {
    payloadFormatted: function () {
      return JSON.stringify(this.message.payload, null, 2);
    },
    payload: function () {
      return JSON.stringify(this.message.payload);
    },
    headers: function () {
      let keys = Object.keys(this.message).filter(
        (k) => k !== "payload" && k !== "headers"
      );

      return this.$R.pick(keys, this.message);
    }
  },
  props: {
    message: Object
  }
};
</script>

<style>
.message-container {
  min-height: 30px;
  border: 1px solid rgb(30, 30, 30);
  border-radius: 16px;
  background-color: rgb(50, 50, 50);
  margin-bottom: 10px;
  margin-left: 0px;
  margin-right: 10px;
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
  -webkit-line-clamp: 1;
  -webkit-box-orient: vertical;
  overflow: hidden;
  white-space: nowrap;
  text-overflow: ellipsis;
  margin-left: 5px;
  max-width: calc(100% - 75px);
}

.message-payload-container-expanded {
  margin-left: 5px;
  margin-left: 10px;
  max-width: calc(100% - 75px);
}

.message-divider {
  border-bottom: 1px solid #6f6f6f;
}
</style>