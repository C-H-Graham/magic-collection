import { ref, watch } from 'vue';

export function useSearchLogic(cards, selectedSets, selectedColors, sortBy, sortOrder, search) {
  function getFilteredCards() {
    const s = search.value.trim();
    let filtered = cards.value;
    if (selectedSets.value.length > 0) {
      filtered = filtered.filter(card => selectedSets.value.includes(card.set_name));
    }
    if (selectedColors.value.length > 0) {
      filtered = filtered.filter(card => {
        if (!Array.isArray(card.color_identity)) return false;
        return selectedColors.value.every(sel => card.color_identity.includes(sel));
      });
    }
    // Scryfall-like syntax parsing
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
          const colors = value.split('');
          filtered = filtered.filter(card => {
            if (!Array.isArray(card.color_identity)) return false;
            const cardColors = card.color_identity.map((x) => x.toLowerCase());
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
    if (rest) {
      const restLower = rest.toLowerCase();
      filtered = filtered.filter(card =>
        card.name?.toLowerCase().includes(restLower) ||
        card.type_line?.toLowerCase().includes(restLower) ||
        card.oracle_text?.toLowerCase().includes(restLower) ||
        (Array.isArray(card.color_identity) && card.color_identity.join('').toLowerCase().includes(restLower))
      );
    }
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
  return { getFilteredCards };
}
