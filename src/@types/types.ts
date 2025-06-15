
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