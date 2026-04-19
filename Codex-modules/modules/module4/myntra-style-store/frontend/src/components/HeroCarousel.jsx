import { useEffect, useRef, useState } from "react";
import { getNextSlideIndex, getPreviousSlideIndex } from "../storefront";

function HeroCarousel({ slides, statusLabel }) {
  const [currentSlideIndex, setCurrentSlideIndex] = useState(0);
  const pointerStartRef = useRef(null);

  useEffect(() => {
    if (slides.length < 2) {
      return undefined;
    }

    const intervalId = window.setInterval(() => {
      setCurrentSlideIndex((index) => getNextSlideIndex(index, slides.length));
    }, 4000);

    return () => window.clearInterval(intervalId);
  }, [slides.length]);

  const currentSlide = slides[currentSlideIndex];

  const showNextSlide = () => {
    setCurrentSlideIndex((index) => getNextSlideIndex(index, slides.length));
  };

  const showPreviousSlide = () => {
    setCurrentSlideIndex((index) => getPreviousSlideIndex(index, slides.length));
  };

  const handlePointerDown = (event) => {
    pointerStartRef.current = event.clientX;
  };

  const handlePointerUp = (event) => {
    if (pointerStartRef.current === null) {
      return;
    }

    const delta = event.clientX - pointerStartRef.current;
    pointerStartRef.current = null;

    if (Math.abs(delta) < 40) {
      return;
    }

    if (delta < 0) {
      showNextSlide();
    } else {
      showPreviousSlide();
    }
  };

  return (
    <section className="hero" id="collections">
      <div
        className="hero-carousel"
        onPointerDown={handlePointerDown}
        onPointerUp={handlePointerUp}
      >
        <img
          className="hero-carousel-image"
          src={currentSlide.image}
          alt={currentSlide.title}
        />
        <div className="hero-carousel-overlay">
          <p className="eyebrow">{currentSlide.eyebrow}</p>
          <h1>{currentSlide.title}</h1>
          <p className="hero-description">{currentSlide.description}</p>
          <div className="hero-actions">
            <button className="primary-btn" type="button">
              {currentSlide.cta}
            </button>
            <button className="ghost-btn" type="button">
              View festival offers
            </button>
          </div>
          <div className="hero-highlights">
            <span>{currentSlide.accent}</span>
            <span>{statusLabel}</span>
          </div>
        </div>
        <div className="hero-controls">
          <button
            type="button"
            className="hero-arrow"
            aria-label="Previous slide"
            onClick={showPreviousSlide}
          >
            ‹
          </button>
          <button
            type="button"
            className="hero-arrow"
            aria-label="Next slide"
            onClick={showNextSlide}
          >
            ›
          </button>
        </div>
        <div className="hero-page-control" aria-label="Hero slide selectors">
          {slides.map((slide, index) => (
            <button
              key={slide.id}
              type="button"
              className={index === currentSlideIndex ? "dot active" : "dot"}
              onClick={() => setCurrentSlideIndex(index)}
              aria-label={`Go to slide ${index + 1}`}
            />
          ))}
        </div>
      </div>
      <div className="hero-panel">
        <div className="hero-panel-card">
          <p className="small">Festival pulse</p>
          <strong>Akshaya Tritiya style edit</strong>
          <p className="small">{statusLabel}</p>
          <p className="small">Auto-rotates every 4 seconds with swipe and arrow support.</p>
        </div>
      </div>
    </section>
  );
}

export default HeroCarousel;
