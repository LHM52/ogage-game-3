import { useEffect, useRef } from "react";
import { useGameStore } from "../store/gameStore";
import bgm from '../assets/bgm.mp3';

export default function BGM() {
    const volume = useGameStore((state) => state.volume);
    const playBGM = useGameStore((state) => state.playBGM);
    const audioRef = useRef<HTMLAudioElement>(null);

    useEffect(() => {
        if (playBGM) {
            audioRef.current?.play();
        }
    }, [playBGM]);

    useEffect(() => {
        if (audioRef.current) {
            audioRef.current.volume = volume / 100;
        }
    }, [volume]);

    return (
        <audio
            ref={audioRef}
            src={bgm}
            autoPlay={false}
            loop
            hidden
        />
    );
}