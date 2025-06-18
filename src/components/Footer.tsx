import { useEffect, useRef, useState } from 'react'
import { useGameStore } from '../store/gameStore'

export default function Footer({ isClear }: { isClear: boolean }) {
    const isGameStart = useGameStore(state => state.isGameStart);
    const volume = useGameStore(state => state.volume);
    const setVolume = useGameStore(state => state.setVolume);

    const [playTimer, setPlayTimer] = useState<number>(0)
    const timerRef = useRef<NodeJS.Timeout | null>(null)

    useEffect(() => {
        if (isGameStart && !isClear) {
            timerRef.current = setInterval(() => {
                setPlayTimer(prev => prev + 1)
            }, 1000)
        } else {
            if (timerRef.current) clearInterval(timerRef.current)
            setPlayTimer(0) // 게임 끝나거나 클리어되면 타이머 초기화 옵션
        }
        return () => {
            if (timerRef.current) clearInterval(timerRef.current)
        }
    }, [isGameStart, isClear])

    const formatTime = (sec: number) => {
        const m = String(Math.floor(sec / 60)).padStart(2, '0')
        const s = String(sec % 60).padStart(2, '0')
        return `${m}:${s}`
    }

    const handleVolumeChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        setVolume(Number(e.target.value))
    }

    return (
        <div className="side-box">
            {isGameStart && <>
                <div>
                    {volume === 0 ? <label>🔇</label> : <label>🔊</label>}
                    <input
                        type="range"
                        min={0}
                        max={100}
                        value={volume}
                        onChange={handleVolumeChange}
                    />
                </div>
                <div>
                    <label>타이머: {formatTime(playTimer)}</label>
                </div>
            </>}
        </div>
    )
}
