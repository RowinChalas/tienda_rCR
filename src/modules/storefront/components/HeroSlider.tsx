// src/modules/storefront/components/HeroSlider.tsx
// Full-bleed editorial hero carousel con tipografía serif grande
import React, { useEffect, useState, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ArrowRight } from 'lucide-react';

interface HeroSlide {
  image: string;
  eyebrow: string;
  headline: string;
  subline: string;
  cta: string;
  onCta: () => void;
}

interface HeroSliderProps {
  slides: HeroSlide[];
}

const AUTOPLAY_MS = 5500;

export const HeroSlider: React.FC<HeroSliderProps> = ({ slides }) => {
  const [current, setCurrent] = useState(0);
  const [direction, setDirection] = useState(1);

  const go = useCallback((idx: number) => {
    setDirection(idx > current ? 1 : -1);
    setCurrent(idx);
  }, [current]);

  const next = useCallback(() => go((current + 1) % slides.length), [current, slides.length, go]);

  useEffect(() => {
    const t = setInterval(next, AUTOPLAY_MS);
    return () => clearInterval(t);
  }, [next]);

  const variants = {
    enter:  (d: number) => ({ opacity: 0, scale: 1.04, x: d > 0 ? 30 : -30 }),
    center: { opacity: 1, scale: 1, x: 0 },
    exit:   (d: number) => ({ opacity: 0, scale: 0.98, x: d > 0 ? -30 : 30 }),
  };

  return (
    <section className="relative w-full overflow-hidden" style={{ height: '88vh', minHeight: 540, maxHeight: 860 }}>
      {/* Slides */}
      <AnimatePresence initial={false} custom={direction} mode="sync">
        <motion.div
          key={current}
          custom={direction}
          variants={variants}
          initial="enter"
          animate="center"
          exit="exit"
          transition={{ duration: 0.75, ease: [0.16, 1, 0.3, 1] }}
          className="absolute inset-0"
        >
          <img
            src={slides[current].image}
            alt={slides[current].headline}
            className="w-full h-full object-cover"
          />
          {/* Gradient overlay for text readability */}
          <div className="absolute inset-0 bg-gradient-to-r from-black/55 via-black/20 to-transparent" />
        </motion.div>
      </AnimatePresence>

      {/* Text content */}
      <AnimatePresence mode="wait">
        <motion.div
          key={`text-${current}`}
          initial={{ opacity: 0, y: 32 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -16 }}
          transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1], delay: 0.15 }}
          className="absolute inset-0 flex flex-col justify-end pb-20 px-8 md:px-16 lg:px-24 max-w-3xl"
        >
          {/* Eyebrow */}
          <p
            className="text-white/70 mb-4"
            style={{ fontFamily: 'var(--font-ui)', fontSize: '0.7rem', fontWeight: 500, letterSpacing: '0.14em', textTransform: 'uppercase' }}
          >
            {slides[current].eyebrow}
          </p>

          {/* Headline — large editorial serif */}
          <h1
            className="text-white mb-4"
            style={{
              fontFamily: 'var(--font-editorial)',
              fontSize: 'clamp(2.8rem, 7vw, 6rem)',
              fontWeight: 300,
              lineHeight: 1.0,
              letterSpacing: '-0.02em',
            }}
          >
            {slides[current].headline}
          </h1>

          {/* Subline */}
          <p
            className="text-white/80 mb-8 max-w-md"
            style={{ fontFamily: 'var(--font-ui)', fontSize: '0.9375rem', fontWeight: 300, lineHeight: 1.6 }}
          >
            {slides[current].subline}
          </p>

          {/* CTA */}
          <div className="flex items-center gap-4">
            <button
              onClick={slides[current].onCta}
              className="group flex items-center gap-2 bg-white text-[var(--sf-charcoal)] text-sm font-medium px-7 py-3.5 rounded-sm transition-all hover:bg-[var(--sf-madera-pale)] active:scale-[0.98]"
              style={{ fontFamily: 'var(--font-ui)', letterSpacing: '0.03em' }}
            >
              {slides[current].cta}
              <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
            </button>
          </div>
        </motion.div>
      </AnimatePresence>

      {/* Progress dots */}
      <div className="absolute bottom-8 right-8 md:right-16 flex items-center gap-2">
        {slides.map((_, i) => (
          <button
            key={i}
            onClick={() => go(i)}
            aria-label={`Ir a slide ${i + 1}`}
            className="relative overflow-hidden rounded-full transition-all duration-300"
            style={{
              width: i === current ? 28 : 8,
              height: 8,
              background: i === current ? 'white' : 'rgba(255,255,255,0.4)',
            }}
          >
            {i === current && (
              <motion.div
                className="absolute inset-y-0 left-0 bg-white/50 rounded-full"
                initial={{ width: '0%' }}
                animate={{ width: '100%' }}
                transition={{ duration: AUTOPLAY_MS / 1000, ease: 'linear' }}
              />
            )}
          </button>
        ))}
        <span className="text-white/50 text-xs ml-2 font-mono">{current + 1} / {slides.length}</span>
      </div>
    </section>
  );
};
