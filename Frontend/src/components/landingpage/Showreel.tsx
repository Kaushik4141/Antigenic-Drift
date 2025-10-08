import React, { useEffect } from 'react';
import { gsap } from 'gsap';

const Showreel: React.FC = () => {
  useEffect(() => {
    if (window.matchMedia("(min-width: 1024px)").matches) {
      const tl = gsap.timeline({
        scrollTrigger: {
          trigger: '.parent',
          start: 'top top',
          end: 'bottom bottom',
          scrub: 2,
        }
      });

      tl.to('.showreel h1', {
        scale: '0',
      }, 'a')
      .to('.showreel video', {
        scale: '1',
      }, 'a');
    }
  }, []);

  return (
    <div className="parent w-full h-[fit-content] lg:h-[250vh] bg-[#0D0D0D] relative">
      <div className="showreel w-full h-[90vh] md:h-screen lg:sticky top-0 flex flex-col items-center justify-center">
        <div className="top-blur absolute w-full h-[134px] pointer-events-none top-[-133px] left-0"></div>
        
        <h1 className="syne text-[36px] md:text-[80px] lg:text-[140px] font-bold leading-[1em] text-transparent mb-[15px] md:mb-[10px] lg:mb-[0] lg:absolute top-0">
  Antigenic Drift
</h1>

        <video 
          autoPlay 
          muted 
          loop 
          className="w-[95%] h-[60vh] md:h-full rounded-[50px] object-cover object-center"
          src="/Public/AI_Video_Predicting_Viral_Antigenic_Drift.mp4"
        />
      </div>
    </div>
  );
};

export default Showreel;