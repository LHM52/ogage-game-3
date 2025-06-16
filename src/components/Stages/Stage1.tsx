import { useNavigate } from "react-router-dom";
import { useRequireGameStart } from "../../hooks/useRequireGameStart";
import StageTemplate from "./StageTemplate";
import { Stage1Scene } from "../../Scene/Stage1Scene";

export default function Stage1() {
    const navigate = useNavigate();
    useRequireGameStart();

    const handleClear = () => {
        navigate("/stage/2");
    };
    return (
        <StageTemplate scene={Stage1Scene} />
    );
}