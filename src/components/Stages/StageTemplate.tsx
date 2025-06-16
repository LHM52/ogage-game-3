import { useRef, useEffect } from "react";
import Phaser from "phaser";
import gameConfig from "../../GameLogics/Gameconfig";


interface StageTemplateProps {
    scene: Phaser.Scene | Phaser.Types.Scenes.SettingsConfig | typeof Phaser.Scene;
    children?: React.ReactNode;
}

export default function StageTemplate({ scene, children }: StageTemplateProps) {
    const gameRef = useRef<HTMLDivElement>(null);
    const phaserGameRef = useRef<Phaser.Game | null>(null);

    useEffect(() => {
        if (gameRef.current && !phaserGameRef.current) {
            const config = {
                ...gameConfig,
                parent: gameRef.current,
                scene,
            };
            phaserGameRef.current = new Phaser.Game(config);
        }
        return () => {
            phaserGameRef.current?.destroy(true);
            phaserGameRef.current = null;
        };
    }, [scene]);

    return (
        <div style={{ width: "100%", height: "calc(100vh - 150px)" }}>
            <div ref={gameRef} style={{ width: "100%", height: "100%" }} />
            {children}
        </div>
    );
}