import React, { useRef, useEffect, useState } from 'react';
import Phaser from 'phaser';
import gameConfig from "../../GameLogics/gameConfig";
import { PreloaderScene } from "../../GameLogics/PreloaderScene";
import { useLocation } from 'react-router-dom';

const StageTemplate: React.FC<{ children?: React.ReactNode }> = ({ children }) => {
    const gameRef = useRef<HTMLDivElement>(null);
    const phaserGameRef = useRef<Phaser.Game | null>(null);
    const [isPhaserCanvasVisible, setIsPhaserCanvasVisible] = useState(false);
    const [isGameLoading, setIsGameLoading] = useState(true);
    const location = useLocation();

    useEffect(() => {
        if (gameRef.current && !phaserGameRef.current) {
            const config: Phaser.Types.Core.GameConfig = {
                ...gameConfig,
                parent: gameRef.current,
                scene: [],
            };

            const game = new Phaser.Game(config);
            phaserGameRef.current = game;

            game.scene.add('PreloaderScene', PreloaderScene, true, {
                onPreloaderReady: () => {
                    setIsGameLoading(false);
                    setIsPhaserCanvasVisible(true);
                }
            });
        }

        return () => {
            if (phaserGameRef.current) {
                phaserGameRef.current.destroy(true);
                phaserGameRef.current = null;
            }
            setIsPhaserCanvasVisible(false);
            setIsGameLoading(false);
        };
    }, []);

    useEffect(() => {
        const game = phaserGameRef.current;
        if (!game || isGameLoading) return;

        let nextSceneKey: string | null = null;
        if (location.pathname === '/stage/1') nextSceneKey = 'Stage1Scene';
        else if (location.pathname === '/stage/2') nextSceneKey = 'Stage2Scene';
        else if (location.pathname === '/stage/3') nextSceneKey = 'Stage3Scene';
        else if (location.pathname === '/stage/4') nextSceneKey = 'Stage4Scene';




        const currentActiveScene = game.scene.scenes.find(s => s.sys.isActive);
        const currentSceneKey = currentActiveScene?.scene.key;


        if (currentSceneKey !== nextSceneKey && nextSceneKey) {
            if (typeof currentSceneKey === 'string') {
                game.scene.stop(currentSceneKey);
            }
            game.scene.start(nextSceneKey);
        }
    }, [location.pathname, isGameLoading]);

    return (
        <div style={{ width: "100%", height: "calc(100vh - 150px)" }}>
            <div
                ref={gameRef}
                style={{
                    width: "100%",
                    height: "100%",
                    opacity: isPhaserCanvasVisible ? 1 : 0,
                    transition: 'opacity 0.2s ease-in-out',
                }}
            />
            {children}
        </div>
    );
};

export default StageTemplate;
