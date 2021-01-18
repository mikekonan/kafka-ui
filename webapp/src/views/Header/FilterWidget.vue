<template>
  <div
    style="background-color: rgb(30, 30, 30); border-radius: 8px; width: 520px"
  >
    <div style="padding: 10px">
      <Select placeholder="Topic" v-model="topic" size="small" filterable>
        <Option v-for="topic in topics" :value="topic" :key="topic">{{
          topic
        }}</Option>
      </Select>

      <div style="padding-top: 10px">
        <Input
          style="width: 155px"
          size="small"
          placeholder="Field"
          clearable
        />

        <Dropdown
          @on-click="onOperandSelect"
          trigger="click"
          style="padding-left: 5px"
        >
          <Button style="width: 40px" size="small">{{ this.operand }}</Button>
          <DropdownMenu slot="list">
            <DropdownItem
              v-for="operandItem in operands"
              :name="operandItem"
              :key="operandItem"
              >{{ operandItem }}
            </DropdownItem>
          </DropdownMenu>
        </Dropdown>

        <Input
          placeholder="Value"
          clearable
          size="small"
          style="width: 300px; padding-left: 5px"
        />

        <br />
        <div style="padding-left: 425px; padding-top: 15px">
          <Button> <Icon type="ios-add-circle-outline" /> Add </Button>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
export default {
  methods: {
    onOperandSelect: function (value) {
      this.operand = value;
    }
  },
  data() {
    return {
      topics: ["choreographer.create-user"],
      topic: "",
      operands: [">", "<", "<=", ">=", "=", "%"],
      operand: "="
    };
  }
};
</script>

<style lang="less" scoped>
</style>