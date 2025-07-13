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
              <v-list-item v-bind="props" title="Wishlist">
                <template #prepend>
                  <v-icon color="pink">mdi-heart</v-icon>
                </template>
              </v-list-item>
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
          <v-list-item
            :disabled="wishlist.length === 0"
            @click="copyWishlistToClipboard"
            style="margin-left: -30px;"
          >
            <template #prepend>
              <v-icon style="margin-right: -25px;">mdi-content-copy</v-icon>
            </template>
            <v-list-item-title style="margin-left: 0;">Copy Wishlist to Clipboard</v-list-item-title>
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
        <v-app-bar flat dark app style="z-index: 10;">
          <div style="display: flex; width: 100%; justify-content: flex-end; align-items: center;">
            <div class="search-bar-wrapper" :class="{ closed: searchBoxClosed && !search }">
              <v-text-field v-model.trim="search"
                dense 
                rounded 
                clearable 
                placeholder="Search"
                prepend-inner-icon="mdi-magnify" 
                variant="solo"
                class="pt-4 shrink"
                @focus="searchBoxClosed = false" @blur="searchBoxClosed = true"
              ></v-text-field>
            </div>
            <v-tooltip location="bottom">
                <template #activator="{ props }">
                  <v-btn icon v-bind="props" @click="showSearchHelp = true" style="margin-left: 4px;" aria-label="Search Syntax Help">
                    <v-icon>mdi-help-circle-outline</v-icon>
                  </v-btn>
                </template>
                <span>Search Syntax Help</span>
              </v-tooltip>
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
  <!-- Search Syntax Help Dialog -->
  <v-dialog v-model="showSearchHelp" max-width="500">
    <v-card>
      <v-card-title class="headline">Search Syntax Help</v-card-title>
      <v-card-text>
        <div style="font-size: 1rem;">
          <strong>Search Tags:</strong>
          <ul>
            <li><code>c:</code> <b>Color Identity</b> (e.g. <code>c:UW</code> for Blue AND White)</li>
            <li><code>n:</code> <b>Name</b> (e.g. <code>n:dragon</code>)</li>
            <li><code>o:</code> <b>Oracle Text</b> (e.g. <code>o:flying</code>)</li>
            <li><code>t:</code> <b>Type</b> (e.g. <code>t:creature</code>)</li>
          </ul>
          <strong>Negation:</strong>
          <ul>
            <li>Prefix with <code>-</code> to exclude (e.g. <code>-c:R</code> excludes Red)</li>
          </ul>
          <strong>Multiple Tags:</strong>
          <ul>
            <li>Combine tags for advanced search (e.g. <code>c:UW n:angel -o:flying</code>)</li>
          </ul>
          <strong>Fallback:</strong>
          <ul>
            <li>Any text without a tag will search name, type, oracle text, and color identity</li>
          </ul>
        </div>
      </v-card-text>
      <v-card-actions>
        <v-spacer></v-spacer>
        <v-btn color="primary" @click="showSearchHelp = false">Close</v-btn>
      </v-card-actions>
    </v-card>
  </v-dialog>

  <!-- Disclaimer Dialog -->
  <v-dialog v-model="showDisclaimer" persistent max-width="500">
    <v-card>
      <v-card-title class="headline">Disclaimer</v-card-title>
      <v-card-text>
        <div style="font-size: 1rem;">
          <p>
            <strong>Notice:</strong> This app is not affiliated with Wizards of the Coast. The data for these cards, especially prices, is not up to date and was taken from Scryfall on <b>7/7/2025</b>.
            Quantities and prices may have changed since then. Please reach out for more accurate information.
          </p>
        </div>
      </v-card-text>
      <v-card-actions>
        <v-spacer></v-spacer>
        <v-btn color="primary" @click="acknowledgeDisclaimer">Acknowledge</v-btn>
      </v-card-actions>
    </v-card>
  </v-dialog>

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
<style lang="css">
    .search-bar-wrapper {
      transition: max-width 0.5s cubic-bezier(.4,0,.2,1), width 0.5s cubic-bezier(.4,0,.2,1);
      max-width: 400px;
      width: 100%;
      display: flex;
    }
    .search-bar-wrapper.closed {
      max-width: 50px;
      width: 50px;
    }
</style>



<script setup lang="ts">
// ...existing code...
import { ref, onMounted, nextTick } from 'vue';
import CardItem from './CardItem.vue';
import CardDetail from './CardDetail.vue';
import { useWishlistLogic } from '../composables/useWishlistLogic';
import { useSearchLogic } from '../composables/useSearchLogic';
import { useFilterLogic } from '../composables/useFilterLogic';

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

const showSearchHelp = ref(false);
const showDisclaimer = ref(false);
const cards = ref<any[]>([]);
const visibleCards = ref<any[]>([]);
const selectedCard = ref<any>(null);
const loading = ref(false);
const batchSize = 50;
const searchBoxClosed = ref(true);
let currentIndex = 0;
const scrollAreaRef = ref<HTMLElement | null>(null);
const search = ref('');
const sortOptions = [
  { title: 'Name', value: 'name' },
  { title: 'Purchase Price', value: 'price' },
];
const sortBy = ref('price');
const sortOrder = ref<'asc' | 'desc'>('desc');
var open = "Sets";
const drawer = ref(true);
const sets = ref<string[]>([]);
const colorOptions = [
  { value: 'W', label: 'White' },
  { value: 'U', label: 'Blue' },
  { value: 'B', label: 'Black' },
  { value: 'R', label: 'Red' },
  { value: 'G', label: 'Green' },
  { value: 'C', label: 'Colorless' },
];

// --- Composables ---
const {
  selectedSets,
  selectedColors,
  toggleColorSelection,
  clearColorSelection,
  toggleSetSelection,
  clearSetSelection,
} = useFilterLogic();

const {
  wishlist,
  wishlistStore,
  snackbar,
  snackbarRemove,
  openTCGMassEntry,
  copyWishlistToClipboard,
  handleWishlist,
} = useWishlistLogic(cards);

const { getFilteredCards } = useSearchLogic(cards, selectedSets, selectedColors, sortBy, sortOrder, search);

function toggleSortOrder() {
  sortOrder.value = sortOrder.value === 'asc' ? 'desc' : 'asc';
}

function viewDetails(card: any) {
  if (selectedCard.value && selectedCard.value.id === card.id) {
    selectedCard.value = null;
    nextTick(() => {
      selectedCard.value = card;
    });
  } else {
    selectedCard.value = card;
  }
}

function acknowledgeDisclaimer() {
  setCookie('disclaimer_acknowledged', 'true', 365);
  showDisclaimer.value = false;
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
  // Disclaimer logic
  if (getCookie('disclaimer_acknowledged') !== 'true') {
    showDisclaimer.value = true;
  }
  // Wait for cards to be loaded before restoring wishlist
  if (cards.value.length === 0) {
    const response = await fetch('/scryfall_data_merged.json');
    const loaded = await response.json();
    // Explicitly type loaded as any[]
    const loadedCards = loaded as any[];
    sets.value = Array.from(new Set(loadedCards.map((c) => String(c.set_name)))).sort();
    cards.value = loadedCards;
    loadMoreCards(true);
  }
  const cookie = getCookie('wishlist');
  if (cookie) {
    try {
      const arr = JSON.parse(decodeURIComponent(cookie));
      arr.forEach((c: any) => {
        const found = cards.value.find((card: any) => card.id === c.id);
        if (found) wishlistStore.add(found);
      });
    } catch {}
  }
});

watch([search, sortBy, sortOrder, selectedSets], () => {
  loadMoreCards(true);
});
</script>
