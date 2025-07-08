<template>
  <v-col cols="12" sm="6" md="4" lg="4">
    <v-card class="ma-2" outlined>
      <v-img :src="card.image_uris?.normal || ''" height="260px" style="cursor:pointer;" @click="$emit('view-details', card)" />
      <v-card-title>{{ card.name }}</v-card-title>
      <v-card-subtitle>{{ card.set_name }}</v-card-subtitle>
      <v-card-text>
        <div>Price: ${{ card.prices?.usd || 'N/A' }}</div>
      </v-card-text>
      <v-card-actions>
        <v-btn color="primary" @click="$emit('view-details', card)">Details</v-btn>
        <v-spacer />
        <v-btn color="secondary" @click="$emit('add-to-wishlist', card)">
          <v-icon left>{{ card.inWishlist ? 'mdi-heart' : 'mdi-heart-outline' }}</v-icon>
          Wishlist
        </v-btn>
        <v-spacer />
        <v-btn color="info" :href="card.scryfall_uri" target="_blank">
          <v-icon left>mdi-open-in-new</v-icon>
          Scryfall
        </v-btn>
      </v-card-actions>
    </v-card>
  </v-col>
</template>

<script setup lang="ts">
defineProps<{ card: any }>();
</script>
