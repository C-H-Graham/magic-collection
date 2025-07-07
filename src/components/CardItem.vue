<template>
  <v-col cols="12" sm="6" md="4" lg="3">
    <v-card class="ma-2" outlined>
      <v-img :src="card.image_uris?.normal || ''" height="200px" />
      <v-card-title>{{ card.name }}</v-card-title>
      <v-card-subtitle>{{ card.set_name }}</v-card-subtitle>
      <v-card-text>
        <div>Price: ${{ card.prices?.usd || 'N/A' }}</div>
      </v-card-text>
      <v-card-actions>
        <v-btn color="primary" @click="$emit('view-details', card)">View Details</v-btn>
      </v-card-actions>
    </v-card>
  </v-col>
</template>

<script setup lang="ts">
defineProps<{ card: any }>();
</script>
