import { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useGameStore } from "../store/gameStore";

export function useRequireGameStart() {
  const isGameStart = useGameStore((state) => state.isGameStart);
  const navigate = useNavigate();

  useEffect(() => {
    if (!isGameStart) {
      navigate("/");
    }
  }, [isGameStart, navigate]);
}