import { defineStore } from 'pinia';

export const useWishlistStore = defineStore('wishlist', {
  state: () => ({
    wishlist: [] as any[],
  }),
  getters: {
    count: (state) => state.wishlist.length,
    total: (state) => state.wishlist.reduce((sum, c) => sum + (parseFloat(c.prices?.usd) || 0), 0),
  },
  actions: {
    add(card: any) {
      if (!card.id || this.wishlist.find((c) => c.id === card.id)) return;
      this.wishlist.push(card);
      card.inWishlist = true;
    },
    remove(card: any) {
      const idx = this.wishlist.findIndex((c) => c.id === card.id);
      if (idx !== -1) {
        this.wishlist.splice(idx, 1);
        card.inWishlist = false;
      }
    },
    toggle(card: any) {
      if (this.wishlist.find((c) => c.id === card.id)) {
        this.remove(card);
      } else {
        this.add(card);
      }
    },
  },
});
