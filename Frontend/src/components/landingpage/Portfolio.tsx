import React, { useEffect, useState } from 'react';
import { gsap } from 'gsap';
import VideoPopup from './VideoPopup';

interface PortfolioItem {
  id: number;
  title: string;
  company: string;
  videoUrl: string;
}

const Portfolio: React.FC = () => {
  const [showPopup, setShowPopup] = useState(false);
  const [currentVideo, setCurrentVideo] = useState(0);

  const portfolioItems: PortfolioItem[] = [
    {
      id: 1,
      title: "GreenWaves",
      company: "Eco-Warriors",
      videoUrl: "https://framerusercontent.com/assets/t3oWwHTiHPdqvISgXglF9dJecA.mp4"
    },
    {
      id: 2,
      title: "Mystic Horizons",
      company: "ModeElite",
      videoUrl: "https://framerusercontent.com/assets/t3oWwHTiHPdqvISgXglF9dJecA.mp4"
    },
    {
      id: 3,
      title: "Pixel Fusion",
      company: "Techno",
      videoUrl: "https://framerusercontent.com/assets/t3oWwHTiHPdqvISgXglF9dJecA.mp4"
    },
    {
      id: 4,
      title: "EcoExplorer",
      company: "GreenEarth",
      videoUrl: "https://framerusercontent.com/assets/t3oWwHTiHPdqvISgXglF9dJecA.mp4"
    },
    
  ];

  useEffect(() => {
    if (window.matchMedia("(min-width: 1024px)").matches) {
      gsap.to('.portfolio-parent .portfolio-cards', {
        x: '-40%',
        scrollTrigger: {
          trigger: '.portfolio-parent',
          start: 'top top',
          end: 'bottom bottom',
          scrub: 2,
        }
      });

      // Portfolio card cursor effects
      const cards = document.querySelectorAll('.portfolio-cards .card');

      cards.forEach((card, index) => {
        const cursor = card.querySelector('.card-cursor') as HTMLElement;
        const video = card.querySelector('video') as HTMLVideoElement;
        
        card.addEventListener('mouseenter', () => {
          if (video) video.play();
          
          gsap.to(cursor, {
            opacity: 1,
          });
        });

        card.addEventListener('mousemove', (event: any) => {
          const rect = card.getBoundingClientRect();
          const cursorSize = 115 / 2;
          
          const x = event.clientX - rect.left - cursorSize;
          const y = event.clientY - rect.top - cursorSize;

          gsap.to(cursor, {
            top: `${y}px`,
            left: `${x}px`,
            ease: "ease"
          });
        });

        card.addEventListener('mouseleave', () => {
          if (video) video.pause();
          
          gsap.to(cursor, {
            opacity: 0,
          });
        });
      });
    }
  }, []);

  const openPopup = (index: number) => {
    setCurrentVideo(index);
    setShowPopup(true);
  };

  return (
    <div id="projects" className="portfolio-parent w-full lg:h-[350vh] relative">
      <div className="portfolio w-full flex flex-col items-center gap-[40px] md:gap-[70px] sticky top-[30px] left-0 overflow-hidden">
        <div className="head w-[95%] lg:w-[1240px] flex flex-col md:flex-row items-center justify-between gap-[10px] lg:gap-0">
          <h2 className="syne text-[25px] lg:text-[30px] font-semibold text-white leading-[1em] text-center md:text-start">
            What We Bring to the Table
          </h2>
          <button className="syne hover-btn text-[14px] lg:text-[16px] font-bold leading-[1em] text-white rounded-[50px] py-[18px] px-[30px] lg:py-[17px] lg:px-[33px] cursor-pointer flex items-center gap-[8px] relative">
            <div className="red-circle w-[12px] h-[12px] bg-[#FF000D] rounded-full"></div>
            <span>See All Projects</span>
          </button>
        </div>

        <div className="portfolio-cards w-[95%] md:w-full flex items-center justify-center lg:justify-[unset] flex-col lg:flex-row gap-[25px] lg:gap-[10px] lg:translate-x-[60vw]">
          {portfolioItems.map((item, index) => (
            <a key={item.id} href="#" onClick={(e) => { e.preventDefault(); openPopup(index); }}>
              <div className={`card w-[100%] lg:w-[425px] h-[375px] md:h-[425px] rounded-[51px] relative overflow-hidden cursor-none ${index === 1 ? 'active' : ''}`}>
                <div className="syne card-cursor w-[115px] h-[115px] opacity-0 border-[1px] text-[13px] font-semibold leading-[1.2em] uppercase text-center flex items-center justify-center text-white border-solid border-[#8b8b8b] rounded-full absolute top-0 left-0 z-[1]">
                  Preview <br />Feature
                </div>
                <video 
                  muted 
                  loop 
                  playsInline 
                  preload="auto" 
                  className="w-full h-full object-cover object-center"
                  src={item.videoUrl}
                />
                <div className="text-overlay w-full h-full absolute top-0 left-0 flex flex-col justify-end p-[36px]">
                  <h3 className="syne text-[23px] text-white font-semibold leading-[1em]">{item.title}</h3>
                  <p className="inter text-[12px] text-white leading-[1.8em]">{item.company}</p>
                </div>
              </div>
            </a>
          ))}
        </div>
      </div>

      {showPopup && (
        <VideoPopup
          videos={portfolioItems}
          currentIndex={currentVideo}
          onClose={() => setShowPopup(false)}
          onNavigate={setCurrentVideo}
        />
      )}
    </div>
  );
};

export default Portfolio;