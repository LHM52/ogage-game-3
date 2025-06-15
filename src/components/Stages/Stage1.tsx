import { useNavigate } from "react-router-dom";
import { useRequireGameStart } from "../../hooks/useRequireGameStart";
import StageTemplate from "./StageTemplate";
import { useGameStore } from "../../store/gameStore";


const stage1Scene: Phaser.Types.Scenes.SettingsConfig = {

};

export default function Stage1() {
    const navigate = useNavigate();
    useRequireGameStart();
    const stageCount = useGameStore((state) => state.stageCount);
    const setStageCount = useGameStore((state) => state.setStageCount);


    const handleClear = () => {
        navigate("/stage/2");
        setStageCount(stageCount + 1);
    };

    return (
        <StageTemplate scene={stage1Scene}>
            {/* <button onClick={handleClear}>클리어</button> */}
        </StageTemplate>
    );
}