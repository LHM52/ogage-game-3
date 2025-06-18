import { useNavigate } from "react-router-dom";
import { useGameStore } from "../store/gameStore";



export default function Header() {


    const { isGameStart,setStageCount , setIsGameStart, stageCount, deathCount } = useGameStore();

    const navigate = useNavigate();

    const mainMove = () => {
        navigate("/");
        setIsGameStart(false);
        setStageCount(1);
    }


    return (
        <div className="side-box">
            {isGameStart &&
                <>
                    <button onClick={mainMove} className="go-main-button">메인화면</button>
                    <p>{stageCount}/5</p>
                    <p>사망 : {deathCount}</p>
                </>
            }

        </div>
    )
}