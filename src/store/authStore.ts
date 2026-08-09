import { create } from 'zustand';
import { User, onAuthStateChanged } from 'firebase/auth';
import { auth } from '../lib/firebase';
import { apiClient } from '../lib/api/client';

interface AuthState {
  user: User | null;
  profile: any | null; // Replace 'any' with correct type later
  loading: boolean;
  isAuthModalOpen: boolean;
  openAuthModal: () => void;
  closeAuthModal: () => void;
  setUser: (user: User | null) => void;
  initializeAuth: () => void;
}

export const useAuthStore = create<AuthState>((set) => ({
  user: null,
  profile: null,
  loading: true,
  isAuthModalOpen: false,
  openAuthModal: () => set({ isAuthModalOpen: true }),
  closeAuthModal: () => set({ isAuthModalOpen: false }),
  setUser: (user) => set({ user }),
  initializeAuth: () => {
    onAuthStateChanged(auth, async (user) => {
      if (user) {
        set({ user });
        try {
          // Attempt to fetch existing profile
          const { data } = await apiClient.get('/users/me');
          if (data && data.uid) {
            set({ profile: data });
          } else {
            // Trigger automatic sync if not found
            const syncRes = await apiClient.post('/users/sync', {
              displayName: user.displayName || 'Anonymous Student',
              avatarUrl: user.photoURL || undefined
            });
            set({ profile: syncRes.data });
          }
        } catch (error) {
          console.error("Profile fetch failed, attempting automatic sync:", error);
          try {
            const syncRes = await apiClient.post('/users/sync', {
              displayName: user.displayName || 'Anonymous Student',
              avatarUrl: user.photoURL || undefined
            });
            set({ profile: syncRes.data });
          } catch (syncError) {
            console.error("Automatic synchronization failed:", syncError);
          }
        }
      } else {
        set({ user: null, profile: null });
      }
      set({ loading: false });
    });
  }
}));
