// ===== PLASTIC PRODUCTION ANIMATED CHART =====

class PlasticProductionChart {
 constructor(containerId) {
  this.containerId = containerId;
  this.container = document.getElementById(containerId);
  this.svg = null;
  this.width = 0;
  this.height = 0;
  this.isMobile = window.innerWidth <= 768;
  
  this.margin = { 
    top: this.isMobile ? 80 : 40,
    right: 30, 
    bottom: 70,
    left: this.isMobile ? 35 : 70
  };
  
    
    // Data: Global plastic production 1950-2019 (million tonnes)
    this.data = [
      { year: 1950, production: 2 },
  { year: 1951, production: 2 },
  { year: 1952, production: 2 },
  { year: 1953, production: 3 },
  { year: 1954, production: 3 },
  { year: 1955, production: 4 },
  { year: 1956, production: 5 },
  { year: 1957, production: 5 },
  { year: 1958, production: 6 },
  { year: 1959, production: 7 },
  { year: 1960, production: 8 },
  { year: 1961, production: 9 },
  { year: 1962, production: 11 },
  { year: 1963, production: 13 },
  { year: 1964, production: 15 },
  { year: 1965, production: 17 },
  { year: 1966, production: 20 },
  { year: 1967, production: 23 },
  { year: 1968, production: 27 },
  { year: 1969, production: 32 },
  { year: 1970, production: 35 },
  { year: 1971, production: 38 },
  { year: 1972, production: 44 },
  { year: 1973, production: 51 },
  { year: 1975, production: 46 },
  { year: 1976, production: 54 },
  { year: 1977, production: 59 },
  { year: 1978, production: 64 },
  { year: 1979, production: 71 },
  { year: 1980, production: 75.027034 },
  { year: 1981, production: 76.420327 },
  { year: 1982, production: 77.996697 },
  { year: 1983, production: 85.619551 },
  { year: 1984, production: 91.877654 },
  { year: 1985, production: 96.966291 },
  { year: 1986, production: 103.158013 },
  { year: 1987, production: 111.850880 },
  { year: 1988, production: 119.173589 },
  { year: 1989, production: 122.933314 },
  { year: 1990, production: 129.886737 },
  { year: 1991, production: 134.870156 },
  { year: 1992, production: 143.569076 },
  { year: 1993, production: 149.685466 },
  { year: 1994, production: 164.447199 },
  { year: 1995, production: 170.917041 },
  { year: 1996, production: 183.439531 },
  { year: 1997, production: 197.227888 },
  { year: 1998, production: 206.397022 },
  { year: 1999, production: 222.144900 },
  { year: 2000, production: 234.008200 },
  { year: 2001, production: 239.907338 },
  { year: 2002, production: 255.480225 },
  { year: 2003, production: 266.323257 },
  { year: 2004, production: 283.507666 },
  { year: 2005, production: 291.788333 },
  { year: 2006, production: 310.465381 },
  { year: 2007, production: 328.116044 },
  { year: 2008, production: 312.909115 },
  { year: 2009, production: 321.168504 },
  { year: 2010, production: 348.880437 },
  { year: 2011, production: 363.269735 },
  { year: 2012, production: 377.300794 },
  { year: 2013, production: 393.737358 },
  { year: 2014, production: 401.032037 },
  { year: 2015, production: 412.751180 },
  { year: 2016, production: 419.969720 },
  { year: 2017, production: 432.184213 },
  { year: 2018, production: 446.200006 },
  { year: 2019, production: 459.745871 },
    {year: 2020, production: 435},

    ];
  }
  
  init() {
    // Get container dimensions
    const rect = this.container.getBoundingClientRect();
    this.width = rect.width - this.margin.left - this.margin.right;
    this.height = rect.height - this.margin.top - this.margin.bottom;
    
    // Create SVG
    this.svg = d3.select(`#${this.containerId}`)
      .append('svg')
      .attr('width', rect.width)
      .attr('height', rect.height);
    
    // Create main group
    this.chartGroup = this.svg.append('g')
      .attr('transform', `translate(${this.margin.left}, ${this.margin.top})`);
    
    // Create scales
    this.xScale = d3.scaleLinear()
      .domain([1950, 2020])
      .range([0, this.width]);
    
    this.yScale = d3.scaleLinear()
      .domain([0, 500])  // Max ~460, round up to 500
      .range([this.height, 0]);
    
    // Create area and line generators
    this.area = d3.area()
      .x(d => this.xScale(d.year))
      .y0(this.height)
      .y1(d => this.yScale(d.production))
      .curve(d3.curveMonotoneX);  // Smooth curve
    
    this.line = d3.line()
      .x(d => this.xScale(d.year))
      .y(d => this.yScale(d.production))
      .curve(d3.curveMonotoneX);
    
    // Create defs for clip path and pattern
    const defs = this.svg.append('defs');
    
    // Clip path for progressive reveal
    this.clipPath = defs.append('clipPath')
      .attr('id', 'area-clip')
      .append('rect')
      .attr('x', 0)
      .attr('y', 0)
      .attr('width', 0)  // Start at 0, will animate
      .attr('height', this.height);
    
    // Pattern with debris image
    const pattern = defs.append('pattern')
      .attr('id', 'debris-pattern')
      .attr('patternUnits', 'userSpaceOnUse')
      .attr('width', this.width)
      .attr('height', this.height);
    
    pattern.append('image')
      .attr('href', 'assets/plastic-debris-texture.webp')  // You'll need this image
      .attr('width', this.width)
      .attr('height', this.height)
      .attr('preserveAspectRatio', 'xMidYMid slice');
    
    // Draw axes
    this.drawAxes();
    
    // Draw area with debris pattern (hidden initially via clip path)
    this.areaPath = this.chartGroup.append('path')
      .datum(this.data)
      .attr('class', 'area')
      .attr('d', this.area)
      .attr('fill', 'url(#debris-pattern)')
      .attr('opacity', 0.8)
      .attr('clip-path', 'url(#area-clip)');
    
    // Draw line (hidden initially)
    this.linePath = this.chartGroup.append('path')
      .datum(this.data)
      .attr('class', 'line')
      .attr('d', this.line)
      .attr('fill', 'none')
      .attr('stroke', '#003c64')
      .attr('stroke-width', 3)
      .attr('stroke-dasharray', function() {
        return this.getTotalLength();
      })
      .attr('stroke-dashoffset', function() {
        return this.getTotalLength();
      });
    
// Add title
this.svg.append('text')
  .attr('x', rect.width / 2)
  .attr('y', 25)
  .attr('text-anchor', 'middle')
  .attr('font-size', '1.8rem')  
  .attr('font-weight', '400')
  .attr('font-family', "'League Spartan','Poppins', sans-serif")
  .attr('fill', '#000')
  .text('Global Plastic Production 1950-2020');

// Subtitle 
if (this.isMobile) {
  console.log('✓ Adding mobile subtitle'); // DEBUG
  this.svg.append('text')
    .attr('x', rect.width / 2)
    .attr('y', 48)  // FIXED: below title (was 0)
    .attr('text-anchor', 'middle')
    .attr('font-size', '0.8rem')
    .attr('font-family', "'League Spartan','Poppins', sans-serif")
    .attr('fill', '#666')
    .text('(Million tonnes per year)');
}
    
    console.log('✓ Chart initialized');
  }
  
