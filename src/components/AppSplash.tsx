import { useEffect, useState } from 'react';

import { APP_LOGO, APP_LOGO_FALLBACK } from '@/lib/brand';
import { preloadCriticalImages } from '@/lib/preload';
import CachedImage from '@/components/CachedImage';
const WAVE_IMG_URL = '/ui/loading-wave.png';

/* Supplied Skypay loading screen: decorated background, then the translucent logo card. */
const CSS = `
.hkl { --white:#ffffff; --ink:#5d6467; --mint:#53aa8e; --blue:#689afa; --yellow:#edce68;
  --unit: min(0.266666667vw, 0.125svh);
  --hkl-bg: radial-gradient(ellipse at 19% 10%, #d9eeec 0%, transparent 46%), radial-gradient(ellipse at 92% 20%, #e0e9f8 0%, transparent 52%), radial-gradient(ellipse at 72% 85%, #f6efdc 0%, transparent 43%), linear-gradient(155deg, #e6f7fa 0%, #f6f8fa 51%, #fdfbf0 100%);
  position:fixed; inset:0; z-index:100; isolation:isolate; width:100%; height:100svh; overflow:hidden; background:var(--hkl-bg); font-family:Roboto,-apple-system,BlinkMacSystemFont,"Segoe UI",Arial,sans-serif; }
.hkl *, .hkl *::before, .hkl *::after { box-sizing:border-box; }
.hkl img { display:block; max-width:100%; object-fit:contain; user-select:none; -webkit-user-drag:none; }
.hkl .onboarding { position:absolute; inset:0; z-index:1; display:grid; place-items:center; overflow:hidden; background:var(--hkl-bg); }
.hkl .corner-wave { position:absolute; top:8.1%; right:calc(-2 * var(--unit)); width:calc(116 * var(--unit)); height:calc(313 * var(--unit)); overflow:hidden; opacity:1; pointer-events:none; }
.hkl .corner-wave img { position:absolute; top:calc(-36 * var(--unit)); right:calc(-102 * var(--unit)); width:calc(375 * var(--unit)); height:calc(375 * var(--unit)); max-width:none; }
.hkl .decorations { position:absolute; inset:0; opacity:1; pointer-events:none; }
.hkl .decoration { position:absolute; left:var(--x); top:var(--y); width:calc(var(--size) * var(--unit)); height:calc(var(--size) * var(--unit)); border-radius:50%; background:var(--color); opacity:var(--opacity, 0.75); animation:hkl-ball-float var(--duration, 6s) ease-in-out var(--delay, 0s) infinite; }
.hkl .decoration.line { height:calc(2.8 * var(--unit)); border-radius:999px; }
.hkl .decoration.line { animation-name:hkl-line-drift; }
.hkl .decoration.dashed { height:calc(1.5 * var(--unit)); border-radius:0; background:repeating-linear-gradient(90deg, var(--color) 0 calc(4 * var(--unit)), transparent calc(4 * var(--unit)) calc(7 * var(--unit))); }
.hkl .card-entrance { position:relative; display:grid; place-items:center; margin-top:calc(-8 * var(--unit)); opacity:0; }
.hkl .card-float { animation:hkl-card-float 6.5s ease-in-out 1400ms infinite; }
.hkl .feature-card { position:relative; display:grid; place-items:center; width:calc(315 * var(--unit)); height:calc(210 * var(--unit)); border:1px solid rgb(255 255 255 / 90%); border-radius:calc(20 * var(--unit)); background:rgb(255 255 255 / 75%); box-shadow:0 calc(24 * var(--unit)) calc(44 * var(--unit)) calc(-9 * var(--unit)) rgb(37 50 60 / 17%), 0 calc(2 * var(--unit)) calc(4 * var(--unit)) rgb(37 50 60 / 3%); transform:rotate(-15deg); }
.hkl .card-texture, .hkl .card-fold { position:absolute; inset:0; overflow:hidden; border-radius:inherit; pointer-events:none; }
.hkl .card-texture { background-image:radial-gradient(#84aeb9 0.6px, transparent 0.8px); background-size:calc(7 * var(--unit)) calc(7 * var(--unit)); opacity:0.1; mask-image:linear-gradient(135deg, #000, transparent 62%); }
.hkl .card-fold::before, .hkl .card-fold::after { position:absolute; inset:0; content:""; }
.hkl .card-fold::before { background:#f8efd0; opacity:0.88; clip-path:polygon(74% 0, 100% 0, 100% 35%); }
.hkl .card-fold::after { background:#eaf2fc; opacity:0.47; clip-path:polygon(91% 0, 100% 0, 100% 50%); }
.hkl .logo-tile { position:relative; z-index:1; display:grid; place-items:center; width:calc(115 * var(--unit)); height:calc(115 * var(--unit)); padding:0; border:0; border-radius:calc(24 * var(--unit)); background:transparent; box-shadow:0 calc(12 * var(--unit)) calc(25 * var(--unit)) rgb(31 41 54 / 20%); transform:rotate(15deg); }
.hkl .logo-tile img { width:100%; height:100%; border-radius:calc(24 * var(--unit)); object-fit:cover; }
.hkl:not([data-phase="splash"]) .card-entrance { animation:hkl-card-enter 850ms cubic-bezier(0.16, 1, 0.3, 1) 300ms both; }
@keyframes hkl-card-enter { 0% { opacity:0; transform:translateY(calc(24 * var(--unit))) scale(0.78); } 65% { opacity:1; transform:translateY(calc(-3 * var(--unit))) scale(1.018); } 100% { opacity:1; transform:translateY(0) scale(1); } }
@keyframes hkl-card-float { 0%, 100% { transform:translateY(0); } 50% { transform:translateY(calc(-5 * var(--unit))); } }
@keyframes hkl-ball-float { 0%, 100% { transform:translateY(calc(4 * var(--unit))); } 50% { transform:translateY(calc(-7 * var(--unit))); } }
@keyframes hkl-line-drift { 0%, 100% { transform:translateX(calc(4 * var(--unit))); } 50% { transform:translateX(calc(-7 * var(--unit))); } }
@media (prefers-reduced-motion: reduce) {
  .hkl *, .hkl *::before, .hkl *::after { animation:none !important; }
  .hkl:not([data-phase="splash"]) .card-entrance { opacity:1; }
}
`;

