document.addEventListener("DOMContentLoaded", () => {
  // Initialize GSAP animations
  gsap.registerPlugin(ScrollTrigger);

  // Animate welcome image container
  gsap.to(".welcome-image-container", {
    opacity: 1,
    x: 0,
    duration: 0.8,
    ease: "power3.out",
  });

  // Animate welcome content
  gsap.to(".welcome-content", {
    opacity: 1,
    y: 0,
    duration: 0.8,
    delay: 0.2,
    ease: "power3.out",
  });

  // Animate feature items
  gsap.to(".feature-item", {
    opacity: 1,
    y: 0,
    duration: 0.6,
    stagger: 0.1,
    delay: 0.4,
    ease: "power2.out",
  });

  // Animate welcome buttons
  gsap.to(".welcome-buttons", {
    opacity: 1,
    y: 0,
    duration: 0.6,
    delay: 1,
    ease: "power2.out",
  });
});
