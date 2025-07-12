<template>
  <v-col cols="12" sm="6" md="4" lg="4">
    <v-card class="ma-2" outlined>
      <div class="card-img-hover-container">
        <v-img :src="card.image_uris?.normal || ''" height="260px" style="cursor:pointer; margin-top: 8px; border-radius: 12px;" @click="$emit('view-details', card)" />
        <div class="magnify-overlay">
          <v-icon size="36" color="#fff" style="text-shadow: 0 2px 8px #000;">mdi-magnify</v-icon>
        </div>
      </div>
      <div style="padding: 8px 16px 0 16px;">
        <div style="font-size: 1.1rem; font-weight: 500; line-height: 1.2;">{{ card.name }}</div>
        <div style="font-size: 0.95rem; color: #666; line-height: 1.1;">{{ card.set_name }}</div>
        <div style="font-size: 0.95rem; color: #666;">Est. Price: ${{ card.prices?.usd || 'N/A' }}</div>
      </div>
      <v-card-actions style="padding: 8px 8px 8px 8px; justify-content: center;">
        <v-btn-group variant="elevated" density="compact" style="width: auto; min-width: 0; max-width: 220px;">
          <v-btn color="surface" size="x-small" style="min-width: 0; padding: 0 8px; color: #bdbdbd;" @click="$emit('view-details', card)">Details</v-btn>
          <v-btn color="surface" size="x-small" style="min-width: 0; padding: 0 8px; color: #bdbdbd;" @click="$emit('add-to-wishlist', card)">
            <v-icon left size="x-small" style="color: #bdbdbd;">{{ isWishlisted ? 'mdi-heart' : 'mdi-heart-outline' }}</v-icon>
            Wishlist
          </v-btn>
          <v-btn color="surface" size="x-small" style="min-width: 0; padding: 0 8px; color: #bdbdbd;" :href="card.scryfall_uri" target="_blank">
            <v-icon left size="x-small" style="color: #bdbdbd;">mdi-open-in-new</v-icon>
            Scryfall
          </v-btn>
        </v-btn-group>
      </v-card-actions>
    </v-card>
  </v-col>
</template>

<script setup lang="ts">
import { computed } from 'vue';
import { useWishlistStore } from '../stores/wishlist';
const props = defineProps<{ card: any }>();
const wishlistStore = useWishlistStore();
const isWishlisted = computed(() => wishlistStore.wishlist.some((c: any) => c.id === props.card.id));
</script>

<style scoped>
.card-img-hover-container {
  position: relative;
  display: flex;
  justify-content: center;
  align-items: center;
}
.magnify-overlay {
  position: absolute;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
  opacity: 0;
  pointer-events: none;
  transition: opacity 0.2s;
  z-index: 2;
}
.card-img-hover-container:hover .magnify-overlay {
  opacity: 1;
}
</style>
