<template>
  <v-dialog v-model="dialog" max-width="600px">
    <v-card v-if="card">
      <v-card-title style="font-size: 1.2rem; padding-bottom: 4px;">{{ card.name }}</v-card-title>
      <v-card-text style="padding-top: 8px; padding-bottom: 8px;">
        <v-img
          :src="card.image_uris?.normal || ''"
          height="320px"
          style="cursor:pointer; margin-bottom: 8px; border-radius: 14px;"
          @click="openScryfall"
        />
        <div style="margin-bottom: 2px;"><strong>Set:</strong> {{ card.set_name }}</div>
        <div style="margin-bottom: 2px;"><strong>Type:</strong> {{ card.type_line }}</div>
        <div style="margin-bottom: 2px;"><strong>Oracle Text:</strong> {{ card.oracle_text }}</div>
        <div style="margin-bottom: 2px;"><strong>Price:</strong> ${{ card.prices?.usd || 'N/A' }}</div>
        <div><strong>Quantity:</strong> {{ card.jamesData.inventoryInfo[0]?.quantity ?? 'N/A' }}</div>
      </v-card-text>
      <v-card-actions>
        <v-btn color="primary" @click="$emit('add-to-wishlist', card)">
          <v-icon left>{{ card.inWishlist ? 'mdi-heart' : 'mdi-heart-outline' }}</v-icon>
          {{ card.inWishlist ? 'Remove from Wishlist' : 'Wishlist' }}
        </v-btn>
        <template v-if="card.related_uris">
          <template v-for="(url, key) in card.related_uris" :key="key">
            <template v-if="String(key) !== 'tcgplayer_infinite_articles' && String(key) !== 'tcgplayer_infinite_decks' && String(key) !== 'tcg_player_infinite_decks'">
              <v-btn color="secondary" size="small" style="margin-left: 4px;" @click="openRelated(url)">
                <v-icon left size="small">mdi-open-in-new</v-icon>
                {{ formatRelatedLabel(String(key)) }}
              </v-btn>
            </template>
          </template>
        </template>
        <v-spacer />
        <v-btn color="primary" @click="$emit('close')">Close</v-btn>
      </v-card-actions>
    </v-card>
  </v-dialog>
</template>

<script setup lang="ts">
import { ref, watch } from 'vue';
const props = defineProps<{ card: any }>();
const dialog = ref(true);
watch(() => props.card, () => { dialog.value = true; });

function openScryfall() {
  if (props.card?.scryfall_uri) {
    window.open(props.card.scryfall_uri, '_blank');
  }
}

function openRelated(url: string) {
  window.open(url, '_blank');
}

function formatRelatedLabel(key: string) {
  // Format keys like 'gatherer', 'edhrec', etc. to readable labels
  return key.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase());
}
</script>
