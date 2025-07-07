
<template>
  <v-container>
    <v-toolbar flat color="white">
      <v-text-field
        v-model="search"
        append-icon="mdi-magnify"
        label="Search card names"
        single-line
        hide-details
        clearable
        class="mx-4"
        style="max-width: 400px;"
      />
    </v-toolbar>
    <v-row style="max-height: 80vh; overflow-y: auto;" @scroll.passive="onScroll" ref="scrollAreaRef">
      <CardItem
        v-for="card in visibleCards"
        :key="card.id"
        :card="card"
        @view-details="viewDetails"
      />
    </v-row>
    <v-row v-if="loading" justify="center" class="my-4">
      <v-progress-circular indeterminate color="primary" />
    </v-row>
    <CardDetail v-if="selectedCard" :card="selectedCard" @close="selectedCard = null" />
  </v-container>
</template>

<script setup lang="ts">
import { ref, onMounted, nextTick } from 'vue';
import CardItem from './CardItem.vue';
import CardDetail from './CardDetail.vue';



const cards = ref([]);
const visibleCards = ref<any[]>([]);
const selectedCard = ref(null);
const loading = ref(false);
const batchSize = 50;
let currentIndex = 0;
const scrollAreaRef = ref<HTMLElement | null>(null);
const search = ref('');

function viewDetails(card: any) {
  selectedCard.value = card;
}


function getFilteredCards() {
  const s = search.value.toLowerCase();
  if (!s) return cards.value;
  return cards.value.filter(card => card.name?.toLowerCase().includes(s));
}

async function loadMoreCards(reset = false) {
  if (loading.value) return;
  loading.value = true;
  await nextTick();
  if (reset) {
    visibleCards.value = [];
    currentIndex = 0;
  }
  const filtered = getFilteredCards();
  const nextBatch = filtered.slice(currentIndex, currentIndex + batchSize);
  visibleCards.value.push(...nextBatch);
  currentIndex += batchSize;
  loading.value = false;
}


function onScroll(e: Event) {
  const target = e.target as HTMLElement;
  if (target.scrollTop + target.clientHeight >= target.scrollHeight - 100) {
    if (visibleCards.value.length < cards.value.length) {
      loadMoreCards();
    }
  }
}


import { watch } from 'vue';

onMounted(async () => {
  const response = await fetch('/src/assets/scryfall_data_merged.json');
  cards.value = await response.json();
  loadMoreCards(true);
});

watch(search, () => {
  loadMoreCards(true);
});
</script>
