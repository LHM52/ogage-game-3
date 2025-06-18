
import { useNavigate } from "react-router-dom";
import { useRequireGameStart } from "../../hooks/useRequireGameStart";
import StageTemplate from "./StageTemplate";
import { useGameStore } from "../../store/gameStore";
import { useEffect, useState } from "react";

export default function Stage3() { 
    const navigate = useNavigate();
    useRequireGameStart();

    const stageCount = useGameStore((state) => state.stageCount); 

    const [isCleared, setIsCleared] = useState(false);

    useEffect(() => {
        if (stageCount === 5) {
            setIsCleared(true);


            const navigateTimer = setTimeout(() => {
                setIsCleared(false);
                navigate('/AllClear');
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