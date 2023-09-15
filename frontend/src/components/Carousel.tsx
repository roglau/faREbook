import React, { useState } from 'react';
import { FiChevronLeft, FiChevronRight } from 'react-icons/fi';
import './Carousel.css';

interface MediaCarouselProps {
  media: string[];
}

const MediaCarousel: React.FC<MediaCarouselProps> = ({ media }) => {
  const [currentSlide, setCurrentSlide] = useState(0);

  const nextSlide = () => {
    setCurrentSlide((prevSlide) => (prevSlide + 1) % media.length);
  };

  const prevSlide = () => {
    setCurrentSlide((prevSlide) => (prevSlide - 1 + media.length) % media.length);
  };

  return (
    <div className="media-carousel">
      <div className="carousel-content">
        { media.length > 1 && (<button className="carousel-arrow left" onClick={prevSlide}>
          <FiChevronLeft />
        </button>)}
        <div className="carousel-slide-con">
          {media.map((mediaItem, index) => (
            <div
              key={index}
              className={`slide ${index === currentSlide ? 'active' : ''}`}
            >
              {mediaItem.includes('image') ? (
                <div className='carousel-img'>
                  <img src={mediaItem} alt={`Slide ${index}`} />
                </div>
              ) : (
                <div className='carousel-vid'>
                  <video controls>
                    <source src={mediaItem} />
                  </video>
                </div>
              )}
            </div>
          ))}
        </div>
        {media.length > 1 && (<button className="carousel-arrow right" onClick={nextSlide}>
          <FiChevronRight />
        </button>)}
      </div>
    </div>
  );
};

export default MediaCarousel;
