<template>
  <div class="applied-filters-container">
    <div v-for="(filter, index) in this.$store.getters.FILTERS" :key="index">
      <FilterChip :key="index" :filter="filter" />
    </div>
  </div>
</template>

<script>
import FilterChip from "@/components/FilterChip.vue";

export default {
  methods: {},
  watch: {},
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