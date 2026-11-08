import React, { useState, useEffect } from 'react';
import { renderMarkdown } from '../../services/markdownParser';
import { ChevronLeft, ChevronRight, X } from 'lucide-react';

interface SlidesViewProps {
  content: string;
  designatedFolder: string;
  onClose: () => void;
}

export const SlidesView: React.FC<SlidesViewProps> = ({
  content,
  designatedFolder,
  onClose,
}) => {
  const slides = React.useMemo(() => {
    const rawSlides = content.split(/^---$/m).map((s) => s.trim()).filter(Boolean);
    return rawSlides.length > 0 ? rawSlides : [content];
  }, [content]);

  const [currentSlideIndex, setCurrentSlideIndex] = useState(0);

  const nextSlide = () => {
    setCurrentSlideIndex((prev) => Math.min(slides.length - 1, prev + 1));
  };

  const prevSlide = () => {
    setCurrentSlideIndex((prev) => Math.max(0, prev - 1));
  };

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'ArrowRight' || e.key === 'Space') {
        nextSlide();
      } else if (e.key === 'ArrowLeft') {
        prevSlide();
      } else if (e.key === 'Escape') {
        onClose();
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [slides.length, onClose]);

  const renderedCurrentSlide = React.useMemo(() => {
    return renderMarkdown(slides[currentSlideIndex] || '', designatedFolder);
  }, [slides, currentSlideIndex, designatedFolder]);

  return (
    <div className="relative flex-1 w-full h-full bg-[#16161e] flex flex-col justify-between p-12 overflow-hidden select-none">
      {/* Top Controls */}
      <div className="absolute top-4 right-4 flex items-center gap-2 z-20">
        <span className="text-xs font-mono text-[#565f89] px-2 py-1 bg-[#1f2335] rounded border border-[#24283b]">
          {currentSlideIndex + 1} / {slides.length}
        </span>
        <button
          onClick={onClose}
          className="p-1.5 rounded-full bg-[#1f2335] border border-[#24283b] text-[#565f89] hover:text-[#c0caf5] transition-colors"
          title="Exit Slides"
        >
          <X className="w-4 h-4" />
        </button>
      </div>

      {/* Main Slide Content */}
      <div className="flex-1 flex items-center justify-center p-8 max-w-4xl mx-auto w-full">
        <div
          className="prose prose-invert prose-lg max-w-none text-center selection:bg-[#3d59a1]/50 text-[#c0caf5]"
          dangerouslySetInnerHTML={{ __html: renderedCurrentSlide }}
        />
      </div>

      {/* Bottom Navigation */}
      <div className="flex items-center justify-center gap-4 z-20">
        <button
          onClick={prevSlide}
          disabled={currentSlideIndex === 0}
          className="p-2 rounded-full bg-[#1f2335] border border-[#24283b] text-[#c0caf5] disabled:opacity-30 disabled:cursor-not-allowed hover:bg-[#24283b] transition-colors"
          title="Previous Slide (Left Arrow)"
        >
          <ChevronLeft className="w-5 h-5" />
        </button>
        <div className="flex items-center gap-1">
          {slides.map((_, idx) => (
            <div
              key={idx}
              onClick={() => setCurrentSlideIndex(idx)}
              className={`h-1.5 rounded-full cursor-pointer transition-all ${
                idx === currentSlideIndex
                  ? 'w-6 bg-[#7aa2f7]'
                  : 'w-1.5 bg-[#414868] hover:bg-[#787c99]'
              }`}
            />
          ))}
        </div>
        <button
          onClick={nextSlide}
          disabled={currentSlideIndex === slides.length - 1}
          className="p-2 rounded-full bg-[#1f2335] border border-[#24283b] text-[#c0caf5] disabled:opacity-30 disabled:cursor-not-allowed hover:bg-[#24283b] transition-colors"
          title="Next Slide (Right Arrow / Space)"
        >
          <ChevronRight className="w-5 h-5" />
        </button>
      </div>
    </div>
  );
};
