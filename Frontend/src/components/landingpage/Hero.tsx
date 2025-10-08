import React, { useEffect } from 'react';
import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';

gsap.registerPlugin(ScrollTrigger);

const Hero: React.FC = () => {
  useEffect(() => {
    if (window.matchMedia("(min-width: 1024px)").matches) {
      gsap.to('.hero', {
        rotateX: '-45deg',
        scale: '0.7',
        scrollTrigger: {
          trigger: '.hero',
          start: 'top top',
          scrub: true,
        }
      });
    }
  }, []);

  return (
    <div id="top" className="hero relative w-full h-screen flex flex-col items-center justify-center perspective-midrange overflow-hidden">
      {/* Background Video */}
      <video
        autoPlay
        loop
        muted
        playsInline
        className="absolute inset-0 w-full h-full object-cover"
      >
        <source src="/public/WhatsApp Video 2025-10-08 at 02.37.04_fd6a77cc.mp4" type="video/mp4" />
        Your browser does not support the video tag.
      </video>

      {/* Dark Overlay */}
      <div className="absolute inset-0 bg-gray-900 bg-opacity-60"></div>

      {/* Content */}
      <div className="relative z-10 flex flex-col items-center justify-center text-center px-4">
        <h1 className="syne text-[30px] md:text-[50px] lg:text-[70px] font-bold text-white leading-[1em] w-[85%] lg:w-[80%]">
          AI for Predicting Antigenic Drift in Emerging Viruses
        </h1>
        <p className="inter text-[16px] md:text-[17px] leading-[1.5em] text-white mt-[10px] mb-[25px] w-[75%] md:w-[60%] lg:w-[45%]">
          Harnessing Machine Learning and Deep Sequencing Data to anticipate viral evolution and inform prophylactic strategies against future pandemics.
        </p>
        <button className="syne hover-btn text-[14px] md:text-[16px] font-bold leading-[1em] text-white rounded-[50px] py-[17px] px-[33px] cursor-pointer flex items-center gap-[8px] relative">
          <div className="red-circle w-[12px] h-[12px] bg-[#FF000D] rounded-full"></div>
          <span>Let's predict</span>
        </button>
      </div>
    </div>
  );
};

export default Hero;
