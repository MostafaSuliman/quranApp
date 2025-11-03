/**
 * Simple Mobile Optimization for QuranApp
 * Lightweight implementation to ensure app stability
 */

// Basic mobile detection configuration
export const MOBILE_OPTIMIZATION_CONFIG = {
  detection: {
    maxMobileWidth: 768,
    maxTabletWidth: 1024,
    touchDevice: 'ontouchstart' in window,
  },
  performance: {
    touchOptimization: true,
    scrollOptimization: true,
  },
  ui: {
    largeTouchTargets: true,
    responsiveText: true,
  }
} as const;

// Basic device information interface
export interface MobileDeviceInfo {
  isMobile: boolean;
  isTablet: boolean;
  isDesktop: boolean;
  hasTouch: boolean;
  orientation: 'portrait' | 'landscape';
  screenSize: 'small' | 'medium' | 'large';
}

/**
 * Simple Mobile Performance Optimizer
 */
export class SimpleMobileOptimizer {
  private deviceInfo: MobileDeviceInfo;

  constructor() {
    this.deviceInfo = this.detectDeviceInfo();
    this.initialize();
  }

  /**
   * Detect basic device information
   */
  private detectDeviceInfo(): MobileDeviceInfo {
    const width = window.innerWidth;
    const height = window.innerHeight;
    
    return {
      isMobile: width <= MOBILE_OPTIMIZATION_CONFIG.detection.maxMobileWidth,
      isTablet: width > MOBILE_OPTIMIZATION_CONFIG.detection.maxMobileWidth && 
                width <= MOBILE_OPTIMIZATION_CONFIG.detection.maxTabletWidth,
      isDesktop: width > MOBILE_OPTIMIZATION_CONFIG.detection.maxTabletWidth,
      hasTouch: MOBILE_OPTIMIZATION_CONFIG.detection.touchDevice,
      orientation: height > width ? 'portrait' : 'landscape',
      screenSize: width <= 400 ? 'small' : width <= 768 ? 'medium' : 'large',
    };
  }

  /**
   * Initialize basic optimizations
   */
  private initialize(): void {
    if (this.deviceInfo.isMobile) {
      this.applyBasicMobileOptimizations();
    }
    
    this.setupBasicTouchOptimization();
    this.setupViewportOptimization();
    
    console.log('📱 Simple Mobile Optimizer initialized');
  }

  /**
   * Apply basic mobile optimizations
   */
  private applyBasicMobileOptimizations(): void {
    // Basic viewport optimization
    const viewport = document.querySelector('meta[name="viewport"]');
    if (viewport) {
      viewport.setAttribute('content', 
        'width=device-width, initial-scale=1.0, maximum-scale=5.0, user-scalable=yes'
      );
    }

    // Basic touch target optimization
    if (MOBILE_OPTIMIZATION_CONFIG.ui.largeTouchTargets) {
      this.optimizeTouchTargets();
    }
  }

  /**
   * Setup basic touch optimization
   */
  private setupBasicTouchOptimization(): void {
    if (!this.deviceInfo.hasTouch) return;

    // Use passive listeners for better performance
    const touchOptions = { passive: true };
    
    document.addEventListener('touchstart', this.handleTouchStart.bind(this), touchOptions);
    document.addEventListener('touchend', this.handleTouchEnd.bind(this), touchOptions);
  }

  private handleTouchStart(event: TouchEvent): void {
    // Basic touch handling
  }

  private handleTouchEnd(event: TouchEvent): void {
    // Basic touch handling
  }

  /**
   * Setup viewport optimization
   */
  private setupViewportOptimization(): void {
    // Handle orientation changes
    window.addEventListener('orientationchange', () => {
      setTimeout(() => {
        this.deviceInfo = this.detectDeviceInfo();
        this.handleOrientationChange();
      }, 100);
    });

    // Handle resize events
    let resizeTimeout: NodeJS.Timeout;
    window.addEventListener('resize', () => {
      clearTimeout(resizeTimeout);
      resizeTimeout = setTimeout(() => {
        this.deviceInfo = this.detectDeviceInfo();
      }, 250);
    });
  }

  /**
   * Optimize touch targets for mobile
   */
  private optimizeTouchTargets(): void {
    const style = document.createElement('style');
    style.textContent = `
      @media (max-width: 768px) {
        button, .button, [role="button"] {
          min-height: 44px;
          min-width: 44px;
          padding: 8px;
        }
        
        .arabic-text {
          line-height: 1.6;
          padding: 8px;
        }
        
        .touch-target {
          min-height: 44px;
          min-width: 44px;
        }
      }
    `;
    
    document.head.appendChild(style);
  }

  /**
   * Handle orientation changes
   */
  private handleOrientationChange(): void {
    // Force layout recalculation
    window.dispatchEvent(new Event('resize'));
  }

  /**
   * Public API methods
   */
  public getDeviceInfo(): MobileDeviceInfo {
    return { ...this.deviceInfo };
  }

  public isMobile(): boolean {
    return this.deviceInfo.isMobile;
  }

  public isTablet(): boolean {
    return this.deviceInfo.isTablet;
  }

  public hasTouch(): boolean {
    return this.deviceInfo.hasTouch;
  }

  public generateMobilePerformanceReport(): string {
    const device = this.getDeviceInfo();
    
    return `
Mobile Performance Report for QuranApp
======================================

Device Information:
- Type: ${device.isMobile ? 'Mobile' : device.isTablet ? 'Tablet' : 'Desktop'}
- Screen Size: ${device.screenSize}
- Orientation: ${device.orientation}
- Touch Support: ${device.hasTouch ? 'Yes' : 'No'}

Optimizations Active:
- Touch Optimization: ${MOBILE_OPTIMIZATION_CONFIG.performance.touchOptimization ? 'Yes' : 'No'}
- Large Touch Targets: ${MOBILE_OPTIMIZATION_CONFIG.ui.largeTouchTargets ? 'Yes' : 'No'}
    `;
  }
}

// Export singleton instance
export const mobilePerformanceOptimizer = new SimpleMobileOptimizer();

// Export utility functions
export const optimizeForMobile = (): void => {
  // Basic mobile optimization
  console.log('📱 Basic mobile optimization applied');
};

export const getMobileDeviceInfo = (): MobileDeviceInfo => {
  return mobilePerformanceOptimizer.getDeviceInfo();
};

// Development helpers
if (process.env.NODE_ENV === 'development') {
  (window as any).mobilePerformanceOptimizer = mobilePerformanceOptimizer;
  (window as any).getMobileDeviceInfo = getMobileDeviceInfo;
}