import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import { getProducts as fetchProductsFromFirestore } from '../firebase/firestore';

export const fetchProducts = createAsyncThunk(
  'products/fetchProducts',
  async () => {
    const products = await fetchProductsFromFirestore();
    return products;
  }
);

const productsSlice = createSlice({
  name: 'products',
  initialState: {
    items: [],
    filteredItems: [],
    activeCategory: 'all',
    searchQuery: '',
    sortBy: 'default',
    status: 'idle', // 'idle' | 'loading' | 'succeeded' | 'failed'
    error: null
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
  extraReducers: (builder) => {
    builder
      .addCase(fetchProducts.pending, (state) => {
        state.status = 'loading';
      })
      .addCase(fetchProducts.fulfilled, (state, action) => {
        state.status = 'succeeded';
        state.items = action.payload;
        state.filteredItems = applyFilters({ ...state, items: action.payload });
      })
      .addCase(fetchProducts.rejected, (state, action) => {
        state.status = 'failed';
        state.error = action.error.message;
      });
  }
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
      result.sort((a, b) => (b.soldCount || 0) - (a.soldCount || 0));
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
