import { useEffect, useRef, useState } from 'react';

const stats = [
  { value: 9, suffix: '–12 %', label: 'Roční výnos', sub: 'historický průměr' },
  { value: 15000, suffix: '+', label: 'Aktivních investorů', sub: 'a stále roste' },
  { value: 1200, suffix: ' mil.', label: 'Kč vyplaceno', sub: 'investorům celkem' },
  { value: 400, suffix: '+', label: 'Úspěšných projektů', sub: 'financováno' },
];

function CountUp({ target, suffix }: { target: number; suffix: string }) {
  const [count, setCount] = useState(0);
  const ref = useRef<HTMLSpanElement>(null);
  const started = useRef(false);

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting && !started.current) {
          started.current = true;
          const duration = 1800;
          const steps = 50;
          const increment = target / steps;
          let current = 0;
          const timer = setInterval(() => {
            current += increment;
            if (current >= target) {
              setCount(target);
              clearInterval(timer);
            } else {
              setCount(Math.floor(current));
            }
          }, duration / steps);
        }
      },
      { threshold: 0.3 },
    );
    if (ref.current) observer.observe(ref.current);
    return () => observer.disconnect();
  }, [target]);

  return (
    <span ref={ref}>
      {count.toLocaleString('cs-CZ')}
      {suffix}
    </span>
  );
}

export function StatsSection() {
  return (
    <section className="py-20" style={{ background: 'var(--cp-navy)' }}>
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-12">
          <h2 className="text-2xl sm:text-3xl font-extrabold text-white">
            Čísla, která mluví za nás
          </h2>
        </div>
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-8">
          {stats.map((stat) => (
            <div key={stat.label} className="text-center">
              <div className="text-4xl sm:text-5xl font-extrabold mb-2 text-white">
                {stat.label === 'Roční výnos'
                  ? <span>9–12 %</span>
                  : <CountUp target={stat.value} suffix={stat.suffix} />
                }
              </div>
              <p className="font-semibold text-slate-200 mb-1">{stat.label}</p>
              <p className="text-xs text-slate-400">{stat.sub}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
