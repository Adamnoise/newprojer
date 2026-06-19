import { create } from 'zustand'

interface UserStats {
  points: number
  winRate: number
}

interface AppState {
  userStats: UserStats
  setUserStats: (stats: Partial<UserStats>) => void
}

export const useAppStore = create<AppState>((set) => ({
  userStats: {
    points: 1250,
    winRate: 68.5,
  },
  setUserStats: (stats) =>
    set((state) => ({
      userStats: { ...state.userStats, ...stats },
    })),
}))
