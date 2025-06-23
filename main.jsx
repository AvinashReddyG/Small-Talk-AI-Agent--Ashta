import { StrictMode, useEffect, useRef } from 'react'
import { createRoot } from 'react-dom/client'
import gsap from 'gsap'
import { TextPlugin } from 'gsap/TextPlugin'
import './index.css'
import App from './App.jsx'

// Register the TextPlugin
gsap.registerPlugin(TextPlugin);

const MainContent = () => {
  const headingRef = useRef(null);
  const captionRef = useRef(null);

  useEffect(() => {
    const heading = headingRef.current;
    const caption = captionRef.current;

    // Store the text content
    const headingText = "Hi, I'm Ashta!";
    const captionText = "Want to start a conversation?";

    // Create a timeline
    const tl = gsap.timeline({
      defaults: {
        ease: "power2.out"
      }
    });

    // Animate the heading
    tl.fromTo(heading, 
      { opacity: 0, y: 20 },
      { 
        duration: 0.8,
        opacity: 1,
        y: 0,
        ease: "back.out(1.7)"
      }
    )
    .to(heading, {
      duration: 3,
      text: headingText,
      ease: "power2.inOut",
    })
    .to(caption, {
      duration: 0.8,
      opacity: 1,
      y: 0,
      ease: "back.out(1.7)"
    }, "-=0.5") // Start slightly before the heading animation ends
    .to(caption, {
      duration: 3,
      text: captionText,
      ease: "power2.inOut",
    });
  }, []);

  return (
    <div className="main-content">
      <h1 ref={headingRef} className="main-heading" style={{ opacity: 0, transform: 'translateY(20px)' }}></h1>
      <p ref={captionRef} className="main-caption" style={{ opacity: 0, transform: 'translateY(20px)' }}></p>
      <App />
    </div>
  );
};

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <MainContent />
  </StrictMode>,
);
