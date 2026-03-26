'use client';

import { useEffect, useMemo, useRef, useState } from 'react';

// Character splitting definitions
const TITLE_LINES = [
  { text: 'Find your', italic: false, baseDelay: 0.65 },
  { text: 'forever', italic: true, baseDelay: 1.1 },
  { text: 'companion.', italic: false, baseDelay: 1.55 }
];

const MAN_STR = "Every animal carries a whole world of trust in its eyes.  Will you be their world too?";

export default function Home() {
  const [isMounted, setIsMounted] = useState(false);
  
  // Create an array for manifesto characters
  const manCharsArr = useMemo(() => MAN_STR.split(''), []);

  useEffect(() => {
    setIsMounted(true);
    
    // Constants calculated on mount to ensure VH is accurate
    const VH = window.innerHeight;
    const VW = window.innerWidth;

    const S = {
      heroH: VH,
      scBudget: VH * 5,
      hzBudget: VH * 3,
      manBudget: VH * 2,
      howH: VH,
      ctaH: VH,
      ftH: 160
    };

    const T = {
      hero: 0,
      sc: VH,
      hz: VH + S.scBudget + VH,
      man: VH + S.scBudget + VH + S.hzBudget + VH * 0.5,
      how: VH + S.scBudget + VH + S.hzBudget + VH * 0.5 + S.manBudget,
      cta: VH + S.scBudget + VH + S.hzBudget + VH * 0.5 + S.manBudget + VH,
      ft: VH + S.scBudget + VH + S.hzBudget + VH * 0.5 + S.manBudget + VH * 2
    };

    const TOTAL = T.ft + S.ftH + VH * 0.5;
    const MAX = TOTAL - VH;

    // Apply strict heights and tops to sections
    const setStyle = (id: string, top: number, height?: number) => {
      const el = document.getElementById(id);
      if (el) {
        el.style.top = top + 'px';
        if (height !== undefined) el.style.height = height + 'px';
      }
    };

    setStyle('showcase-wrap', T.sc, S.scBudget + VH);
    setStyle('horiz-wrap', T.hz, S.hzBudget + VH);
    setStyle('man-wrap', T.man, S.manBudget);
    setStyle('how', T.how);
    setStyle('cta', T.cta);
    setStyle('ft', T.ft);

    // Scroll engine variables
    let tY = 0, sY = 0;
    let rX = 0, rY = 0, cX = 0, cY = 0;
    let frameId: number;

    const lerp = (a: number, b: number, t: number) => a + (b - a) * t;
    const clamp = (v: number, mn: number, mx: number) => Math.min(Math.max(v, mn), mx);
    const ease3 = (t: number) => 1 - Math.pow(1 - t, 3);

    // Event Listeners
    const onWheel = (e: WheelEvent) => {
      e.preventDefault();
      tY = clamp(tY + e.deltaY, 0, MAX);
    };

    let tStart = 0;
    const onTouchStart = (e: TouchEvent) => {
      tStart = e.touches[0].clientY;
    };
    const onTouchMove = (e: TouchEvent) => {
      e.preventDefault();
      const d = tStart - e.touches[0].clientY;
      tStart = e.touches[0].clientY;
      tY = clamp(tY + d * 1.8, 0, MAX);
    };

    const onKeyDown = (e: KeyboardEvent) => {
      const step = VH;
      if (['ArrowDown', 'PageDown', ' '].includes(e.key)) {
        tY = clamp(tY + step, 0, MAX);
      }
      if (['ArrowUp', 'PageUp'].includes(e.key)) {
        tY = clamp(tY - step, 0, MAX);
      }
      if (e.key === 'Home') tY = 0;
      if (e.key === 'End') tY = MAX;
    };

    document.addEventListener('wheel', onWheel, { passive: false });
    document.addEventListener('touchstart', onTouchStart, { passive: true });
    document.addEventListener('touchmove', onTouchMove, { passive: false });
    document.addEventListener('keydown', onKeyDown);

    // Cursor tracking
    const cur = document.getElementById('cur');
    const curRing = document.getElementById('cur-ring');
    const onMouseMove = (e: MouseEvent) => {
      cX = e.clientX;
      cY = e.clientY;
    };
    document.addEventListener('mousemove', onMouseMove);

    // Hover effects for cursor
    const hoverElements = document.querySelectorAll('button, a, .lcard, .pc-btn');
    const onEnter = () => {
      if (cur && curRing) {
        cur.style.width = '16px'; cur.style.height = '16px';
        curRing.style.width = '56px'; curRing.style.height = '56px';
      }
    };
    const onLeave = () => {
      if (cur && curRing) {
        cur.style.width = '7px'; cur.style.height = '7px';
        curRing.style.width = '34px'; curRing.style.height = '34px';
      }
    };
    hoverElements.forEach(el => {
      el.addEventListener('mouseenter', onEnter);
      el.addEventListener('mouseleave', onLeave);
    });

    // Sub-elements cache for requestAnimationFrame to avoid DOM lookups
    const scroller = document.getElementById('scroller');
    const progFill = document.getElementById('prog-fill');
    const scrollPct = document.getElementById('scroll-pct');
    const scPin = document.getElementById('showcase-pin');
    const hzPin = document.getElementById('horiz-pin');
    const hzTrack = document.getElementById('horiz-track');
    const manPin = document.getElementById('man-pin');
    const bgWord = document.querySelector('.sc-bg-word') as HTMLElement;
    const heroTl = document.getElementById('hero-title');
    const heroSub = document.querySelector('.hero-sub') as HTMLElement;
    const heroGlow = document.querySelector('.hero-glow') as HTMLElement;
    const scFill = document.getElementById('sc-fill');
    const scLbl = document.getElementById('sc-lbl');
    const horizPct = document.getElementById('horiz-pct');
    const horizHdr = document.getElementById('horiz-hdr');
    
    // Arrays of elements
    const mChars = document.querySelectorAll('.mc');
    const dots = document.querySelectorAll('.sdot');
    
    let activeDot = 0;
    const setDot = (i: number) => {
      if (i === activeDot) return;
      activeDot = i;
      dots.forEach((d, j) => d.classList.toggle('on', j === i));
    };

    const tick = () => {
      sY = lerp(sY, tY, 0.082);
      const MathSy = sY;

      if (scroller) scroller.style.transform = `translateY(${-MathSy}px)`;

      rX = lerp(rX, cX, 0.1);
      rY = lerp(rY, cY, 0.1);
      if (cur) { cur.style.left = cX + 'px'; cur.style.top = cY + 'px'; }
      if (curRing) { curRing.style.left = rX + 'px'; curRing.style.top = rY + 'px'; }

      const pct = MathSy / MAX;
      if (progFill) progFill.style.height = (pct * 100) + '%';
      if (scrollPct) scrollPct.textContent = Math.round(pct * 100) + '%';

      // HERO PARALLAX
      if (MathSy < VH * 2) {
        const p = MathSy / VH;
        if (heroTl) heroTl.style.transform = `translateY(${p * VH * 0.22}px) scale(${1 - p * 0.08})`;
        if (heroSub) heroSub.style.transform = `translateY(${p * VH * 0.3}px)`;
        if (heroGlow) heroGlow.style.transform = `scale(${1 + p * 0.4})`;
        if (MathSy < VH * 1.2) setDot(0);
      }

      // SHOWCASE PINNING + 3D CARDS
      const scStart = T.sc;
      const scEnd = T.sc + S.scBudget;

      if (MathSy >= scStart && MathSy <= scEnd + VH) {
        const pinY = clamp(MathSy - scStart, 0, S.scBudget);
        if (scPin) scPin.style.transform = `translateY(${pinY}px)`;

        if (MathSy >= scStart && MathSy <= scEnd) {
          setDot(1);
          const rawP = (MathSy - scStart) / S.scBudget;
          const cardP = rawP * 4;

          if (bgWord) bgWord.style.transform = `translateX(${-(rawP * 160)}px)`;
          if (scFill) scFill.style.width = (rawP * 100) + '%';

          for (let i = 0; i < 4; i++) {
            const card = document.getElementById(`pc${i}`);
            if (!card) continue;

            const lp = cardP - i;
            let op, ry, tz, tx, sc;

            if (lp < -0.35) {
              op = 0; ry = 55; tz = -500; tx = 180; sc = 0.75;
            } else if (lp < 0) {
              const e = ease3((lp + 0.35) / 0.35);
              op = e; ry = 55 * (1 - e); tz = -500 * (1 - e); tx = 180 * (1 - e); sc = 0.75 + 0.25 * e;
              if (scLbl) scLbl.textContent = `0${i + 1} / 04`;
            } else if (lp < 0.7) {
              const e = lp / 0.7;
              op = 1; ry = e * -4; tz = 0; tx = 0; sc = 1;
              if (scLbl) scLbl.textContent = `0${i + 1} / 04`;
            } else if (lp < 1) {
              const e = ease3((lp - 0.7) / 0.3);
              op = 1 - e; ry = -55 * e; tz = -500 * e; tx = -180 * e; sc = 1 - 0.25 * e;
            } else {
              op = 0; ry = -55; tz = -500; tx = -180; sc = 0.75;
            }

            card.style.opacity = Math.max(0, Math.min(1, op)).toString();
            card.style.transform = `perspective(1200px) rotateY(${ry}deg) translateZ(${tz}px) translateX(${tx}px) scale(${sc})`;
            card.style.pointerEvents = op > 0.5 ? 'auto' : 'none';
          }
        }
      } else {
        const p2 = MathSy < scStart ? 0 : S.scBudget;
        if (scPin) scPin.style.transform = `translateY(${p2}px)`;
      }

      // HORIZONTAL GALLERY PINNING
      const hzStart = T.hz;
      const hzEnd = T.hz + S.hzBudget;

      if (MathSy >= hzStart - VH * 0.1 && MathSy <= hzEnd + VH) {
        const hzPinY = clamp(MathSy - hzStart, 0, S.hzBudget);
        if (hzPin) hzPin.style.transform = `translateY(${hzPinY}px)`;

        if (MathSy >= hzStart && MathSy <= hzEnd) {
          setDot(2);
          const hzP = (MathSy - hzStart) / S.hzBudget;
          const maxSlide = (hzTrack?.scrollWidth || VW) - VW;
          if (hzTrack) hzTrack.style.transform = `translateY(-50%) translateX(${-hzP * maxSlide}px)`;
          if (horizPct) horizPct.textContent = Math.round(hzP * 100) + '%';
          if (horizHdr) horizHdr.style.opacity = (1 - hzP * 2).toString();
        }
      } else {
        const c2 = MathSy < hzStart ? 0 : S.hzBudget;
        if (hzPin) hzPin.style.transform = `translateY(${c2}px)`;
      }

      // MANIFESTO PINNING
      const manStart = T.man;
      const manEnd = T.man + S.manBudget;

      if (MathSy >= manStart && MathSy <= manEnd + VH) {
        const manPinY = clamp(MathSy - manStart, 0, S.manBudget - VH);
        if (manPin) manPin.style.transform = `translateY(${manPinY}px)`;

        if (MathSy >= manStart && MathSy <= manEnd) {
          setDot(3);
          const mp = (MathSy - manStart) / S.manBudget;
          const litCount = Math.floor(mp * mChars.length * 1.15);
          mChars.forEach((c, i) => c.classList.toggle('lit', i < litCount));
        }
      }

      // HOW / CTA reveals
      const howTrig = T.how - VH * 0.35;
      document.getElementById('how-lft')?.classList.toggle('on', MathSy >= howTrig);
      document.getElementById('how-rgt')?.classList.toggle('on', MathSy >= howTrig);

      const ctaTrig = T.cta - VH * 0.4;
      document.getElementById('cta-tag')?.classList.toggle('on', MathSy >= ctaTrig);
      document.getElementById('cta-h')?.classList.toggle('on', MathSy >= ctaTrig);
      document.getElementById('cta-sub')?.classList.toggle('on', MathSy >= ctaTrig);
      document.getElementById('cta-btns')?.classList.toggle('on', MathSy >= ctaTrig);

      if (MathSy >= T.cta - VH) setDot(4);
      if (MathSy >= T.how - VH * 0.5 && MathSy < T.cta) setDot(3);

      frameId = requestAnimationFrame(tick);
    };

    tick();

    return () => {
      document.removeEventListener('wheel', onWheel);
      document.removeEventListener('touchstart', onTouchStart);
      document.removeEventListener('touchmove', onTouchMove);
      document.removeEventListener('keydown', onKeyDown);
      document.removeEventListener('mousemove', onMouseMove);
      
      hoverElements.forEach(el => {
        el.removeEventListener('mouseenter', onEnter);
        el.removeEventListener('mouseleave', onLeave);
      });
      
      cancelAnimationFrame(frameId);
    };
  }, []);

  return (
    <>
      {/* Cursor */}
      <div id="cur" style={{ display: isMounted ? 'block' : 'none' }}></div>
      <div id="cur-ring" style={{ display: isMounted ? 'block' : 'none' }}></div>

      {/* Progress */}
      <div id="prog"><div id="prog-fill"></div></div>
      <div id="scroll-pct" style={{ opacity: isMounted ? 1 : 0 }}>0%</div>

      {/* Dots */}
      <div className="side-dots">
        <div className="sdot on" data-s="0"></div>
        <div className="sdot" data-s="1"></div>
        <div className="sdot" data-s="2"></div>
        <div className="sdot" data-s="3"></div>
        <div className="sdot" data-s="4"></div>
      </div>

      <div id="app" style={{ opacity: isMounted ? 1 : 0, transition: 'opacity 0.5s' }}>
        <nav>
          <div className="logo">Paw<span>Found</span></div>
          <div className="nav-r">
            <ul className="nav-links">
              <li><a href="#">Adopt</a></li>
              <li><a href="#">List a Pet</a></li>
              <li><a href="#">Stories</a></li>
            </ul>
            <button className="nav-btn">Begin</button>
          </div>
        </nav>

        <div id="scroller">
          
          {/* HERO */}
          <div id="hero">
            <div className="hero-glow"></div>
            <div className="hero-grain"></div>
            <div className="hero-pre">India's Most Loved Pet Adoption Platform</div>
            <h1 id="hero-title">
              {TITLE_LINES.map((line, lIndex) => (
                <div key={lIndex} className={`ln ${line.italic ? 'italic-line' : ''}`}>
                  <span className="word">
                    {line.text.split('').map((c, cIndex) => (
                      <span 
                        key={cIndex} 
                        className="ch" 
                        style={{ animationDelay: `${line.baseDelay + cIndex * 0.045}s` }}
                      >
                        {c === ' ' ? '\u00A0' : c}
                      </span>
                    ))}
                  </span>
                </div>
              ))}
            </h1>
            <p className="hero-sub">
              Every heartbeat that wanders has a home.<br />
              Yours just hasn't found them yet.
            </p>
            <div className="hero-scroll-cue">
              <span className="scroll-txt">Scroll to discover</span>
              <div className="scroll-stem"></div>
            </div>
          </div>

          {/* SHOWCASE */}
          <div id="showcase-wrap">
            <div id="showcase-pin">
              <div className="sc-bg-word">ADOPT</div>
              <div className="sc-side">
                <span className="sc-side-label">Featured</span>
                <span className="sc-side-vert">Waiting for You</span>
              </div>
              
              <div className="pet-card" id="pc0">
                <div className="pc-img">🐕</div>
                <div className="pc-body">
                  <div className="pc-name">Bruno</div>
                  <div className="pc-meta">Labrador · Male · 2 yrs · Mumbai</div>
                  <div className="pc-story">A gentle giant who has been waiting 8 months. He loves morning runs, belly rubs, and quiet evenings by your side.</div>
                  <button className="pc-btn">Meet Bruno →</button>
                </div>
              </div>
              
              <div className="pet-card" id="pc1">
                <div className="pc-img">🐈</div>
                <div className="pc-body">
                  <div className="pc-name">Luna</div>
                  <div className="pc-meta">Persian Mix · Female · 1 yr · Delhi</div>
                  <div className="pc-story">Found on a cold rooftop, now warm and healed. Luna fills silence with soft purrs and fills emptiness with presence.</div>
                  <button className="pc-btn">Meet Luna →</button>
                </div>
              </div>

              <div className="pet-card" id="pc2">
                <div className="pc-img">🐇</div>
                <div className="pc-body">
                  <div className="pc-name">Mochi</div>
                  <div className="pc-meta">Holland Lop · Female · 8 mo · Bengaluru</div>
                  <div className="pc-story">Tiny ears. Enormous personality. Mochi does binkies when she's happy — and she's happy most of the time. You will be too.</div>
                  <button className="pc-btn">Meet Mochi →</button>
                </div>
              </div>

              <div className="pet-card" id="pc3">
                <div className="pc-img">🐩</div>
                <div className="pc-body">
                  <div className="pc-name">Bella</div>
                  <div className="pc-meta">Poodle Mix · Female · 4 yrs · Chennai</div>
                  <div className="pc-story">Street-rescue turned sweetheart. Bella asks for nothing but your presence, and gives everything — absolutely everything — in return.</div>
                  <button className="pc-btn">Meet Bella →</button>
                </div>
              </div>

              <div className="sc-bottom">
                <div className="sc-bar"><div className="sc-bar-fill" id="sc-fill"></div></div>
                <div className="sc-lbl" id="sc-lbl">01 / 04</div>
              </div>
            </div>
          </div>

          {/* HORIZONTAL GALLERY */}
          <div id="horiz-wrap">
            <div id="horiz-pin">
              <div className="horiz-hdr" id="horiz-hdr">
                <h2>All pets <em>available</em><br/>right now</h2>
                <p>850+ companions across 120 cities in India</p>
              </div>
              <div className="horiz-track" id="horiz-track">
                {/* Lcards */}
                {[
                  { m: '🐕', n: 'Bruno', b: 'Labrador · Male · 2 years', t: ['Vaccinated', 'Neutered', 'Kid-friendly'], c: 'Mumbai, Maharashtra' },
                  { m: '🐈', n: 'Luna', b: 'Persian Mix · Female · 1 year', t: ['Spayed', 'House-trained'], c: 'Delhi, NCR' },
                  { m: '🐇', n: 'Mochi', b: 'Holland Lop · Female · 8 months', t: ['Neutered', 'Litter-trained'], c: 'Bengaluru, Karnataka' },
                  { m: '🐓', n: 'Kiwi', b: 'African Grey · Male · 3 years', t: ['Trained', 'Talks'], c: 'Hyderabad, Telangana' },
                  { m: '🐩', n: 'Bella', b: 'Poodle Mix · Female · 4 years', t: ['Rescued', 'Gentle'], c: 'Chennai, Tamil Nadu' },
                  { m: '🐱', n: 'Simba', b: 'Indian Shorthair · Male · 6 mo', t: ['Kitten', 'Playful', 'Vaccinated'], c: 'Pune, Maharashtra' },
                  { m: '🦜', n: 'Rio', b: 'Alexandrine Parrot · Female · 2y', t: ['Tame', 'Bonded'], c: 'Kolkata, WB' }
                ].map((pet, i) => (
                  <div key={i} className="lcard">
                    <div className="lc-img">{pet.m}</div>
                    <div className="lc-body">
                      <div className="lc-name">{pet.n}</div>
                      <div className="lc-breed">{pet.b}</div>
                      <div className="lc-tags">
                        {pet.t.map(t => <span key={t} className="lc-tag">{t}</span>)}
                      </div>
                      <div className="lc-city">📍 {pet.c}</div>
                    </div>
                  </div>
                ))}
              </div>
              <div className="horiz-pct" id="horiz-pct">—</div>
            </div>
          </div>

          {/* MANIFESTO */}
          <div id="man-wrap">
            <div id="man-pin">
              <div className="man-bg"></div>
              <div className="man-pre">The Truth About Adoption</div>
              <div id="man-text">
                {manCharsArr.map((c, i) => {
                  if (c === ' ' || c === '\u00A0') return <span key={i}>&nbsp;</span>;
                  return <span key={i} className="mc">{c}</span>;
                })}
              </div>
            </div>
          </div>

          {/* HOW IT WORKS */}
          <div id="how">
            <div className="how-grid">
              <div className="how-lft" id="how-lft">
                <div className="how-tag">The Process</div>
                <h2 className="how-h">Simple as<br/><em>falling in love</em></h2>
              </div>
              <div className="how-rgt" id="how-rgt">
                <div className="how-steps">
                  {[
                    { n: '01', h: 'Browse & Discover', p: 'Filter by species, age, temperament, city. Our smart matching surfaces companions that genuinely fit your life.' },
                    { n: '02', h: 'Connect & Meet', p: 'Reach out directly to the lister. No middlemen. Arrange a meet, ask every question, trust your instincts.' },
                    { n: '03', h: 'Bring Them Home', p: 'Complete the adoption. Our community supports every step of the transition — from first night to forever.' }
                  ].map((s, i) => (
                    <div key={i} className="how-step">
                      <div className="hs-num">{s.n}</div>
                      <div className="hs-body">
                        <h3>{s.h}</h3>
                        <p>{s.p}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>

          {/* CTA */}
          <div id="cta">
            <div className="cta-inner">
              <div className="cta-tag" id="cta-tag">50,000+ Happy Families Across India</div>
              <h2 className="cta-h" id="cta-h">Are you<br/><em>next?</em></h2>
              <p className="cta-sub" id="cta-sub">
                A companion is waiting for you right now.<br/>
                Their whole life changes the moment you say yes.
              </p>
              <div className="cta-btns" id="cta-btns">
                <a href="#" className="btn-a">Find Your Pet</a>
                <a href="#" className="btn-g">List a Pet</a>
              </div>
            </div>
          </div>

          {/* FOOTER */}
          <footer id="ft">
            <div className="ft-logo">Paw<span>Found</span></div>
            <div className="ft-links">
              <a href="#">Adopt</a>
              <a href="#">List</a>
              <a href="#">Stories</a>
              <a href="#">About</a>
            </div>
            <div className="ft-copy">© 2025 PawFound — Made with 🐾 in India</div>
          </footer>

        </div>
      </div>
    </>
  );
}