  drawAxes() {
    // X axis
    const xAxis = d3.axisBottom(this.xScale)
      .tickFormat(d3.format('d'))  // No decimals
      .ticks(8);
    
    this.chartGroup.append('g')
      .attr('class', 'x-axis')
      .attr('transform', `translate(0, ${this.height})`)
      .call(xAxis)
      .selectAll('text')
      .style('font-size', '1.2rem')
      .style('font-family', "'League Spartan','Poppins', sans-serif");  
    
      // ADD SOURCE 
if (this.isMobile) {
  // Line 1: Source
  this.chartGroup.append('text')
    .attr('x', 0)
    .attr('y', this.height + 50)
    .attr('text-anchor', 'start')
    .attr('font-size', '0.8rem')
    .attr('font-family', "'League Spartan','Poppins', sans-serif")
    .attr('fill', '#666')
    .text('Source: OECD, 2024');
  
  // Line 2: Note about 2020
  this.chartGroup.append('text')
    .attr('x', 0)
    .attr('y', this.height + 68)  // 13px below first line
    .attr('text-anchor', 'start')
    .attr('font-size', '0.8rem')
    .attr('font-family', "'League Spartan','Poppins', sans-serif")
    .attr('fill', '#666')
     .text('(2020 is the latest consolidated data)');
} else {
  // Desktop: single line
  this.chartGroup.append('text')
    .attr('x', 0)
    .attr('y', this.height + 55)
    .attr('text-anchor', 'start')
    .attr('font-size', '0.9rem')
    .attr('font-family', "'League Spartan','Poppins', sans-serif")
    .attr('fill', '#666')
    .text('Source: OECD (2024), 2020 is the latest consolidated data');
}

    // Y axis
    const yAxis = d3.axisLeft(this.yScale)
      .ticks(6);
    
    this.chartGroup.append('g')
      .attr('class', 'y-axis')
      .call(yAxis)
      .selectAll('text')
      .style('font-size', '1.2rem')  
      .style('font-family', "'League Spartan','Poppins', sans-serif"); 
    
    // Y axis label
      if (!this.isMobile) {
        this.chartGroup.append('text')
      .attr('transform', 'rotate(-90)')
      .attr('x', -this.height / 2)
      .attr('y', -56)
      .attr('text-anchor', 'middle')
         .attr('font-size', '1.2rem')
      .attr('font-family', "'League Spartan','Poppins', sans-serif")
         .attr('fill', '#000')
      .text('Million Tonnes per Year');
      }
  }
  
  startAnimation() {
    if (this.isAnimating) return;
    
    console.log('🎬 Starting chart animation');
    this.isAnimating = true;
    this.animationProgress = 0;
    
    const duration = 3000;  // 3 seconds
    const startTime = Date.now();
    const lineLength = this.linePath.node().getTotalLength();
    
    const animate = () => {
      const elapsed = Date.now() - startTime;
      this.animationProgress = Math.min(elapsed / duration, 1);
      
      // Ease function (ease-in-out)
      const eased = this.animationProgress < 0.5
        ? 2 * this.animationProgress * this.animationProgress
        : 1 - Math.pow(-2 * this.animationProgress + 2, 2) / 2;
      
    //   // Animate line drawing
    //   const offset = lineLength * (1 - eased);
    //   this.linePath.attr('stroke-dashoffset', offset);
      
      // Animate area reveal
      const clipWidth = this.width * eased;
      this.clipPath.attr('width', clipWidth);
      
      if (this.animationProgress < 1) {
        this.animationId = requestAnimationFrame(animate);
      } else {
        console.log('✓ Chart animation complete');
        this.isAnimating = false;
      }
    };
    
    animate();
  }
  
  stopAnimation() {
    if (this.animationId) {
      cancelAnimationFrame(this.animationId);
      this.animationId = null;
    }
    this.isAnimating = false;
  }
  
  reset() {
    this.animationProgress = 0;
    const lineLength = this.linePath.node().getTotalLength();
    this.linePath.attr('stroke-dashoffset', lineLength);
    this.clipPath.attr('width', 0);
  }
}

// Export for use in main script
window.PlasticProductionChart = PlasticProductionChart;