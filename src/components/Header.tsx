import { useNavigate } from "react-router-dom";
import { useGameStore } from "../store/gameStore";


export default function Header() {


    const { isGameStart, setIsGameStart, stageCount, deathCount } = useGameStore();

    const navigate = useNavigate();

    const mainMove = () => {
        navigate("/");
        setIsGameStart(false);
    }


    return (
        <div className="side-box">
            {isGameStart &&
                <>
                    <button onClick={mainMove}>메인화면</button>
                    <p>{stageCount}/10</p>
                    <p>사망 : {deathCount}</p>
                </>
            }

        </div>
    )
}