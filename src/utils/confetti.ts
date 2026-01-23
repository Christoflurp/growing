import confetti from "canvas-confetti";

export function fireConfetti() {
  const duration = 3000;
  const end = Date.now() + duration;

  const colors = ["#4ade80", "#22c55e", "#16a34a", "#fbbf24", "#f59e0b"];

  (function frame() {
    confetti({
      particleCount: 3,
      angle: 60,
      spread: 55,
      origin: { x: 0, y: 0.7 },
      colors,
    });
    confetti({
      particleCount: 3,
      angle: 120,
      spread: 55,
      origin: { x: 1, y: 0.7 },
      colors,
    });

    if (Date.now() < end) {
      requestAnimationFrame(frame);
    }
  })();

  setTimeout(() => {
    confetti({
      particleCount: 150,
      spread: 100,
      origin: { y: 0.6 },
      colors,
    });
  }, 500);
}
