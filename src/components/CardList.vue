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
          <div style="display: flex; width: 100%; justify-content: center; align-items: center;">
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
function copyWishlistToClipboard() {
  if (!wishlist.value.length) return;
  // Format: Card Name (Set Name)\n per line
  const lines = wishlist.value.map(card => `${card.name} (${card.set_name || ''})`).join('\n');
  navigator.clipboard.writeText(lines).then(() => {
    snackbar.value.message = 'Wishlist copied to clipboard!';
    snackbar.value.show = true;
  }, () => {
    snackbarRemove.value.message = 'Failed to copy wishlist.';
    snackbarRemove.value.show = true;
  });
}
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

// Search Syntax Help Dialog State
const showSearchHelp = ref(false);
const cards = ref([]);
const visibleCards = ref<any[]>([]);
const selectedCard = ref(null);
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
  const s = search.value.trim();
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

  // Scryfall-like syntax parsing
  // Supported: c: (color), n: (name), o: (oracle text), t: (type)
  // Negation: -c:U, -n:foo, etc.
  // Example: c:U n:dragon -o:flying
  // If no tag, fallback to fuzzy search
  const syntaxRegex = /(-)?(c|n|o|t):([^\s]+)/gi;
  let matches = [];
  let rest = s;
  let m;
  while ((m = syntaxRegex.exec(s)) !== null) {
    matches.push({ neg: !!m[1], tag: m[2], value: m[3].toLowerCase() });
    rest = rest.replace(m[0], '').trim();
  }

  if (matches.length > 0) {
    matches.forEach(({ neg, tag, value }) => {
      if (tag === 'c') {
        // AND logic: c:UW means must have both U and W in color_identity
        const colors = value.split('');
        filtered = filtered.filter(card => {
          if (!Array.isArray(card.color_identity)) return false;
          const cardColors = card.color_identity.map((x: string) => x.toLowerCase());
          const hasAll = colors.every(c => cardColors.includes(c));
          return neg ? !hasAll : hasAll;
        });
      } else if (tag === 'n') {
        filtered = filtered.filter(card => {
          const hasName = card.name?.toLowerCase().includes(value);
          return neg ? !hasName : hasName;
        });
      } else if (tag === 'o') {
        filtered = filtered.filter(card => {
          const hasOracle = card.oracle_text?.toLowerCase().includes(value);
          return neg ? !hasOracle : hasOracle;
        });
      } else if (tag === 't') {
        filtered = filtered.filter(card => {
          const hasType = card.type_line?.toLowerCase().includes(value);
          return neg ? !hasType : hasType;
        });
      }
    });
  }
  // Fallback fuzzy search for any remaining text
  if (rest) {
    const restLower = rest.toLowerCase();
    filtered = filtered.filter(card =>
      card.name?.toLowerCase().includes(restLower) ||
      card.type_line?.toLowerCase().includes(restLower) ||
      card.oracle_text?.toLowerCase().includes(restLower) ||
      (Array.isArray(card.color_identity) && card.color_identity.join('').toLowerCase().includes(restLower))
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
