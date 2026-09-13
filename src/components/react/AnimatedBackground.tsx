import { useEffect, useRef } from 'react';

const AnimatedBackground: React.FC = () => {
  const blur1Ref = useRef<HTMLDivElement>(null);
  const blur2Ref = useRef<HTMLDivElement>(null);
  const blur3Ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const blurElements = [blur1Ref.current, blur2Ref.current, blur3Ref.current].filter(Boolean);
    if (!blurElements.length) return;

    // 每个球的漂移基准位与正弦振荡参数：幅度 ax/ay（px）、周期 tx/ty（s）、相位
    // X/Y 周期互质错开，轨迹不重复；三球相位不同步，避免齐动
    const configs = [
      { x: -150, y: -100, ax: 130, ay: 90, tx: 14, ty: 11, px: 0.0, py: 1.3 },
      { x: 100, y: 50, ax: 150, ay: 80, tx: 17, ty: 13, px: 2.1, py: 0.4 },
      { x: -50, y: 120, ax: 110, ay: 120, tx: 12, ty: 16, px: 4.2, py: 2.6 },
    ];

    let raf = 0;
    const start = performance.now();
    const animate = (now: number) => {
      const t = (now - start) / 1000;
      blurElements.forEach((blur, i) => {
        const c = configs[i];
        const x = c.x + c.ax * Math.sin((2 * Math.PI * t) / c.tx + c.px);
        const y = c.y + c.ay * Math.sin((2 * Math.PI * t) / c.ty + c.py);
        blur.style.transform = `translate(${x}px, ${y}px)`;
      });
      raf = requestAnimationFrame(animate);
    };
    raf = requestAnimationFrame(animate);
    return () => cancelAnimationFrame(raf);
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
