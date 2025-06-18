// src/components/Stage1.tsx
import { useNavigate } from "react-router-dom";
import { useRequireGameStart } from "../../hooks/useRequireGameStart";
import StageTemplate from "./StageTemplate";
import { useGameStore } from "../../store/gameStore";
import { useEffect, useState } from "react";

export default function Stage1() { // ⭐ 여기가 Stage1 컴포넌트입니다.
    const navigate = useNavigate();
    useRequireGameStart();

    const stageCount = useGameStore((state) => state.stageCount); // stageCount 구독

    const [isCleared, setIsCleared] = useState(false);

    useEffect(() => {
        if (stageCount === 2) {
            setIsCleared(true);

            const navigateTimer = setTimeout(() => {
                setIsCleared(false);
                navigate('/stage/2');
            }, 2000);

            return () => {
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