import { create } from 'zustand';
import type { GameState } from '../@types/types'



export const useGameStore = create<GameState>((set) => ({
    isGameStart: false,
    stageCount: 1,
    deathCount: 0,
    volume: 50, 
    playBGM: false,
    setIsGameStart: (value) => set({ isGameStart: value }),
    setStageCount: (count) => set({ stageCount: count }),
    setDeathCount: (count) => set({ deathCount: count }),
    setVolume: (value) => set({ volume: value }),
    setPlayBGM: (value) => set({ playBGM: value }),
}));
