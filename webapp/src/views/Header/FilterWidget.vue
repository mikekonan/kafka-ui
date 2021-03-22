<template>
  <div
    style="background-color: rgb(30, 30, 30); border-radius: 8px; width: 520px"
  >
    <div style="padding: 10px">
      <Select
        placeholder="Topic"
        :value="$store.getters.TOPIC"
        @on-change="onTopicChange"
        size="small"
        filterable
      >
        <Option
          v-for="topic in this.$store.getters.TOPICS"
          :value="topic"
          :key="topic"
          >{{ topic }}</Option
        >
      </Select>

      <div style="padding-top: 10px">
        <Input
          style="width: 155px"
          size="small"
          v-model="field"
          placeholder="Field"
          clearable
        />

        <Dropdown
          @on-click="onoperatorSelect"
          trigger="click"
          style="padding-left: 5px"
        >
          <Button style="width: 40px" size="small">{{ this.operator }}</Button>
          <DropdownMenu slot="list">
            <DropdownItem
              v-for="operatorItem in operators"
              :name="operatorItem"
              :key="operatorItem"
              >{{ operatorItem }}
            </DropdownItem>
          </DropdownMenu>
        </Dropdown>

        <Input
          placeholder="Value"
          clearable
          v-model="value"
          @click="add"
          size="small"
          style="width: 300px; padding-left: 5px"
        />

        <br />
        <div style="padding-left: 425px; padding-top: 15px">
          <Button @click="add" :disabled="field == '' || value == ''">
            <Icon type="ios-add-circle-outline" /> Add
          </Button>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
export default {
  methods: {
    onoperatorSelect: function (value) {
      this.operator = value;
    },
    onTopicChange: function (value) {
      this.$store.commit("SET_TOPIC", value);
    },
    add: function () {
      this.$store.commit("ADD_FILTER", {
        parameter: this.field,
        operator: this.operator,
        value: this.value
      });
    }
  },
  data() {
    return {
      operators: [">", "<", "<=", ">=", "="],
      operator: "=",
      field: "",
      value: ""
    };
  }
};
</script>