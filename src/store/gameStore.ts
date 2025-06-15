// src/store/gameStore.ts
import { create } from 'zustand';

interface GameState {
    isGameStart: boolean;
    stageCount: number;
    deathCount: number;
    volume: number;
    playBGM: boolean;
    setIsGameStart: (value: boolean) => void;
    setStageCount: (count: number) => void;
    setDeathCount: (count: number) => void;
    setVolume: (value: number) => void;
    setPlayBGM: (value: boolean) => void;
}

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
