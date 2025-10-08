import React, { useEffect } from 'react';
import { gsap } from 'gsap';
import { ChevronUp } from 'lucide-react';

const ScrollButton: React.FC = () => {
  useEffect(() => {
    const scrollBtn = document.getElementById('scroll-btn');
    
    const handleScroll = () => {
      if (window.scrollY > 10) {
        gsap.to("#scroll-btn", {
          opacity: 1,
          bottom: "5%",
          duration: 0.3,
          ease: "ease"
        });
      } else {
        gsap.to("#scroll-btn", {
          opacity: 0,
          bottom: "1%",
          duration: 0.3,
          ease: "ease"
        });
      }
    };

    window.addEventListener('scroll', handleScroll);
    
    return () => {
      window.removeEventListener('scroll', handleScroll);
    };
  }, []);

  const scrollToTop = () => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  return (
    <a 
      href="#top" 
      id="scroll-btn" 
      className="flex items-center justify-center h-[40px] w-[40px] z-[99] fixed right-[3%] bottom-[3%] opacity-0 backdrop-blur-md bg-gradient-to-br from-[rgba(255,255,255,0.1)] to-[rgba(255,255,255,0.11)] border-t-2 border-l-2 border-[rgba(255,255,255,0.5)] rounded-lg transition-all duration-350 overflow-hidden hover:before:scale-0"
      onClick={scrollToTop}
    >
      <div className="absolute top-0 left-0 w-full h-full bg-gradient-radial from-[rgb(255,122,59)] via-[rgb(237,153,29)] to-[rgb(9,93,93)] rounded-lg transition-all duration-350 pointer-events-none"></div>
      <ChevronUp className="relative w-5 h-5 text-white" />
    </a>
  );
};

export default ScrollButton;