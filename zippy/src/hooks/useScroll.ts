import { useState, useEffect } from "react";

/**
 * 스크롤 방향을 감지하는 훅
 * @returns "up" | "down"
 */
export function useScrollDirection() {
  const [scrollDirection, setScrollDirection] = useState<"up" | "down">("down");
  const [lastScrollY, setLastScrollY] = useState(0);

  useEffect(() => {
    const handleScroll = () => {
      const currentScrollY = window.scrollY;
      setScrollDirection(currentScrollY > lastScrollY ? "down" : "up");
      setLastScrollY(currentScrollY);
    };

    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, [lastScrollY]);

  return scrollDirection;
}

/**
 * 스크롤 방향에 따라 애니메이션을 다르게 적용하는 훅
 * @returns { initial, animate }
 */
export function useScrollAnimation(isInView: boolean) {
  const scrollDirection = useScrollDirection();

  return {
    initial: {
      opacity: 0,
      y: scrollDirection === "down" ? 60 : -60,
    },
    animate: isInView
      ? {
          opacity: [0, 0.8, 1],
          y: scrollDirection === "down" ? [60, -10, 0] : [-60, 10, 0],
          transition: { duration: 0.5, ease: "easeInOut" },
        }
      : {},
  };
}
