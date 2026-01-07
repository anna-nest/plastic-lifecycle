// ===== RECYCLING LOOP ANIMATION =====

class RecyclingLoop {
  constructor(containerId) {
    this.containerId = containerId;
    this.container = document.getElementById(containerId);
    this.svg = null;
    this.arrow = null;
    this.isAnimating = false;
    this.rotationAngle = 0;
    this.animationId = null;
    this.currentStep = null;
    this.transitionProgress = 0;
    this.gapPulse = 0;
    this.speedPhase = 0;
    
    // Configuration
this.config = {
  radius: Math.min(window.innerHeight, window.innerWidth) * 0.42,
  strokeWidth: 75,
  baseRotationSpeed: 360 / (12 * 60), // SLOWER: 1 rotation every 12 seconds (was 9)
  baseGapSize: 15,
  gapPulseAmount: 11,
  arrowheadSize: 60
};
  }
  
  init() {
    const vw = window.innerWidth;
    const vh = window.innerHeight;
    
    this.svg = d3.select(`#${this.containerId}`)
      .append('svg')
      .attr('width', vw)
      .attr('height', vh)
      .style('position', 'fixed')
      .style('top', '50%')
      .style('left', '50%')
      .style('transform', 'translate(-50%, -50%)')
      .style('pointer-events', 'none')
      .style('opacity', 0)
      .style('z-index', 1);
    
    const centerX = vw / 2;
    const centerY = vh / 2;
    
    const defs = this.svg.append('defs');
    
    // Debris texture pattern
    const pattern = defs.append('pattern')
      .attr('id', 'debris-pattern-loop')
      .attr('patternUnits', 'userSpaceOnUse')
      .attr('width', 400)
      .attr('height', 400);
    
    pattern.append('image')
      .attr('href', 'assets/plastic-debris-texture.png')
      .attr('width', 400)
      .attr('height', 400)
      .attr('preserveAspectRatio', 'xMidYMid slice');
    
    this.arrowGroup = this.svg.append('g')
      .attr('transform', `translate(${centerX}, ${centerY})`);
    
    this.createArrow();
    
    console.log('✓ Recycling loop initialized');
  }
  
  createArrow() {
  const { radius, strokeWidth, baseGapSize, arrowheadSize } = this.config;
  
  const gapDegrees = (360 * baseGapSize) / 100;
  const startAngle = 0;
  const endAngle = 360 - gapDegrees;
  
  // Main arc path
  const path = this.describeArc(0, 0, radius, startAngle, endAngle);
  
  // Main arc (solid part)
  this.arrow = this.arrowGroup.append('path')
    .attr('d', path)
    .attr('fill', 'none')
    .attr('stroke', 'url(#debris-pattern-loop)')
    .attr('stroke-width', strokeWidth)
    .attr('stroke-linecap', 'round');
  
  // FADING TAIL at the END (last 30 degrees)
  const tailLength = 30;
  const tailStart = endAngle - tailLength;
  const tailPath = this.describeArc(0, 0, radius, tailStart, endAngle);
  
  this.tail = this.arrowGroup.append('path')
    .attr('d', tailPath)
    .attr('fill', 'none')
    .attr('stroke', 'url(#debris-pattern-loop)')
    .attr('stroke-width', strokeWidth)
    .attr('stroke-linecap', 'round')
    .attr('opacity', 0.3);
  
  // ARROWHEAD at the END (where tail is trying to catch the start)
  // Position it just before the gap starts
  const arrowAngle = endAngle - 90; // Pointing in direction of rotation
  const arrowX = radius * Math.cos((endAngle - 90) * Math.PI / 180);
  const arrowY = radius * Math.sin((endAngle - 90) * Math.PI / 180);
  
  this.arrowhead = this.arrowGroup.append('path')
    .attr('d', this.createArrowhead(arrowX, arrowY, arrowAngle, arrowheadSize))
    .attr('fill', 'url(#debris-pattern-loop)');
}
  
