<template>
  <v-footer app height="48" class="footer-tracker">
    <div class="wishlist-tracker">
      <v-icon color="pink" size="20" class="mr-1">mdi-heart</v-icon>
      <span class="mr-2">Wishlist: <strong>{{ wishlistCount }}</strong> card<span v-if="wishlistCount !== 1">s</span></span>
      <v-icon color="amber" size="20" class="mr-1">mdi-cash</v-icon>
      <span class="mr-3">Estimated Total: <strong>${{ wishlistTotal.toFixed(2) }}</strong></span>
    </div>
  </v-footer>
</template>

<script setup lang="ts">
import { computed } from 'vue';
import { useWishlistStore } from '../stores/wishlist';

const wishlistStore = useWishlistStore();
const wishlistCount = computed(() => wishlistStore.count);
const wishlistTotal = computed(() => wishlistStore.total);

function encodeCardName(name: string) {
  // Encode the card name for URL, but do NOT replace spaces with +
  return encodeURIComponent(name)
    .replace(/%2C/g, ',')
    .replace(/%27/g, "'");
}

const tcgMassEntryUrl = computed(() => {
  if (!wishlistStore.wishlist.length) return 'https://www.tcgplayer.com/massentry';
  // Use quantity 1 for each card (could be extended for real quantities)
  const query = wishlistStore.wishlist
    .map(card => `1+${encodeCardName(card.name)}`)
    .join('%7c%7c');
  return `https://www.tcgplayer.com/massentry?c=${query}`;
});
</script>

<style scoped>
.footer-tracker {
  background: #181818;
  color: #fff;
  font-size: 1rem;
  display: flex;
  align-items: center;
  justify-content: center;
  min-height: 48px;
}
.wishlist-tracker {
  display: flex;
  align-items: center;
  font-size: 1rem;
  gap: 4px;
}
</style>
