import { ref, watch } from 'vue';
import { useWishlistStore } from '../stores/wishlist';
import { watch as vueWatch } from 'vue';

export function useWishlistLogic(cards: any) {
  const wishlistStore = useWishlistStore();
  const wishlist = ref<any[]>([]);
  const snackbar = ref({ show: false, message: '' });
  const snackbarRemove = ref({ show: false, message: '' });

  vueWatch(() => wishlistStore.wishlist, (val: any[]) => {
    wishlist.value = val;
  }, { immediate: true });

  watch(wishlist, (newVal) => {
  // Only store id and name for simplicity
  const minimal = newVal.map(card => ({ id: card.id, name: card.name }));
  setWishlistCookie(encodeURIComponent(JSON.stringify(minimal)));
}, { deep: true });

  function encodeCardName(name: string) {
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

  function copyWishlistToClipboard() {
    if (!wishlist.value.length) return;
    const lines = wishlist.value.map(card => `${card.name} (${card.set_name || ''})`).join('\n');
    navigator.clipboard.writeText(lines).then(() => {
      snackbar.value.message = 'Wishlist copied to clipboard!';
      snackbar.value.show = true;
    }, () => {
      snackbarRemove.value.message = 'Failed to copy wishlist.';
      snackbarRemove.value.show = true;
    });
  }

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

  // Simple cookie helpers
function setWishlistCookie(value: string, days = 365) {
  const d = new Date();
  d.setTime(d.getTime() + days * 24 * 60 * 60 * 1000);
  // Use Vite base path for cookie path
  const base = import.meta.env.BASE_URL || '/';
  document.cookie = `wishlist=${value};expires=${d.toUTCString()};path=${base}`;
}

  return {
    wishlist,
    wishlistStore,
    snackbar,
    snackbarRemove,
    openTCGMassEntry,
    copyWishlistToClipboard,
    handleWishlist,
  };
}
