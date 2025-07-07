<template>
  <v-dialog v-model="dialog" max-width="600px">
    <v-card v-if="card">
      <v-card-title>{{ card.name }}</v-card-title>
      <v-card-text>
        <v-img :src="card.image_uris?.normal || ''" height="300px" />
        <div><strong>Set:</strong> {{ card.set_name }}</div>
        <div><strong>Type:</strong> {{ card.type_line }}</div>
        <div><strong>Oracle Text:</strong> {{ card.oracle_text }}</div>
        <div><strong>Price:</strong> ${{ card.prices?.usd || 'N/A' }}</div>
      </v-card-text>
      <v-card-actions>
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
</script>
