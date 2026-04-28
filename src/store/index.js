import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';

// ─── Auth Store ───────────────────────────────────────
export const useAuthStore = create(
  persist(
    (set) => ({
      user: null,
      accessToken: null,
      isAuthenticated: false,
      setAuth: (user, accessToken) => {
        sessionStorage.setItem('accessToken', accessToken);
        set({ user, accessToken, isAuthenticated: true });
      },
      logout: () => {
        sessionStorage.removeItem('accessToken');
        set({ user: null, accessToken: null, isAuthenticated: false });
      },
      updateUser: (updates) => set((state) => ({ user: { ...state.user, ...updates } })),
    }),
    { 
      name: 'magizhchi-auth', 
      storage: createJSONStorage(() => sessionStorage),
      partialize: (state) => ({ user: state.user, isAuthenticated: state.isAuthenticated }) 
    }
  )
);

// ─── Cart Store (count only, data from React Query) ───
export const useCartStore = create((set) => ({
  itemCount: 0,
  isCartOpen: false,
  setItemCount: (count) => set({ itemCount: count }),
  setCartOpen: (open) => set({ isCartOpen: open }),
}));

// ─── UI Store ─────────────────────────────────────────
export const useUIStore = create((set) => ({
  isMobileMenuOpen: false,
  isSearchOpen: false,
  isFilterOpen: false,
  searchQuery: '',
  setMobileMenu: (open) => set({ isMobileMenuOpen: open }),
  setSearchOpen: (open) => set({ isSearchOpen: open }),
  setFilterOpen: (open) => set({ isFilterOpen: open }),
  setSearchQuery: (q) => set({ searchQuery: q }),
}));

// ─── Wishlist Store (count) ────────────────────────────
export const useWishlistStore = create((set) => ({
  itemCount: 0,
  setItemCount: (count) => set({ itemCount: count }),
}));
