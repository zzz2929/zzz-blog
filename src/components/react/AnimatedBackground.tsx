import { useEffect, useRef } from 'react';

const AnimatedBackground: React.FC = () => {
  const blur1Ref = useRef<HTMLDivElement>(null);
  const blur2Ref = useRef<HTMLDivElement>(null);
  const blur3Ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const blurElements = [blur1Ref.current, blur2Ref.current, blur3Ref.current].filter(Boolean);

    const randomX = (direction = 1) => (Math.random() * 120 - 60) * direction;
    const randomY = (direction = 1) => (Math.random() * 100 - 50) * direction;
    const randomTime = () => Math.random() * 6 + 6;
    const randomTime2 = () => Math.random() * 1 + 5;
    const randomAngle = (direction = 1) => (Math.random() * 180 - 30) * direction;

    // Spread blobs to different quadrants so they don't stack
    const initialPositions = [
      { x: -150, y: -100 },
      { x: 100, y: 50 },
      { x: -50, y: 120 },
    ];

    blurElements.forEach((blur, i) => {
      if (blur) {
        const pos = initialPositions[i];
        blur.style.transform = `translate(${pos.x + randomX(1)}px, ${pos.y + randomY(1)}px) rotate(${randomAngle(-1)}deg)`;
      }
    });

    const rotate = (target: HTMLElement, direction: number) => {
      const duration = randomTime2() * 1000;
      const angle = randomAngle(direction);

      const startTime = performance.now();
      const startAngle = parseFloat(target.style.transform.split('rotate(')[1]?.split('deg')[0] || '0');

      const animateRotation = (timestamp: number) => {
        const elapsed = timestamp - startTime;
        const progress = Math.min(elapsed / duration, 1);
        const easing = -(Math.cos(Math.PI * progress) - 1) / 2;
        const currentAngle = startAngle + (angle - startAngle) * easing;

        const transform = target.style.transform;
        const translateMatch = transform.match(/translate\((.*?),(.*?)\)/);
        const translateX = translateMatch ? translateMatch[1] : '0px';
        const translateY = translateMatch ? translateMatch[2] : '0px';

        target.style.transform = `translate(${translateX}, ${translateY}) rotate(${currentAngle}deg)`;

        if (progress < 1) {
          requestAnimationFrame(animateRotation);
        } else {
          setTimeout(() => rotate(target, direction * -1), 0);
        }
      };

      requestAnimationFrame(animateRotation);
    };

    const moveX = (target: HTMLElement, direction: number) => {
      const duration = randomTime() * 1000;
      const targetX = randomX(direction);

      const startTime = performance.now();
      const transform = target.style.transform;
      const translateMatch = transform.match(/translate\((.*?),(.*?)\)/);
      const startX = parseFloat(translateMatch ? translateMatch[1] : '0');
      const currentY = translateMatch ? translateMatch[2] : '0px';

      const animateX = (timestamp: number) => {
        const elapsed = timestamp - startTime;
        const progress = Math.min(elapsed / duration, 1);
        const easing = -(Math.cos(Math.PI * progress) - 1) / 2;
        const currentX = startX + (targetX - startX) * easing;

        const rotateMatch = transform.match(/rotate\((.*?)deg\)/);
        const rotation = rotateMatch ? rotateMatch[1] : '0';

        target.style.transform = `translate(${currentX}px, ${currentY}) rotate(${rotation}deg)`;

        if (progress < 1) {
          requestAnimationFrame(animateX);
        } else {
          setTimeout(() => moveX(target, direction * -1), 0);
        }
      };

      requestAnimationFrame(animateX);
    };

    const moveY = (target: HTMLElement, direction: number) => {
      const duration = randomTime() * 1000;
      const targetY = randomY(direction);

      const startTime = performance.now();
      const transform = target.style.transform;
      const translateMatch = transform.match(/translate\((.*?),(.*?)\)/);
      const currentX = translateMatch ? translateMatch[1] : '0px';
      const startY = parseFloat(translateMatch ? translateMatch[2] : '0');

      const animateY = (timestamp: number) => {
        const elapsed = timestamp - startTime;
        const progress = Math.min(elapsed / duration, 1);
        const easing = -(Math.cos(Math.PI * progress) - 1) / 2;
        const currentY = startY + (targetY - startY) * easing;

        const rotateMatch = transform.match(/rotate\((.*?)deg\)/);
        const rotation = rotateMatch ? rotateMatch[1] : '0';

        target.style.transform = `translate(${currentX}, ${currentY}px) rotate(${rotation}deg)`;

        if (progress < 1) {
          requestAnimationFrame(animateY);
        } else {
          setTimeout(() => moveY(target, direction * -1), 0);
        }
      };

      requestAnimationFrame(animateY);
    };

    blurElements.forEach((blur) => {
      if (blur) {
        moveX(blur, 1);
        moveY(blur, -1);
        rotate(blur, 1);
      }
    });
  }, []);

  return (
    <section className="wrapper">
      <div ref={blur1Ref} className="blur"></div>
      <div ref={blur2Ref} className="blur"></div>
      <div ref={blur3Ref} className="blur"></div>
    </section>
  );
};

export { AnimatedBackground };
