<template>
  <div class="applied-filters-container">
    <FilterChip
      :operand="this.operand"
      filterKey="id"
      value="18e118fe-002b-4e1f-b061-56258cd937b0"
    ></FilterChip>
  </div>
</template>

<script>
import FilterChip from "@/components/FilterChip.vue";

export default {
  components: { FilterChip }
};
</script>

<style scoped>
.applied-filters-container {
  height: 125px;
  position: relative;
  border-radius: 8px;
  background-color: rgb(30, 30, 30);
}
</style>