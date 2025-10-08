import React, { useEffect } from 'react';
import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import Lenis from 'lenis';
import Navigation from './Navigation';
import Hero from './Hero';
import Showreel from './Showreel';
import BrandPartners from './BrandPartners';
import Portfolio from './Portfolio';
import ConceptCards from './ConceptCards';

import About from './About';

import FAQ from './FAQ';
import Blogs from './Blogs';

import Footer from './Footer';
import ScrollButton from './ScrollButton';

gsap.registerPlugin(ScrollTrigger);

function Mainlanding() {
  useEffect(() => {
    // Initialize Lenis smooth scrolling
    const lenis = new Lenis();

    function raf(time: number) {
      lenis.raf(time);
      ScrollTrigger.update();
      requestAnimationFrame(raf);
    }
    requestAnimationFrame(raf);

    // Handle anchor links
    document.querySelectorAll<HTMLAnchorElement>('a[href^="#"]').forEach((anchor) => {
      const onClick = (e: MouseEvent) => {
        e.preventDefault();
        const href = anchor.getAttribute('href');
        if (href) {
          const target = document.querySelector(href);
          if (target) {
            lenis.scrollTo(target as HTMLElement);
          }
        }
      };
      anchor.addEventListener('click', onClick);
    });

    // Cleanup
    return () => {
      lenis.destroy();
    };
  }, []);

  return (
    <div className="App">
      <Navigation />
      <Hero />
      <Showreel />
      <BrandPartners />
      <Portfolio />
      <ConceptCards />
    
     
      <About />
      
      <FAQ />
      <Blogs />
      
      <Footer />
      <ScrollButton />
    </div>
  );
}

export default Mainlanding;