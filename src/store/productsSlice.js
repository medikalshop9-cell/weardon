import { createSlice } from '@reduxjs/toolkit';
import { products as mockProducts } from '../data/products';

const productsSlice = createSlice({
  name: 'products',
  initialState: {
    items: mockProducts,
    filteredItems: mockProducts,
    activeCategory: 'all',
    searchQuery: '',
    sortBy: 'default',
  },
  reducers: {
    setCategory(state, action) {
      state.activeCategory = action.payload;
      state.filteredItems = applyFilters(state);
    },
    setSearchQuery(state, action) {
      state.searchQuery = action.payload;
      state.filteredItems = applyFilters(state);
    },
    setSortBy(state, action) {
      state.sortBy = action.payload;
      state.filteredItems = applyFilters(state);
    },
  },
});

function applyFilters(state) {
  let result = [...state.items];

  // Category filter
  if (state.activeCategory !== 'all') {
    result = result.filter(p => p.category === state.activeCategory);
  }

  // Search filter
  if (state.searchQuery.trim()) {
    const q = state.searchQuery.toLowerCase();
    result = result.filter(p =>
      p.name.toLowerCase().includes(q) ||
      p.description.toLowerCase().includes(q) ||
      p.category.toLowerCase().includes(q)
    );
  }

  // Sort
  switch (state.sortBy) {
    case 'price-low':
      result.sort((a, b) => a.price - b.price);
      break;
    case 'price-high':
      result.sort((a, b) => b.price - a.price);
      break;
    case 'popular':
      result.sort((a, b) => b.soldCount - a.soldCount);
      break;
    case 'newest':
      result = result.filter(p => p.isNew).concat(result.filter(p => !p.isNew));
      break;
    default:
      break;
  }

  return result;
}

export const { setCategory, setSearchQuery, setSortBy } = productsSlice.actions;
export default productsSlice.reducer;