  createArrowhead(x, y, angle, size) {
    const rad = (angle + 90) * Math.PI / 180;
    const perpRad = rad + Math.PI / 2;
    
    const tip = { x: x, y: y };
    const base1 = {
      x: x - size * Math.cos(rad) + (size / 2) * Math.cos(perpRad),
      y: y - size * Math.sin(rad) + (size / 2) * Math.sin(perpRad)
    };
    const base2 = {
      x: x - size * Math.cos(rad) - (size / 2) * Math.cos(perpRad),
      y: y - size * Math.sin(rad) - (size / 2) * Math.sin(perpRad)
    };
    
    return `M ${tip.x} ${tip.y} L ${base1.x} ${base1.y} L ${base2.x} ${base2.y} Z`;
  }
  
  describeArc(x, y, radius, startAngle, endAngle) {
    const start = this.polarToCartesian(x, y, radius, endAngle);
    const end = this.polarToCartesian(x, y, radius, startAngle);
    const largeArcFlag = endAngle - startAngle <= 180 ? "0" : "1";
    
    return [
      "M", start.x, start.y,
      "A", radius, radius, 0, largeArcFlag, 0, end.x, end.y
    ].join(" ");
  }
  
  polarToCartesian(centerX, centerY, radius, angleInDegrees) {
    const angleInRadians = (angleInDegrees - 90) * Math.PI / 180.0;
    return {
      x: centerX + (radius * Math.cos(angleInRadians)),
      y: centerY + (radius * Math.sin(angleInRadians))
    };
  }
  
  startStep16() {
    if (this.isAnimating) return;
    
    console.log('🔄 Starting Step 16 - failing loop');
    this.currentStep = 16;
    this.isAnimating = true;
    this.rotationAngle = 0;
    this.gapPulse = 0;
    this.speedPhase = 0;
    
    this.svg.transition()
      .duration(400)
      .style('opacity', 1);
    
    this.animateRotation();
  }
  
  animateRotation() {
    if (!this.isAnimating) return;
    
    // VARIABLE SPEED with smooth easing
    this.speedPhase += 0.015; // Controls speed variation cycle
    // Use ease-in-out sine wave for smooth acceleration/deceleration
    const speedMultiplier = 0.7 + (Math.sin(this.speedPhase) * 0.5 + 0.5) * 0.6; // 0.7x to 1.3x
    const currentSpeed = this.config.baseRotationSpeed * speedMultiplier;
    
    // Rotate
    this.rotationAngle += currentSpeed;
    if (this.rotationAngle >= 360) {
      this.rotationAngle -= 360;
    }
    
    // Apply rotation
    const vw = window.innerWidth;
    const vh = window.innerHeight;
    this.arrowGroup.attr('transform', 
      `translate(${vw / 2}, ${vh / 2}) rotate(${this.rotationAngle})`
    );
    
    // Pulse the gap (for Step 16 only)
    if (this.currentStep === 16) {
      this.updateGapPulse();
    }
    
    // Handle Step 17 transition
    if (this.currentStep === 17) {
      this.updateStep17Transition();
    }
    
    this.animationId = requestAnimationFrame(() => this.animateRotation());
  }
  
  updateGapPulse() {
    // Smooth sine wave: gap gets smaller (trying to catch), then larger (fails)
    this.gapPulse += 0.025; // Speed of pulse
    // Use ease-in-out for smoother motion
    const rawPulse = Math.sin(this.gapPulse);
    const smoothPulse = rawPulse < 0 ? 
      -Math.pow(Math.abs(rawPulse), 0.7) : 
      Math.pow(rawPulse, 0.7);
    const pulseFactor = smoothPulse * 0.5 + 0.5; // 0 to 1
    
    const currentGap = this.config.baseGapSize - (this.config.gapPulseAmount * pulseFactor);
    const gapDegrees = (360 * currentGap) / 100;
    const endAngle = 360 - gapDegrees;
    
    // Update main arc (start to almost-end)
    const path = this.describeArc(0, 0, this.config.radius, 0, endAngle);
    this.arrow.attr('d', path);
    
    // Update fading tail (last segment)
    const tailLength = 30;
    const tailStart = endAngle - tailLength;
    const tailPath = this.describeArc(0, 0, this.config.radius, tailStart, endAngle);
    this.tail.attr('d', tailPath);
  }
  
