// ===== DEBRIS REVEAL ANIMATION =====

class DebrisReveal {
  constructor(containerId) {
    this.containerId = containerId;
    this.container = document.getElementById(containerId);
    this.svg = null;
    this.mask = null;
    this.textureGroup = null;
    this.isActive = false;
    this.rotation = 0;
    this.animationId = null;
    this.growthProgress = 0;
    this.fadeProgress = 1;
    
    this.config = {
      rotationSpeed: 0.08,
      initialSize: 2, // 5% of viewport
      initialOpacity: 0.1, // starts at 20%
      maxOpacity: 1, // grows to 100%
      featherAmount: 0.15
    };
  }
  
  init() {
    const vw = window.innerWidth;
    const vh = window.innerHeight;
    const centerX = vw / 2;
    const centerY = vh / 2;
    
    this.svg = d3.select(`#${this.containerId}`)
      .append('svg')
      .attr('width', '100%')
      .attr('height', '100%')
      .style('position', 'fixed')
      .style('top', 0)
      .style('left', 0)
      .style('pointer-events', 'none')
      .style('opacity', 0)
      .style('z-index', 5);
    
    const defs = this.svg.append('defs');
    
    // Radial gradient mask - centered properly
    const gradient = defs.append('radialGradient')
      .attr('id', 'feather-gradient')
      .attr('cx', '50%')
      .attr('cy', '50%')
      .attr('r', '50%');
    
    gradient.append('stop')
      .attr('offset', `${(1 - this.config.featherAmount) * 100}%`)
      .attr('stop-color', 'white')
      .attr('stop-opacity', 1);
    
    gradient.append('stop')
      .attr('offset', '100%')
      .attr('stop-color', 'white')
      .attr('stop-opacity', 0);
    
    // Mask with gradient
    this.mask = defs.append('mask')
      .attr('id', 'circle-mask');
    
    const initialRadius = Math.min(vw, vh) * (this.config.initialSize / 100);
    
    this.maskCircle = this.mask.append('circle')
      .attr('cx', centerX)
      .attr('cy', centerY)
      .attr('r', initialRadius)
      .attr('fill', 'url(#feather-gradient)');
    
    // Create rotating group
    this.textureGroup = this.svg.append('g');
    
    // SINGLE LARGE IMAGE - not too zoomed
    const maxDimension = Math.max(vw, vh) * 1.2; // 1.2x for rotation
    
    this.textureImage = this.textureGroup.append('image')
      .attr('href', 'assets/plastic-debris-texture.webp')
      .attr('x', (vw - maxDimension) / 2)
      .attr('y', (vh - maxDimension) / 2)
      .attr('width', maxDimension)
      .attr('height', maxDimension)
      .attr('preserveAspectRatio', 'xMidYMid slice')
      .attr('mask', 'url(#circle-mask)')
      .attr('opacity', this.config.initialOpacity);
    
    console.log('✓ Debris reveal initialized', 'center:', centerX, centerY);
  }
  
  start() {
    if (this.isActive) return;
    
    console.log('🎬 Starting debris reveal');
    this.isActive = true;
    this.rotation = 0;
    this.growthProgress = 0;
    this.fadeProgress = 1;
    
    // Fade in SVG container
    this.svg.transition()
      .duration(300)
      .style('opacity', 1);
    
    this.animate();
  }
  
  animate() {
    if (!this.isActive) return;
    
    // Slow rotation
    this.rotation += this.config.rotationSpeed;
    if (this.rotation >= 360) this.rotation -= 360;
    
    const vw = window.innerWidth;
    const vh = window.innerHeight;
    
    // Apply rotation around center
    this.textureGroup.attr('transform', `rotate(${this.rotation} ${vw/2} ${vh/2})`);
    
    this.animationId = requestAnimationFrame(() => this.animate());
  }
  
  updateGrowth(progress) {
    this.growthProgress = progress;
    
    const vw = window.innerWidth;
    const vh = window.innerHeight;
    const maxRadius = Math.sqrt(vw * vw + vh * vh) / 2;
    
    // CHANGED: Ease-in-out cubic - slow start, faster middle, slow end
  const eased = progress < 0.5
    ? 4 * progress * progress * progress
    : 1 - Math.pow(-2 * progress + 2, 3) / 2;
    
    const initialRadius = Math.min(vw, vh) * (this.config.initialSize / 100);
    const currentRadius = initialRadius + (maxRadius - initialRadius) * eased;
    
    // Update circle position and radius
    this.maskCircle
      .attr('cx', vw / 2)
      .attr('cy', vh / 2)
      .attr('r', currentRadius);
    
    // Fade in opacity as circle grows (0.2 → 0.6)
    const currentOpacity = this.config.initialOpacity + 
      (this.config.maxOpacity - this.config.initialOpacity) * eased;
    this.textureImage.attr('opacity', currentOpacity);
    
    // Once fully grown, remove mask for performance
    if (progress >= 0.99 && !this.maskRemoved) {
      console.log('✓ Circle fully grown, removing mask');
      this.textureImage.attr('mask', null);
      this.maskRemoved = true;
    }
  }
  
  startFade() {
    console.log('🌫️ Starting fade out');
    this.isFading = true;
  }
  
  updateFade(progress) {
    // Fade from current opacity (0.7) to 0
    const currentOpacity = this.config.maxOpacity * (1 - progress);
    this.textureImage.attr('opacity', currentOpacity);
    
    if (progress >= 0.99) {
      console.log('✓ Fade complete');
      this.stop();
    }
  }
  
  stop() {
    console.log('🛑 Stopping debris reveal');
    this.isActive = false;
    if (this.animationId) {
      cancelAnimationFrame(this.animationId);
      this.animationId = null;
    }
    this.svg.style('opacity', 0);
  }
  
  reset() {
    this.stop();
    this.rotation = 0;
    this.growthProgress = 0;
    this.fadeProgress = 1;
    this.maskRemoved = false;
    this.isFading = false;
    
    // Reset mask and opacity
    if (this.textureImage) {
      this.textureImage
        .attr('mask', 'url(#circle-mask)')
        .attr('opacity', this.config.initialOpacity);
    }
    
    const vw = window.innerWidth;
    const vh = window.innerHeight;
    const initialRadius = Math.min(vw, vh) * (this.config.initialSize / 100);
    
    if (this.maskCircle) {
      this.maskCircle
        .attr('cx', vw / 2)
        .attr('cy', vh / 2)
        .attr('r', initialRadius);
    }
  }
}

window.DebrisReveal = DebrisReveal;