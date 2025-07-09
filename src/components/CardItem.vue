<template>
  <v-col cols="12" sm="6" md="4" lg="4">
    <v-card class="ma-2" outlined>
      <v-img :src="card.image_uris?.normal || ''" height="260px" style="cursor:pointer; margin-top: 8px;" @click="$emit('view-details', card)" />
      <div style="padding: 8px 16px 0 16px;">
        <div style="font-size: 1.1rem; font-weight: 500; line-height: 1.2;">{{ card.name }}</div>
        <div style="font-size: 0.95rem; color: #666; line-height: 1.1;">{{ card.set_name }}</div>
        <div style="font-size: 0.95rem; color: #666;">Price: ${{ card.prices?.usd || 'N/A' }}</div>
      </div>
      <v-card-actions style="padding: 8px 8px 8px 8px; justify-content: center;">
        <v-btn-group variant="elevated" density="compact" style="width: auto; min-width: 0; max-width: 220px;">
          <v-btn color="primary" size="x-small" style="min-width: 0; padding: 0 8px;" @click="$emit('view-details', card)">Details</v-btn>
          <v-btn color="secondary" size="x-small" style="min-width: 0; padding: 0 8px;" @click="$emit('add-to-wishlist', card)">
            <v-icon left size="x-small">{{ card.inWishlist ? 'mdi-heart' : 'mdi-heart-outline' }}</v-icon>
            Wishlist
          </v-btn>
          <v-btn color="info" size="x-small" style="min-width: 0; padding: 0 8px;" :href="card.scryfall_uri" target="_blank">
            <v-icon left size="x-small">mdi-open-in-new</v-icon>
            Scryfall
          </v-btn>
        </v-btn-group>
      </v-card-actions>
    </v-card>
  </v-col>
</template>

<script setup lang="ts">
defineProps<{ card: any }>();
</script>
