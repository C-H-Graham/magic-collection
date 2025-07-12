
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
                      <!-- Wishlist Actions -->
          <v-list-item
            :disabled="wishlist.length === 0"
            @click="openTCGMassEntry"
            style="margin-left: -30px;"
          >
            <template #prepend>
              <v-icon style="margin-right: -25px;">mdi-open-in-new</v-icon>
            </template>
            <v-list-item-title style="margin-left: 0;">Buy on TCGPlayer</v-list-item-title>
          </v-list-item>
          <v-list-item
            :disabled="wishlist.length === 0"
            @click="wishlistStore.clear()"
            style="margin-left: -30px;"
          >
            <template #prepend>
              <v-icon style="margin-right: -25px;">mdi-delete</v-icon>
            </template>
            <v-list-item-title style="margin-left: 0;">Clear</v-list-item-title>
          </v-list-item>
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

          <!-- Color Identity Group -->
          <v-list-group value="Colors" dense>
            <template v-slot:activator="{ props }">
              <v-list-item v-bind="props" title="Colors" prepend-icon="mdi-palette"></v-list-item>
            </template>
            <v-list-item :active="selectedColors.length === 0" @click="clearColorSelection" title="All Colors"></v-list-item>
            <v-list-item
              v-for="color in colorOptions"
              :key="color.value"
              :active="selectedColors.includes(color.value)"
              @click="toggleColorSelection(color.value)"
            >
              <v-list-item-title>{{ color.label }}</v-list-item-title>
              <template #append>
                <v-icon v-if="selectedColors.includes(color.value)">mdi-check</v-icon>
              </template>
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
// Simple cookie helpers
function setCookie(name: string, value: string, days = 365) {
  const d = new Date();
  d.setTime(d.getTime() + days * 24 * 60 * 60 * 1000);
  document.cookie = `${name}=${value};expires=${d.toUTCString()};path=/`;
}
function getCookie(name: string): string | null {
  const match = document.cookie.match(new RegExp('(^| )' + name + '=([^;]+)'));
  return match ? decodeURIComponent(match[2]) : null;
}


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
const sortBy = ref('price');
const sortOrder = ref<'asc' | 'desc'>('desc');
var open = "Sets"

// --- Navigation Drawer State ---
const drawer = ref(true);
const selectedSets = ref<string[]>([]);
const sets = ref<string[]>([]);

// --- Color Identity Filter State ---
const colorOptions = [
  { value: 'W', label: 'White' },
  { value: 'U', label: 'Blue' },
  { value: 'B', label: 'Black' },
  { value: 'R', label: 'Red' },
  { value: 'G', label: 'Green' },
  { value: 'C', label: 'Colorless' },
];
const selectedColors = ref<string[]>([]);

function toggleColorSelection(color: string) {
  const idx = selectedColors.value.indexOf(color);
  if (idx === -1) {
    selectedColors.value.push(color);
  } else {
    selectedColors.value.splice(idx, 1);
  }
  loadMoreCards(true);
}

function clearColorSelection() {
  selectedColors.value = [];
  loadMoreCards(true);
}

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
import { watch as vueWatch } from 'vue';
const wishlist = ref<any[]>([]);
vueWatch(() => wishlistStore.wishlist, (val: any[]) => {
  wishlist.value = val;
}, { immediate: true });
const snackbar = ref({ show: false, message: '' });
const snackbarRemove = ref({ show: false, message: '' });

function encodeCardName(name: string) {
  // Encode the card name for URL, but do NOT replace spaces with +
  return encodeURIComponent(name)
    .replace(/%2C/g, ',')
    .replace(/%27/g, "'");
}

function openTCGMassEntry() {
  if (!wishlist.value.length) return;
  const query = wishlist.value
    .map(card => `1+${encodeCardName(card.name)}`)
    .join('%7c%7c');
  const url = `https://www.tcgplayer.com/massentry?c=${query}`;
  window.open(url, '_blank');
}

// Persist wishlist to cookie whenever it changes
watch(wishlist, (newVal) => {
  // Only store id and name for simplicity
  const minimal = newVal.map(card => ({ id: card.id, name: card.name }));
  setCookie('wishlist', encodeURIComponent(JSON.stringify(minimal)));
}, { deep: true });

// On page load, restore wishlist from cookie
onMounted(async () => {
  // Wait for cards to be loaded before restoring wishlist
  if (cards.value.length === 0) {
    const response = await fetch('/src/assets/scryfall_data_merged.json');
    const loaded = await response.json();
    sets.value = Array.from(new Set(loaded.map((c: any) => c.set_name))).sort();
    cards.value = loaded;
    loadMoreCards(true);
  }
  const cookie = getCookie('wishlist');
  if (cookie) {
    try {
      const arr = JSON.parse(decodeURIComponent(cookie));
      arr.forEach((c: any) => {
        // Find card in loaded cards and add to wishlist
        const found = cards.value.find((card: any) => card.id === c.id);
        if (found) wishlistStore.add(found);
      });
    } catch {}
  }
});

function handleWishlist(card: any) {
  if (!card.id) return;
  const inList = wishlist.value.find((c) => c.id === card.id);
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
  if (selectedColors.value.length > 0) {
    filtered = filtered.filter(card => {
      if (!Array.isArray(card.color_identity)) return false;
      // Card must have ALL selected colors in its color_identity
      return selectedColors.value.every(sel => card.color_identity.includes(sel));
    });
  }
  if (s) {
    filtered = filtered.filter(card =>
      card.name?.toLowerCase().includes(s) ||
      card.type_line?.toLowerCase().includes(s) ||
      (Array.isArray(card.color_identity) && card.color_identity.join('').toLowerCase().includes(s))
    );
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
