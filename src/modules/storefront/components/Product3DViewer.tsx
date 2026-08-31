// src/modules/storefront/components/Product3DViewer.tsx
// Viewer 3D con CSS 3D perspective + mouse drag rotation
// Soporta múltiples fotos en diferentes ángulos simulando rotación 3D
import React, { useCallback, useRef, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { RotateCcw, ZoomIn, ZoomOut } from 'lucide-react';

interface Product3DViewerProps {
  images: string[];
  productName: string;
}


const getClosestAngleIdx = (angle: number, total: number): number => {
  const step = 360 / total;
  const normalized = ((angle % 360) + 360) % 360;
  return Math.round(normalized / step) % total;
};

export const Product3DViewer: React.FC<Product3DViewerProps> = ({ images, productName }) => {
  const [activeIdx, setActiveIdx] = useState(0);
  const [rotateY, setRotateY] = useState(0);
  const [isDragging, setIsDragging] = useState(false);
  const [zoom, setZoom] = useState(1);
  const dragStart = useRef<{ x: number; angle: number } | null>(null);
  const stageRef = useRef<HTMLDivElement>(null);

  const handleMouseDown = useCallback((e: React.MouseEvent) => {
    setIsDragging(true);
    dragStart.current = { x: e.clientX, angle: rotateY };
    e.preventDefault();
  }, [rotateY]);

  const handleMouseMove = useCallback((e: React.MouseEvent) => {
    if (!isDragging || !dragStart.current) return;
    const delta = e.clientX - dragStart.current.x;
    const newAngle = dragStart.current.angle + delta * 0.5;
    setRotateY(newAngle);
    // Map angle to available image index
    const newIdx = getClosestAngleIdx(newAngle, images.length);
    setActiveIdx(newIdx);
  }, [isDragging, images.length]);

  const handleMouseUp = useCallback(() => {
    setIsDragging(false);
    dragStart.current = null;
  }, []);

  // Touch support
  const handleTouchStart = useCallback((e: React.TouchEvent) => {
    setIsDragging(true);
    dragStart.current = { x: e.touches[0].clientX, angle: rotateY };
  }, [rotateY]);

  const handleTouchMove = useCallback((e: React.TouchEvent) => {
    if (!isDragging || !dragStart.current) return;
    const delta = e.touches[0].clientX - dragStart.current.x;
    const newAngle = dragStart.current.angle + delta * 0.5;
    setRotateY(newAngle);
    const newIdx = getClosestAngleIdx(newAngle, images.length);
    setActiveIdx(newIdx);
  }, [isDragging, images.length]);

  const handleTouchEnd = useCallback(() => {
    setIsDragging(false);
    dragStart.current = null;
  }, []);

  const resetView = () => { setRotateY(0); setActiveIdx(0); setZoom(1); };

  return (
    <div className="flex flex-col gap-4">
      {/* Main Viewer Stage */}
      <div
        ref={stageRef}
        className="sf-viewer-stage relative overflow-hidden rounded-sm select-none"
        style={{
          background: 'var(--sf-stone)',
          aspectRatio: '1/1',
          cursor: isDragging ? 'grabbing' : 'grab',
        }}
        onMouseDown={handleMouseDown}
        onMouseMove={handleMouseMove}
        onMouseUp={handleMouseUp}
        onMouseLeave={handleMouseUp}
        onTouchStart={handleTouchStart}
        onTouchMove={handleTouchMove}
        onTouchEnd={handleTouchEnd}
        role="img"
        aria-label={`Vista 3D de ${productName}. Arrastra para rotar.`}
      >
        <AnimatePresence mode="sync">
          <motion.img
            key={activeIdx}
            src={images[activeIdx]}
            alt={`${productName} — ángulo ${activeIdx + 1}`}
            className="w-full h-full object-contain p-6 pointer-events-none"
            style={{ scale: zoom }}
            initial={{ opacity: 0.6 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.1 }}
            draggable={false}
          />
        </AnimatePresence>

        {/* Drag hint — disappears after first interaction */}
        {!isDragging && rotateY === 0 && (
          <div
            className="absolute bottom-4 left-1/2 -translate-x-1/2 flex items-center gap-1.5 px-3 py-1.5 rounded-full text-[10px] font-medium pointer-events-none"
            style={{ background: 'rgba(26,26,24,0.6)', color: 'white', letterSpacing: '0.05em' }}
          >
            <span>↔</span>
            <span>ARRASTRA PARA ROTAR</span>
          </div>
        )}

        {/* Controls */}
        <div className="absolute top-3 right-3 flex flex-col gap-1.5">
          <button
            onClick={() => setZoom(z => Math.min(z + 0.25, 2))}
            className="w-8 h-8 bg-white/90 rounded-full flex items-center justify-center hover:bg-white transition-colors"
            aria-label="Acercar"
          >
            <ZoomIn className="w-3.5 h-3.5" style={{ color: 'var(--sf-charcoal)' }} />
          </button>
          <button
            onClick={() => setZoom(z => Math.max(z - 0.25, 0.75))}
            className="w-8 h-8 bg-white/90 rounded-full flex items-center justify-center hover:bg-white transition-colors"
            aria-label="Alejar"
          >
            <ZoomOut className="w-3.5 h-3.5" style={{ color: 'var(--sf-charcoal)' }} />
          </button>
          <button
            onClick={resetView}
            className="w-8 h-8 bg-white/90 rounded-full flex items-center justify-center hover:bg-white transition-colors"
            aria-label="Restablecer vista"
          >
            <RotateCcw className="w-3.5 h-3.5" style={{ color: 'var(--sf-charcoal)' }} />
          </button>
        </div>
      </div>

      {/* Thumbnail Strip — angle selectors */}
      {images.length > 1 && (
        <div className="flex gap-2 overflow-x-auto pb-1">
          {images.map((img, i) => (
            <button
              key={i}
              onClick={() => { setActiveIdx(i); setRotateY(i * (360 / images.length)); }}
              className="flex-shrink-0 w-16 h-16 overflow-hidden rounded-sm border-2 transition-all duration-200"
              style={{
                borderColor: i === activeIdx ? 'var(--sf-charcoal)' : 'var(--sf-stone)',
              }}
              aria-label={`Ángulo ${i + 1}`}
            >
              <img src={img} alt="" className="w-full h-full object-cover" />
            </button>
          ))}
        </div>
      )}

      {/* Angle indicator bar */}
      {images.length > 1 && (
        <div className="flex items-center gap-1.5">
          <span className="sf-label" style={{ fontSize: '10px' }}>Ángulo</span>
          <div className="flex gap-1 flex-1">
            {images.map((_, i) => (
              <div
                key={i}
                className="h-0.5 flex-1 rounded-full transition-all duration-200"
                style={{ background: i === activeIdx ? 'var(--sf-charcoal)' : 'var(--sf-stone-strong)' }}
              />
            ))}
          </div>
        </div>
      )}
    </div>
  );
};
