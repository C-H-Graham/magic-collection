
<template>
  <v-container fluid>
    <v-row>
      <v-navigation-drawer
        v-model="drawer"
        app
        width="250"
        clipped
        permanent
        class="pa-2"
        rail
        :expand-on-hover="true"
      >
        <v-list>
          <!-- Wishlist Group -->
          <v-list-group value="Wishlist" dense>
            <template v-slot:activator="{ props }">
              <v-list-item v-bind="props" title="Wishlist" prepend-icon="mdi-heart"></v-list-item>
            </template>
            <v-list-item v-if="wishlist.length === 0" disabled>
              <v-list-item-title>No cards in wishlist</v-list-item-title>
            </v-list-item>
            <v-list-item
              v-for="card in wishlist"
              :key="card.id"
              @click="viewDetails(card)"
            >
              <v-list-item-title>{{ card.name }}</v-list-item-title>
            </v-list-item>
          </v-list-group>

          <!-- Sets Group -->
          <v-list-group value="Sets" dense v-model:opened="open">
            <template v-slot:activator="{ props}">
              <v-list-item v-bind="props" title="Sets" prepend-icon="mdi-set-none"></v-list-item>
            </template>
      
            <v-list-item :active="selectedSets.length === 0" @click="clearSetSelection" title="All Sets"></v-list-item>
            <v-list-item
              v-for="set in sets"
              :key="set"
              :active="selectedSets.includes(set)"
              @click="toggleSetSelection(set)"
            >
              <v-list-item-title>{{ set }}</v-list-item-title>
              <template #append>
                <v-icon v-if="selectedSets.includes(set)">mdi-check</v-icon>
              </template>
            </v-list-item>
          </v-list-group>
        </v-list>
      </v-navigation-drawer>
      <v-col>
        <v-app-bar flat color="white" app style="z-index: 10;">
          <div style="display: flex; width: 100%; justify-content: center; align-items: center;">
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
            <v-select
              v-model="sortBy"
              :items="sortOptions"
              label="Sort by"
              class="mx-4"
              style="max-width: 200px;"
              hide-details
              dense
            />
            <v-btn icon @click="toggleSortOrder" :title="sortOrder === 'asc' ? 'Ascending' : 'Descending'">
              <v-icon>{{ sortOrder === 'asc' ? 'mdi-arrow-up' : 'mdi-arrow-down' }}</v-icon>
            </v-btn>
          </div>
        </v-app-bar>
        <v-row style="max-height: 80vh; overflow-y: auto;" @scroll.passive="onScroll" ref="scrollAreaRef">
          <CardItem
            v-for="card in visibleCards"
            :key="card.id"
            :card="card"
            @view-details="viewDetails"
            @add-to-wishlist="handleWishlist"
          />
        </v-row>
        <v-row v-if="loading" justify="center" class="my-4">
          <v-progress-circular indeterminate color="primary" />
        </v-row>
        <CardDetail v-if="selectedCard" :card="selectedCard" @close="selectedCard = null" @add-to-wishlist="handleWishlist" />
        <v-snackbar v-model="snackbar.show" :timeout="3500" color="success">
          {{ snackbar.message }}
          <template #actions>
            <v-btn color="white" text @click="snackbar.show = false">Close</v-btn>
          </template>
        </v-snackbar>
        <v-snackbar v-model="snackbarRemove.show" :timeout="3500" color="error">
          {{ snackbarRemove.message }}
          <template #actions>
            <v-btn color="white" text @click="snackbarRemove.show = false">Close</v-btn>
          </template>
        </v-snackbar>
      </v-col>
    </v-row>
  </v-container>
</template>



<script setup lang="ts">
import { ref, onMounted, nextTick } from 'vue';
import { useWishlistStore } from '../stores/wishlist';
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
const sortOptions = [
  { title: 'Name', value: 'name' },
  { title: 'Purchase Price', value: 'price' },
];
const sortBy = ref('name');
const sortOrder = ref<'asc' | 'desc'>('asc');
var open = "Sets"

// --- Navigation Drawer State ---
const drawer = ref(true);
const selectedSets = ref<string[]>([]);
const sets = ref<string[]>([]);

function toggleSetSelection(set: string) {
  const idx = selectedSets.value.indexOf(set);
  if (idx === -1) {
    selectedSets.value.push(set);
  } else {
    selectedSets.value.splice(idx, 1);
  }
  loadMoreCards(true);
}

function clearSetSelection() {
  selectedSets.value = [];
  loadMoreCards(true);
}

function toggleSortOrder() {
  sortOrder.value = sortOrder.value === 'asc' ? 'desc' : 'asc';
}

function viewDetails(card: any) {
  if (selectedCard.value && selectedCard.value.id === card.id) {
    selectedCard.value = null;
    // Wait for next tick to ensure dialog closes before reopening
    nextTick(() => {
      selectedCard.value = card;
    });
  } else {
    selectedCard.value = card;
  }
}

// --- Wishlist logic ---

const wishlistStore = useWishlistStore();
const wishlist = wishlistStore.wishlist;
const snackbar = ref({ show: false, message: '' });
const snackbarRemove = ref({ show: false, message: '' });

function handleWishlist(card: any) {
  if (!card.id) return;
  const inList = wishlist.find((c) => c.id === card.id);
  wishlistStore.toggle(card);
  if (!inList) {
    snackbar.value.message = `${card.name} added to wishlist. Estimated total: $${wishlistStore.total.toFixed(2)}`;
    snackbar.value.show = true;
  } else {
    snackbarRemove.value.message = `${card.name} removed from wishlist.`;
    snackbarRemove.value.show = true;
  }
}

function getFilteredCards() {
  const s = search.value.toLowerCase();
  let filtered = cards.value;
  if (selectedSets.value.length > 0) {
    filtered = filtered.filter(card => selectedSets.value.includes(card.set_name));
  }
  if (s) {
    filtered = filtered.filter(card => card.name?.toLowerCase().includes(s));
  }
  // Sorting
  filtered = [...filtered].sort((a, b) => {
    if (sortBy.value === 'name') {
      const nameA = a.name?.toLowerCase() || '';
      const nameB = b.name?.toLowerCase() || '';
      if (nameA < nameB) return sortOrder.value === 'asc' ? -1 : 1;
      if (nameA > nameB) return sortOrder.value === 'asc' ? 1 : -1;
      return 0;
    } else if (sortBy.value === 'price') {
      const priceA = parseFloat(a.prices?.usd) || 0;
      const priceB = parseFloat(b.prices?.usd) || 0;
      if (priceA < priceB) return sortOrder.value === 'asc' ? -1 : 1;
      if (priceA > priceB) return sortOrder.value === 'asc' ? 1 : -1;
      return 0;
    }
    return 0;
  });
  return filtered;
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
    if (visibleCards.value.length < getFilteredCards().length) {
      loadMoreCards();
    }
  }
}


import { watch } from 'vue';

onMounted(async () => {
  const response = await fetch('/src/assets/scryfall_data_merged.json');
  const loaded = await response.json();
  sets.value = Array.from(new Set(loaded.map((c: any) => c.set_name))).sort();
  cards.value = loaded;
  loadMoreCards(true);
});

import { watch } from 'vue';
watch([search, sortBy, sortOrder, selectedSets], () => {
  loadMoreCards(true);
});
</script>
