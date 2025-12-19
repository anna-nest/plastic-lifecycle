console.log('Starting scrollama initialization...');

document.addEventListener('DOMContentLoaded', function() {
  
  // Check if scrollama loaded
  if (typeof scrollama === 'undefined') {
    console.error('ERROR: Scrollama not loaded!');
    return;
  }
  console.log('✓ Scrollama loaded');
  
  const steps = document.querySelectorAll('.step');
  console.log('✓ Found', steps.length, 'steps');
  
  
  // ===== HIDE SCROLL CUE =====
  const scrollCue = document.querySelector('.scroll-cue');
  window.addEventListener('scroll', () => {
    if (window.scrollY > 200 && scrollCue) {
      scrollCue.style.opacity = '0';
    }
  });
  
  
  // ===== CHOREOGRAPHED PERCENTAGE ANIMATIONS =====

  const isMobile = window.innerWidth <= 768; 

  const percentages = {
    '22': { 
      element: document.getElementById('percent-22'),
      activeStep: 12,
      initialLeft: '5%',
       finalLeft: isMobile ? '23%' : '28%',  // Shift left on mobile
      extracted: false
    },
    '50': { 
      element: document.getElementById('percent-50'),
      activeStep: 11,
      initialLeft: '32%',
      finalLeft: isMobile ? '40%' : '52%',  // Shift left on mobile
      extracted: false
    },
    '19': { 
      element: document.getElementById('percent-19'),
      activeStep: 10,
      initialLeft: '58%',
      finalLeft: isMobile ? '52%' : '57%',  // Shift left on mobile
      extracted: false
    },
    '9': { 
      element: document.getElementById('percent-9'),
      activeStep: 9,
      initialLeft: '71%',
      finalLeft: isMobile ? '55%' : '60%',  // Shift left on mobile
      extracted: false
    }
  };
  
  let currentAlluvialStep = 8;
  
  // Show all percentages initially
  function showAllPercentages() {
    console.log('📊 Showing all percentages');
    Object.values(percentages).forEach(p => {
      if (p.element) {
        p.element.classList.add('visible');
      }
    });
  }
  
  // Extract from sticky container and place in wrapper, then animate
  function animatePercentageToTarget(percentValue) {
    const p = percentages[percentValue];
    if (!p || !p.element || p.extracted) return;
    
    console.log(`🎯 Extracting ${percentValue}% from sticky container`);
    
    // Get current screen position
    const rect = p.element.getBoundingClientRect();
    const wrapper = document.querySelector('.alluvial-wrapper');
    const wrapperRect = wrapper.getBoundingClientRect();
    
    // Calculate position relative to wrapper's top
    // The number is currently at rect.top on screen
    // Wrapper starts at wrapperRect.top on screen
    // So relative to wrapper, it's: rect.top - wrapperRect.top
    const topInWrapper = rect.top - wrapperRect.top;
    const leftInWrapper = rect.left - wrapperRect.left;
    
    console.log(`Position: top=${topInWrapper}px, left=${leftInWrapper}px`);
    
    // Remove from sticky container
    const parent = p.element.parentElement;
    parent.removeChild(p.element);
    
    // Add to wrapper as absolute positioned at exact same visual location
    wrapper.appendChild(p.element);
    p.element.style.position = 'absolute';
    p.element.style.top = topInWrapper + 'px';
    p.element.style.left = leftInWrapper + 'px';
    p.element.style.width = 'auto';
    p.element.style.zIndex = '10'; // Above alluvial image
    
    p.extracted = true;
    
    console.log(`✓ ${percentValue}% extracted, now animating to ${p.finalLeft}`);
    
    // Now animate horizontally to final position
    setTimeout(() => {
      p.element.classList.add('animating');
      
      // Calculate final left position in pixels
      const finalLeftPx = (parseFloat(p.finalLeft) / 100) * wrapperRect.width+8; // 8px = 0.5rem text container padding offset
      p.element.style.left = finalLeftPx + 'px';
    }, 100);
  }
  
  // Check scroll position and trigger animations
  function checkPercentagePositions() {
    const alluvialSteps = document.querySelectorAll('.alluvial-step');
    
    alluvialSteps.forEach((step, index) => {
      if (index === 0) return; // Skip step-8
      
      const rect = step.getBoundingClientRect();
      const windowHeight = window.innerHeight;
      
      // Trigger when step reaches about 15% from top
      const triggerPoint = windowHeight * 0.15;
      
      if (rect.top <= triggerPoint && rect.bottom >= triggerPoint) {
        const stepNum = 8 + index;
        
        // Trigger animation for the appropriate percentage
        Object.keys(percentages).forEach(pValue => {
          const p = percentages[pValue];
          if (p.activeStep === stepNum && !p.element.classList.contains('animating')) {
            animatePercentageToTarget(pValue);
          }
        });
      }
    });
  }
  
  
  // ===== PARTICLES WITH IRREGULAR POLYGONS =====
  let particlesInitialized = false;
  
  function initParticles(canvasId) {
    if (particlesInitialized && canvasId === 'particles-canvas') {
      return;
    }
    
    const canvas = document.getElementById(canvasId);
    if (!canvas) {
      console.warn('⚠ Canvas not found:', canvasId);
      return;
    }
    
    console.log('✓ Starting particles:', canvasId);
    
    if (canvasId === 'particles-canvas') {
      particlesInitialized = true;
    }
    
    const ctx = canvas.getContext('2d');
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;
    
    // Create particles with irregular polygon shapes
    const particles = [];
    for (let i = 0; i < 50; i++) {
      const numSides = Math.floor(Math.random() * 4) + 3; // 3-6 sides
      const size = Math.random() * 4 + 2;
      
      const points = [];
      for (let j = 0; j < numSides; j++) {
        const angle = (j / numSides) * Math.PI * 2;
        const radiusVariation = 0.5 + Math.random() * 0.5;
        const x = Math.cos(angle) * size * radiusVariation;
        const y = Math.sin(angle) * size * radiusVariation;
        points.push({ x, y });
      }
      
      particles.push({
        x: Math.random() * canvas.width,
        // y: Math.random() * canvas.height - canvas.height,
        y: Math.random() * -200,  // Random between 0 and -200px above
        points: points,
        speedY: Math.random() * 0.8 + 0.2,
        speedX: (Math.random() - 0.5) * 0.3,
        rotation: Math.random() * Math.PI * 2,
        rotationSpeed: (Math.random() - 0.5) * 0.02,
        opacity: Math.random() * 0.5 + 0.25
      });
    }
    
    function animate() {
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      
      particles.forEach(p => {
        ctx.save();
        ctx.translate(p.x, p.y);
        ctx.rotate(p.rotation);
        
        ctx.beginPath();
        ctx.moveTo(p.points[0].x, p.points[0].y);
        for (let i = 1; i < p.points.length; i++) {
          ctx.lineTo(p.points[i].x, p.points[i].y);
        }
        ctx.closePath();
        ctx.fillStyle = `rgba(255, 255, 255, ${p.opacity})`;
        ctx.fill();
        
        ctx.restore();
        
        p.y += p.speedY;
        p.x += p.speedX;
        p.rotation += p.rotationSpeed;
        
        if (p.y > canvas.height + 20) {
          p.y = -20;
          p.x = Math.random() * canvas.width;
        }
        if (p.x > canvas.width) p.x = 0;
        if (p.x < 0) p.x = canvas.width;
      });
      
      requestAnimationFrame(animate);
    }
    
    animate();
    
    window.addEventListener('resize', () => {
      canvas.width = window.innerWidth;
      canvas.height = window.innerHeight;
    });
  }
  
  
  // ===== SCROLLAMA =====
  const scroller = scrollama();
  
  scroller
    .setup({
      step: '.step',
      offset: 0.9, // Start when step is 90% visible (very early)
      debug: window.location.search.includes('debug')
    })
    .onStepEnter((response) => {
      const stepId = response.element.id;
      console.log('→ Step entered:', stepId);
      
      // Handle alluvial section
      if (stepId === 'step-8') {
        showAllPercentages();
        currentAlluvialStep = 8;
      } else if (stepId.startsWith('step-') && parseInt(stepId.split('-')[1]) >= 9 && parseInt(stepId.split('-')[1]) <= 12) {
        currentAlluvialStep = parseInt(stepId.split('-')[1]);
      }
      
      // Start particles IMMEDIATELY when step-13 enters
      if (stepId === 'step-13') {
        console.log('🌊 Starting particles on transition NOW');
        initParticles('particles-canvas');
      }
      
      if (stepId === 'step-14') {
        console.log('🌊 Starting particles on full ocean NOW');
        initParticles('particles-canvas-2');
      }
    });
  
  console.log('✓ Scrollama initialized');
  
  
  // Monitor scroll for percentage animations
  window.addEventListener('scroll', () => {
    // Check percentage animations
    if (currentAlluvialStep >= 8 && currentAlluvialStep <= 12) {
      checkPercentagePositions();
    }
  });
  
  
  // Resize handler
  window.addEventListener('resize', () => {
    scroller.resize();
  });
  
});
