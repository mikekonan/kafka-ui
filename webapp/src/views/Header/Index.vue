<template>
  <div style="display: flex; flex-direction: row">
    <FilterWidget />
    <AppliedFiltersWidget
      style="
        margin-left: 10px;
        min-width: 600px;
        width: calc(100% - 520px - 150px);
      "
    >
    </AppliedFiltersWidget>
    <Buttons style="margin-left: 10px"></Buttons>
  </div>
</template>

<script>
import FilterWidget from "./FilterWidget.vue";
import AppliedFiltersWidget from "./AppliedFiltersWidget.vue";
import Buttons from "./Buttons.vue";

export default {
  components: {
    FilterWidget,
    AppliedFiltersWidget,
    Buttons
  }
};
</script>

<style scoped>
</style>
