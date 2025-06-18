
//Footer.tsx
export interface FooterProps {
    isPlaying: boolean
    isClear: boolean
}

//StageTemplate.tsx
export interface StageTemplateProps {
    scene: Phaser.Types.Scenes.SettingsConfig | Phaser.Scene;
    children?: React.ReactNode;
}

//gameStore.ts
export interface GameState {
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