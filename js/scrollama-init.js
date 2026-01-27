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
  
  // Blue overlay for intro
const blueOverlay = document.getElementById('blue-overlay');

  // NEW: Hide blue overlay on load if already scrolled past step 2
  const step2 = document.getElementById('step-2');
  if (step2 && blueOverlay) {
    const step2Rect = step2.getBoundingClientRect();
    // If step 2 has already scrolled past (is above viewport top)
    if (step2Rect.bottom < 0) {
      blueOverlay.style.display = 'none';
      console.log('✓ Blue overlay hidden (loaded past step 2)');
    }
  }


// ===== HIDE/SHOW SCROLL CUE =====
const scrollCue = document.querySelector('.scroll-cue');
window.addEventListener('scroll', () => {
  if (window.scrollY > 200 && scrollCue) {
    scrollCue.style.opacity = '0';
  } else if (window.scrollY <= 200 && scrollCue) {
    scrollCue.style.opacity = '1'; // Match the initial opacity from CSS
  }
});
  
  
  // ===== CHOREOGRAPHED PERCENTAGE ANIMATIONS =====

  const isMobile = window.innerWidth <= 768;
  const isTablet = window.innerWidth > 768 && window.innerWidth <= 1024; 
  

 const percentages = {
  '22': { 
    element: document.getElementById('percent-22'),
    activeStep: 12,
    initialLeft: isMobile ? '1%' : (isTablet ? '5%' : '5%'),      // Changed from 8% to 6%
    finalLeft: isMobile ? '23%' : (isTablet ? '25%' : '28%'),
    extracted: false
  },
  '50': { 
    element: document.getElementById('percent-50'),
    activeStep: 11,
    initialLeft: isMobile ? '32%' : (isTablet ? '36%' : '32%'),   // Kept at 38%
    finalLeft: isMobile ? '40%' : (isTablet ? '48%' : '52%'),
    extracted: false
  },
  '19': { 
    element: document.getElementById('percent-19'),
    activeStep: 10,
    initialLeft: isMobile ? '61%' : (isTablet ? '67%' : '62%'),   // Changed from 65% to 67%
    finalLeft: isMobile ? '52%' : (isTablet ? '52%' : '57%'),
    extracted: false
  },
  '9': { 
    element: document.getElementById('percent-9'),
    activeStep: 9,
    initialLeft: isMobile ? '78%' : (isTablet ? '84%' : '74%'),   // Changed from 78% to 82%
    finalLeft: isMobile ? '55%' : (isTablet ? '55%' : '60%'),
    extracted: false
  }
};

  let productionChart = null;
  let debrisReveal = null;
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
  
  
// Reset percentages back to sticky container when scrolling back
function resetPercentages() {
  console.log('🔄 Resetting percentages to initial state');
  
  const stickyContainer = document.getElementById('percentages-container');
  const wrapper = document.querySelector('.alluvial-wrapper');
  
  Object.keys(percentages).forEach(pValue => {
    const p = percentages[pValue];
    
    if (!p.element || !p.extracted) return;
    
    // Remove from wrapper
    if (p.element.parentElement === wrapper) {
      wrapper.removeChild(p.element);
    }
    
    // Add back to sticky container
    stickyContainer.appendChild(p.element);
    
    // Reset styles
    p.element.style.position = 'absolute';
    p.element.style.top = '0';
    p.element.style.left = p.initialLeft;
    p.element.classList.remove('animating');
    p.element.classList.remove('visible');
    
    // Reset extracted flag
    p.extracted = false;
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
  

  // ===== FLOATING OBJECTS SYSTEM =====

// Load images
const bottleImg = new Image();
bottleImg.src = 'assets/plastic-bottle2.PNG';

const bagImg = new Image();
bagImg.src = 'assets/plastic-bag2.PNG';

const forkImg = new Image();
forkImg.src = 'assets/plastic-fork2.PNG';

let floatingObjects = [];
let floatingAnimationId = null;

// Create floating objects array
function createFloatingObjects(canvas) {
  floatingObjects = [];
  
  for (let i = 0; i < 5; i++) {
    // 5 bottles
    const size = canvas.height * 0.11;
    floatingObjects.push({
      img: bottleImg,
      x: size + Math.random() * (canvas.width - size * 2),  // FIXED: margin on both sides
      y: size + Math.random() * (canvas.height - size * 2),  // FIXED: margin top/bottom
      size: size,
           baseX: 0,
      baseY: 0,
      rotation: Math.random() * 360,
      baseRotation: Math.random() * 360,
      driftSpeed: 0.3 + Math.random() * 0.3,  // INCREASED: 0.3-0.6 (was 0.2-0.4)
      driftAmplitude: 12 + Math.random() * 12,  // INCREASED: 12-24px (was 8-16px)
      rotateSpeed: 0.15 + Math.random() * 0.2,  // INCREASED: 0.15-0.35 (was 0.1-0.25)
      rotateAmplitude: 5 + Math.random() * 7,  // INCREASED: 5-12deg (was 3-8deg)
      time: Math.random() * Math.PI * 2
    });
    
    // 5 bags
    const bagSize = canvas.height * 0.14;
    floatingObjects.push({
      img: bagImg,
      x: bagSize + Math.random() * (canvas.width - bagSize * 2),  // FIXED
      y: bagSize + Math.random() * (canvas.height - bagSize * 2),  // FIXED
      size: bagSize,
      baseX: 0,
      baseY: 0,
      rotation: Math.random() * 360,
      baseRotation: Math.random() * 360,
      driftSpeed: 0.25 + Math.random() * 0.3,  // INCREASED
      driftAmplitude: 15 + Math.random() * 15,  // INCREASED: 15-30px
      rotateSpeed: 0.12 + Math.random() * 0.18,  // INCREASED
      rotateAmplitude: 6 + Math.random() * 8,  // INCREASED
      time: Math.random() * Math.PI * 2
    });
    
    // 5 forks
    const forkSize = canvas.height * 0.1;
    floatingObjects.push({
      img: forkImg,
      x: forkSize + Math.random() * (canvas.width - forkSize * 2),  // FIXED
      y: forkSize + Math.random() * (canvas.height - forkSize * 2),  // FIXED
      size: forkSize,
      baseX: 0,
      baseY: 0,
      rotation: Math.random() * 360,
      baseRotation: Math.random() * 360,
      driftSpeed: 0.35 + Math.random() * 0.35,  // INCREASED
      driftAmplitude: 8 + Math.random() * 12,  // INCREASED: 8-20px
      rotateSpeed: 0.18 + Math.random() * 0.25,  // INCREASED
      rotateAmplitude: 5 + Math.random() * 8,  // INCREASED
      time: Math.random() * Math.PI * 2
    });
  }
  
  // Set base positions
  floatingObjects.forEach(obj => {
    obj.baseX = obj.x;
    obj.baseY = obj.y;
  });
}

// Animate floating objects with gentle wave motion
function animateFloatingObjects(canvas, ctx) {
  ctx.clearRect(0, 0, canvas.width, canvas.height);
  
  floatingObjects.forEach(obj => {
    // Increment time for wave motion
    obj.time += 0.01;  // Very slow
    
    // Calculate gentle wave drift (sine wave for smooth back-and-forth)
    const driftX = Math.sin(obj.time * obj.driftSpeed) * obj.driftAmplitude;
    const driftY = Math.cos(obj.time * obj.driftSpeed * 0.7) * (obj.driftAmplitude * 0.5);
    
    // Calculate gentle rotation (sine wave for smooth rotation)
    const rotationOffset = Math.sin(obj.time * obj.rotateSpeed) * obj.rotateAmplitude;
    
    // Update position and rotation
    obj.x = obj.baseX + driftX;
    obj.y = obj.baseY + driftY;
    obj.rotation = obj.baseRotation + rotationOffset;
    
    // Wrap around edges
    if (obj.baseX > canvas.width + obj.size) obj.baseX = -obj.size;
    if (obj.baseX < -obj.size) obj.baseX = canvas.width + obj.size;
    if (obj.baseY > canvas.height + obj.size) obj.baseY = -obj.size;
    if (obj.baseY < -obj.size) obj.baseY = canvas.height + obj.size;
    
    // Draw with rotation and opacity
    ctx.save();
    ctx.translate(obj.x, obj.y);
    ctx.rotate(obj.rotation * Math.PI / 180);
    ctx.globalAlpha = 0.32;  // 32% opacity (faint)

// RECOLOR: Draw in lighter cyan/blue
ctx.globalCompositeOperation = 'source-over';


    ctx.drawImage(
      obj.img,
      -obj.size / 2,
      -obj.size / 2,
      obj.size,
      obj.size
    );

// Apply color overlay (lighter cyan)
ctx.globalCompositeOperation = 'source-atop';  // Only affects existing pixels
ctx.fillStyle = '#dbf3ff';  // Light cyan/blue
ctx.fillRect(-obj.size / 2, -obj.size / 2, obj.size, obj.size);

    ctx.restore();
  });
  
  floatingAnimationId = requestAnimationFrame(() => animateFloatingObjects(canvas, ctx));
}

// Stop floating objects animation
function stopFloatingObjects() {
  if (floatingAnimationId) {
    cancelAnimationFrame(floatingAnimationId);
    floatingAnimationId = null;
  }
}
  
  // ===== SCROLLAMA =====
  const scroller = scrollama();
  
  scroller
    .setup({
      step: '.step',
      offset: 0.9, // Start when step is 90% visible (very early)
      progress: true, 
      debug: window.location.search.includes('debug')
    })
    .onStepEnter((response) => {
      const stepId = response.element.id;
      console.log('→ Step entered:', stepId);
      
        // initialize production chart
    if (stepId === 'step-2') {
      if (!productionChart) {
        productionChart = new PlasticProductionChart('production-chart-container');
        productionChart.init();
      }
      productionChart.startAnimation();
    }

    
      // Handle alluvial section
if (stepId === 'step-8') {
  const direction = response.direction;
  
  if (direction === 'down') {
    // Entering from above (scrolling down) - show percentages
    showAllPercentages();
  } else if (direction === 'up') {
    // Entering from below (scrolling back up) - reset percentages
    resetPercentages();
  }
  
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
  console.log('🌊 Step 14 entered - initializing floating objects');
  
  // FLOATING OBJECTS
  const floatingCanvas = document.getElementById('floating-objects-canvas');
  if (!floatingCanvas) {
    console.error('❌ floating-objects-canvas not found!');
  } else {
    console.log('✓ Found floating canvas');
    const floatingCtx = floatingCanvas.getContext('2d');
    
    // Set canvas size
    floatingCanvas.width = floatingCanvas.offsetWidth;
    floatingCanvas.height = floatingCanvas.offsetHeight;
    console.log('✓ Canvas size:', floatingCanvas.width, 'x', floatingCanvas.height);
    
    // Check if images exist
    console.log('Bottle loaded:', bottleImg.complete);
    console.log('Bag loaded:', bagImg.complete);
    console.log('Fork loaded:', forkImg.complete);
    
    // Start animation immediately (don't wait for decode)
    createFloatingObjects(floatingCanvas);
    console.log('✓ Created', floatingObjects.length, 'floating objects');
    animateFloatingObjects(floatingCanvas, floatingCtx);
    console.log('✓ Started floating animation');
  }
  
  // PARTICLES (existing code)
  console.log('🌊 Starting particles on full ocean');
  initParticles('particles-canvas-2');
}

// Stop floating objects when leaving step 16
if (stepId === 'step-16' && floatingObjects.length > 0) {
  console.log('🛑 Stopping floating objects');
  stopFloatingObjects();
  const floatingCanvas = document.getElementById('floating-objects-canvas');
  if (floatingCanvas) {
    const floatingCtx = floatingCanvas.getContext('2d');
    floatingCtx.clearRect(0, 0, floatingCanvas.width, floatingCanvas.height);
  }
}

// STEP 16: Start debris reveal
    if (stepId === 'step-16') {
      if (!debrisReveal) {
        debrisReveal = new DebrisReveal('debris-reveal-container');
        debrisReveal.init();
      }
      debrisReveal.start();
    }
    
    // STEP 17: Start fade
    if (stepId === 'step-17') {
      if (debrisReveal) {
        debrisReveal.startFade();
      }
    }
  })
  .onStepProgress((response) => {
    const stepId = response.element.id;
    const progress = response.progress;
    
    console.log('📊 Progress:', stepId, Math.floor(progress * 100) + '%');

        // STEP 2: Fade out blue intro overlay
    if (stepId === 'step-2' && blueOverlay) {
      // choose where in the step the fade happens
      const fadeStart = 0.0;  // start fading as soon as step 2 begins
      const fadeEnd   = 0.5;  // fully gone by ~50% through step 2
      
      let t = (progress - fadeStart) / (fadeEnd - fadeStart);
      t = Math.min(1, Math.max(0, t));   // clamp 0–1
      
      const opacity = 1 - t;             // 1 → 0
      blueOverlay.style.opacity = String(opacity);

      
    }
    
    // STEP 16: Update growth
    if (stepId === 'step-16' && debrisReveal && debrisReveal.isActive) {
      debrisReveal.updateGrowth(progress);
    }
    
    // STEP 17: Update fade
    if (stepId === 'step-17' && debrisReveal && debrisReveal.isFading) {
      debrisReveal.updateFade(progress);
    }
  })
  .onStepExit((response) => {
    const stepId = response.element.id;
    const direction = response.direction;

   
    // Hide when scrolling back
    if (stepId === 'step-16' && direction === 'up') {
      if (debrisReveal) {
        debrisReveal.reset();
      }
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
