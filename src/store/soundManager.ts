// src/utils/soundManager.ts
import nextSoundSrc from "../../public/assets/sounds/Next_Level.mp3";

const nextSound = new Audio(nextSoundSrc);
nextSound.volume = 0.3;

export function playNextSound() {
    nextSound.currentTime = 0;
    nextSound.play();
}

export function stopNextSound() {
    nextSound.pause();
    nextSound.currentTime = 0;
}
