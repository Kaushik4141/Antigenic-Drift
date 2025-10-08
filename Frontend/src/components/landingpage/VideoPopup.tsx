import React, { useEffect } from 'react';
import { gsap } from 'gsap';
import { X, ChevronLeft, ChevronRight } from 'lucide-react';

interface VideoPopupProps {
  videos: Array<{
    id: number;
    title: string;
    company: string;
    videoUrl: string;
  }>;
  currentIndex: number;
  onClose: () => void;
  onNavigate: (index: number) => void;
}

const VideoPopup: React.FC<VideoPopupProps> = ({ videos, currentIndex, onClose, onNavigate }) => {
  useEffect(() => {
    // Hide navigation
    const nav = document.querySelector('nav') as HTMLElement;
    if (nav) nav.style.display = 'none';

    // Prevent body scroll
    document.body.classList.add('overflow-hidden');

    // Animation entrance
    const overlay = document.querySelector('.popup-overlay') as HTMLElement;
    const content = document.querySelector('.popup-content') as HTMLElement;
    const closeBtn = document.querySelector('.close-btn') as HTMLElement;
    const navControls = document.querySelector('.nav-controls') as HTMLElement;

    if (overlay && content && closeBtn && navControls) {
      gsap.set(overlay, { opacity: 0 });
      gsap.set([closeBtn, navControls], { opacity: 0 });

      gsap.to(overlay, { opacity: 1, duration: 0.5 });
      gsap.to(content, {
        scale: 1,
        duration: 0.6,
        ease: "power2.out",
        onComplete: () => {
          gsap.to([closeBtn, navControls], { opacity: 1, duration: 0.3 });
        }
      });
    }

    // Keyboard controls
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
      else if (e.key === 'ArrowLeft') navigatePrev();
      else if (e.key === 'ArrowRight') navigateNext();
    };

    document.addEventListener('keydown', handleKeyDown);

    return () => {
      // Cleanup
      if (nav) nav.style.display = 'flex';
      document.body.classList.remove('overflow-hidden');
      document.removeEventListener('keydown', handleKeyDown);
    };
  }, []);

  const navigatePrev = () => {
    if (currentIndex > 0) {
      onNavigate(currentIndex - 1);
    }
  };

  const navigateNext = () => {
    if (currentIndex < videos.length - 1) {
      onNavigate(currentIndex + 1);
    }
  };

  const handleClose = () => {
    const overlay = document.querySelector('.popup-overlay') as HTMLElement;
    const content = document.querySelector('.popup-content') as HTMLElement;
    const closeBtn = document.querySelector('.close-btn') as HTMLElement;
    const navControls = document.querySelector('.nav-controls') as HTMLElement;

    gsap.to([navControls, closeBtn], { opacity: 0, duration: 0.3 });
    gsap.to(overlay, { 
      opacity: 0, 
      duration: 0.5,
      onComplete: onClose
    });
  };

  return (
    <div className="popup-overlay fixed top-0 left-0 w-full h-full bg-black bg-opacity-90 z-50 flex items-center justify-center">
      <div className="popup-content relative w-[80vw] h-[90vh] rounded-3xl overflow-hidden">
        <video 
          autoPlay 
          loop 
          controls 
          className="w-full h-full object-cover object-center"
          src={videos[currentIndex].videoUrl}
        />
      </div>

      <button 
        className="close-btn absolute top-[7.5%] right-[6%] md:right-[12%] z-[9] w-10 h-10 md:w-14 md:h-14 rounded-full flex items-center justify-center transition-all duration-300 bg-[#0d0d0d33] backdrop-blur-md"
        onClick={handleClose}
      >
        <X className="w-6 h-6 text-white" />
      </button>

      <div className="nav-controls w-[90vw] md:w-[75vw] absolute top-[50%] left-[50%] -translate-x-[50%] -translate-y-[50%] flex justify-between gap-8 z-10">
        <button 
          className={`prev-btn w-12 h-12 rounded-full flex items-center justify-center transition-all duration-300 bg-[#0d0d0d33] backdrop-blur-md ${currentIndex === 0 ? 'opacity-40 cursor-not-allowed' : ''}`}
          onClick={navigatePrev}
        >
          <ChevronLeft className="w-6 h-6 text-white" />
        </button>

        <button 
          className={`next-btn w-12 h-12 rounded-full flex items-center justify-center transition-all duration-300 bg-[#0d0d0d33] backdrop-blur-md ${currentIndex === videos.length - 1 ? 'opacity-40 cursor-not-allowed' : ''}`}
          onClick={navigateNext}
        >
          <ChevronRight className="w-6 h-6 text-white" />
        </button>
      </div>
    </div>
  );
};

export default VideoPopup;