import { ref } from 'vue';

export function useFilterLogic() {
  const selectedSets = ref<string[]>([]);
  const selectedColors = ref<string[]>([]);

  function toggleColorSelection(color: string) {
    const idx = selectedColors.value.indexOf(color);
    if (idx === -1) {
      selectedColors.value.push(color);
    } else {
      selectedColors.value.splice(idx, 1);
    }
  }

  function clearColorSelection() {
    selectedColors.value = [];
  }

  function toggleSetSelection(set: string) {
    const idx = selectedSets.value.indexOf(set);
    if (idx === -1) {
      selectedSets.value.push(set);
    } else {
      selectedSets.value.splice(idx, 1);
    }
  }

  function clearSetSelection() {
    selectedSets.value = [];
  }

  return {
    selectedSets,
    selectedColors,
    toggleColorSelection,
    clearColorSelection,
    toggleSetSelection,
    clearSetSelection,
  };
}