  startStep17() {
    if (this.currentStep === 17) return;
    
    console.log('🔄 STARTING Step 17 - closing transition');
    this.currentStep = 17;
    this.transitionProgress = 0;
  }
  
  updateStep17Transition() {
    // Transition over 240 frames (4 seconds at 60fps)
    this.transitionProgress += 1 / 240;
    if (this.transitionProgress > 1) {
      this.transitionProgress = 1;
    }
    
    const progress = this.transitionProgress;
    
    // Log progress for debugging
    if (Math.floor(progress * 100) % 10 === 0 && progress > 0) {
      console.log('Step 17 progress:', Math.floor(progress * 100) + '%');
    }
    
    // 1. Transition fill from debris to blue (20% → 50%)
    if (progress >= 0.2 && progress <= 0.5 && !this.colorChanged) {
      const colorProgress = (progress - 0.2) / 0.3;
      if (colorProgress > 0.5) {
        const blue = '#91D8FA';
        this.arrow.attr('stroke', blue);
        this.tail.attr('stroke', blue);
        this.arrowhead.attr('fill', blue);
        this.colorChanged = true;
        console.log('✓ Changed to blue at', Math.floor(progress * 100) + '%');
      }
    }
    
    // 2. Close the gap gradually (40% → 65%)
    if (progress >= 0.4 && progress <= 0.65) {
      const gapProgress = (progress - 0.4) / 0.25;
      const currentGap = this.config.baseGapSize * (1 - gapProgress);
      
      const gapDegrees = (360 * currentGap) / 100;
      const endAngle = 360 - gapDegrees;
      
      const path = this.describeArc(0, 0, this.config.radius, 0, endAngle);
      this.arrow.attr('d', path);
      
      // Fade out tail as gap closes
      const tailOpacity = 0.3 * (1 - gapProgress);
      this.tail.attr('opacity', tailOpacity);
      
      if (gapProgress >= 0.95 && !this.gapClosed) {
        this.gapClosed = true;
        console.log('✓ Loop closed at', Math.floor(progress * 100) + '%');
      }
    }
    
    // 3. Thin the stroke (65% → 85%)
    if (progress >= 0.65 && progress <= 0.85) {
      const thinProgress = (progress - 0.65) / 0.2;
      const strokeWidth = this.config.strokeWidth * (1 - thinProgress * 0.8);
      this.arrow.attr('stroke-width', strokeWidth);
    }
    
    // 4. Fade out (80% → 100%)
    if (progress >= 0.8) {
      const fadeProgress = (progress - 0.8) / 0.2;
      const opacity = 1 - fadeProgress;
      this.svg.style('opacity', opacity);
      
      // Slow rotation dramatically
      this.config.baseRotationSpeed *= 0.97;
    }
    
    // 5. Stop when complete
    if (progress >= 1) {
      console.log('✓ Step 17 transition COMPLETE');
      this.stop();
    }
  }
  
  stop() {
    console.log('🛑 Stopping loop animation');
    this.isAnimating = false;
    if (this.animationId) {
      cancelAnimationFrame(this.animationId);
      this.animationId = null;
    }
  }
  
  reset() {
    this.stop();
    this.rotationAngle = 0;
    this.transitionProgress = 0;
    this.gapPulse = 0;
    this.speedPhase = 0;
    this.currentStep = null;
    this.colorChanged = false;
    this.gapClosed = false;
    this.config.baseRotationSpeed = 360 / (9 * 60);
    this.svg.style('opacity', 0);
  }
}

window.RecyclingLoop = RecyclingLoop;