const DECORATIONS: Array<{ cls?: string; style: Record<string, string> }> = [
  { style: { '--x': '28.3%', '--y': '43.6%', '--size': '18', '--color': 'var(--mint)', '--duration': '6.8s', '--delay': '-1s' } },
  { style: { '--x': '70.2%', '--y': '45.3%', '--size': '11', '--color': 'var(--blue)', '--duration': '5.6s', '--delay': '-2.8s' } },
  { style: { '--x': '78.1%', '--y': '55.1%', '--size': '14', '--color': 'var(--mint)', '--duration': '7.2s', '--delay': '-3.5s' } },
  { style: { '--x': '32.2%', '--y': '58.7%', '--size': '9', '--color': 'var(--yellow)', '--duration': '5.8s', '--delay': '-1.7s' } },
  { cls: 'line', style: { '--x': '19.5%', '--y': '63.1%', '--size': '43', '--color': 'var(--mint)', '--duration': '6.2s', '--delay': '-2.2s' } },
  { cls: 'line', style: { '--x': '23.6%', '--y': '67%', '--size': '29', '--color': 'var(--mint)', '--duration': '7s', '--delay': '-0.7s' } },
  { cls: 'line', style: { '--x': '27.4%', '--y': '70.9%', '--size': '20', '--color': 'var(--mint)', '--opacity': '0.62', '--duration': '6.5s', '--delay': '-3.2s' } },
  { cls: 'dashed', style: { '--x': '19%', '--y': '35.8%', '--size': '18', '--color': 'var(--blue)', '--opacity': '0.16', '--duration': '8s', '--delay': '-4s' } },
  { style: { '--x': '60.5%', '--y': '30.7%', '--size': '3', '--color': 'var(--yellow)', '--opacity': '0.35', '--duration': '7s', '--delay': '-2s' } },
];

/** Brief branded intro on a cold launch; app data continues loading in parallel. */
const SPLASH_DURATION = 900;
const REVEAL_DURATION = 900;
/** Total time of the full intro (spinner splash + onboarding reveal). */
export const SPLASH_TOTAL_DURATION = SPLASH_DURATION + REVEAL_DURATION;

export default function AppSplash({ onFinish }: { onFinish?: () => void }) {
  const [phase, setPhase] = useState<'splash' | 'revealing' | 'ready'>('splash');

  useEffect(() => {
    let alive = true;
    const t1 = window.setTimeout(() => setPhase('revealing'), SPLASH_DURATION);
    const t2 = window.setTimeout(() => setPhase('ready'), SPLASH_DURATION + REVEAL_DURATION);

    // Warm images independently. Slow downloads must never hold the splash open.
    void preloadCriticalImages().catch(() => undefined);
    const finishTimer = window.setTimeout(() => {
      if (alive && onFinish) onFinish();
    }, SPLASH_TOTAL_DURATION);

    return () => {
      alive = false;
      window.clearTimeout(t1);
      window.clearTimeout(t2);
      window.clearTimeout(finishTimer);
    };
  }, [onFinish]);

  return (
    <main className="hkl" data-phase={phase} aria-label="Loading Skypay" aria-busy={phase !== 'ready'}>
      <style dangerouslySetInnerHTML={{ __html: CSS }} />
      <section className="onboarding" aria-label="Welcome to Skypay">
        <div className="corner-wave" aria-hidden="true">
          <img src={WAVE_IMG_URL} alt="" draggable={false} />
        </div>
        <div className="decorations" aria-hidden="true">
          {DECORATIONS.map((d, i) => (
            <span
              key={i}
              className={`decoration${d.cls ? ` ${d.cls}` : ''}`}
              style={d.style as React.CSSProperties}
            />
          ))}
        </div>
        <div className="card-entrance">
          <div className="card-float">
            <div className="feature-card">
              <div className="card-texture" aria-hidden="true" />
              <div className="card-fold" aria-hidden="true" />
              <div className="logo-tile">
                <CachedImage src={APP_LOGO} fallbackSrc={APP_LOGO_FALLBACK} cacheKey="app-logo-v2" alt="Skypay" draggable={false} />
              </div>
            </div>
          </div>
        </div>
      </section>
    </main>
  );
}
