import React, { useEffect } from 'react';
import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import Lenis from 'lenis';
import Navigation from './components/lanNavigation';
import Hero from './components/Hero';
import Showreel from './components/Showreel';
import BrandPartners from './components/BrandPartners';
import Portfolio from './components/Portfolio';
import ConceptCards from './components/ConceptCards';

import About from './components/About';

import FAQ from './components/FAQ';
import Blogs from './components/Blogs';

import Footer from './components/Footer';
import ScrollButton from './components/ScrollButton';
import './styles/main.css';

gsap.registerPlugin(ScrollTrigger);

function Mainlanding() {
  useEffect(() => {
    // Initialize Lenis smooth scrolling
    const lenis = new Lenis({
      smooth: true,
      lerp: 0.08
    });

    function raf(time: number) {
      lenis.raf(time);
      ScrollTrigger.update();
      requestAnimationFrame(raf);
    }
    requestAnimationFrame(raf);

    // Handle anchor links
    document.querySelectorAll('a[href^="#"]').forEach(anchor => {
      anchor.addEventListener('click', function (e) {
        e.preventDefault();
        const target = document.querySelector(this.getAttribute('href') || '');
        if (target) {
          lenis.scrollTo(target);
        }
      });
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

export default App;