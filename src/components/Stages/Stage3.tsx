
import { useNavigate } from "react-router-dom";
import { useRequireGameStart } from "../../hooks/useRequireGameStart";
import StageTemplate from "./StageTemplate";
import { useGameStore } from "../../store/gameStore";
import { playNextSound } from "../../store/soundManager";
import { useEffect, useState } from "react";

export default function Stage3() { 
    const navigate = useNavigate();
    useRequireGameStart();

    const stageCount = useGameStore((state) => state.stageCount); 

    const [isCleared, setIsCleared] = useState(false);

    useEffect(() => {
        if (stageCount === 4) {
            setIsCleared(true);

            const soundTimer = setTimeout(() => {
                playNextSound();
            }, 1);

            const navigateTimer = setTimeout(() => {
                setIsCleared(false);
                navigate('/stage/4');
            }, 2000);

            return () => {
                clearTimeout(soundTimer);
                clearTimeout(navigateTimer);
            };
        }
    }, [stageCount, navigate]);





    return (
        <>
            <StageTemplate />
            {isCleared && (
                <div className="clear-screen">
                    클리어!
                </div>
            )}
        </>
    );
}