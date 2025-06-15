import { useGameStore } from '../store/gameStore';
import { useNavigate } from 'react-router-dom';

export function MainPage() {
    const { setIsGameStart, setPlayBGM } = useGameStore();
    const navigate = useNavigate();

    const gameStart = () => {
        setIsGameStart(true);
        setPlayBGM(true); // BGM 재생 요청
        navigate(`stage/1`);
    }

    return (
        <>
            <div className="game-container">
                <div className='main-buttons'>
                    <button onClick={gameStart}>게임시작</button>
                    <button>게임방법</button>
                    <button>랭킹</button>
                </div>
            </div>
        </>
    )
}
