import { useEffect, useRef, useState } from 'react'
import { useGameStore } from '../store/gameStore'
import type { FooterProps } from '../@types/types'

export default function Footer({ isPlaying, isClear }: FooterProps) {
    const { isGameStart, volume, setVolume } = useGameStore()
    const [playTimer, setPlayTimer] = useState<number>(0)
    const timerRef = useRef<NodeJS.Timeout | null>(null)

    // 게임 시작/종료, 올클리어에 따라 타이머 제어
    useEffect(() => {
        if (isPlaying && !isClear) {
            timerRef.current = setInterval(() => {
                setPlayTimer(prev => prev + 1)
            }, 1000)
        } else {
            if (timerRef.current) clearInterval(timerRef.current)
        }
        if (isClear) {
            if (timerRef.current) clearInterval(timerRef.current)
        }
        return () => {
            if (timerRef.current) clearInterval(timerRef.current)
        }
    }, [isPlaying, isClear])

    // 시간 포맷 (mm:ss)
    const formatTime = (sec: number) => {
        const m = String(Math.floor(sec / 60)).padStart(2, '0')
        const s = String(sec % 60).padStart(2, '0')
        return `${m}:${s}`
    }

    // 음량 조절
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