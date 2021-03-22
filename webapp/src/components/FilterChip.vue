<template>
  <a>
    <Dropdown
      @on-click="onItemSelected"
      style="padding-top: 5px"
      trigger="contextMenu"
    >
      <div class="filter-chip">
        <div class="filter-chip-key">{{ filter.parameter }}</div>

        <div class="filter-chip-operator">{{ filter.operator }}</div>

        <span class="filter-chip-value">
          {{ filter.value }}
        </span>
      </div>

      <DropdownMenu slot="list">
        <DropdownItem name="delete">Delete</DropdownItem>
      </DropdownMenu>
    </Dropdown>
  </a>
</template>

<script>
export default {
  props: {
    filter: Object
  },
  methods: {
    onItemSelected(name) {
      if (name === "delete") {
        this.$store.commit("REMOVE_FILTER", this.filter);
      }
    }
  }
};
</script>

<style scoped>
.filter-chip-key {
  display: inline-block;
  padding-right: 5px;
  padding-left: 5px;
  height: 24px;
  line-height: 24px;
  border-top-left-radius: 8px;
  border-bottom-left-radius: 8px;
  color: #fff;
  background-color: rgb(70, 70, 70);
}

.filter-chip-operator {
  display: inline-block;
  padding: 0 5px;
  height: 24px;
  line-height: 24px;
  color: #fff;
  background-color: rgb(33, 94, 135);
}

.filter-chip-value {
  padding-right: 5px;
  color: #fff;
}

.filter-chip {
  margin: 5px 0 0 5px;
  background-color: rgb(70, 70, 70);
  color: #fff;
  display: inline-block;
  height: 24px;
  font-size: 12px;
  line-height: 24px;
  border-radius: 8px;
}
</style>