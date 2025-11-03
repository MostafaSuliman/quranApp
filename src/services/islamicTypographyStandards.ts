/**
 * Islamic Typography and Presentation Standards
 * 
 * Ensures proper typography, visual presentation, and accessibility
 * standards for Islamic content throughout the QuranApp.
 */

// ===== TYPOGRAPHY INTERFACES =====

export interface TypographyConfig {
  arabicFont: string
  englishFont: string
  arabicFontSize: {
    small: string
    medium: string
    large: string
  }
  englishFontSize: {
    small: string
    medium: string
    large: string
  }
  lineHeight: {
    arabic: number
    english: number
  }
  letterSpacing: {
    arabic: string
    english: string
  }
  wordSpacing: {
    arabic: string
    english: string
  }
}

export interface PresentationStandards {
  respectfulPresentation: boolean
  islamicAesthetics: boolean
  colorSchemeAppropriate: boolean
  accessibilityCompliant: boolean
  readabilityOptimized: boolean
}

export interface AccessibilityConfig {
  screenReaderSupport: boolean
  keyboardNavigation: boolean
  highContrast: boolean
  visuallyImpairedOptimization: boolean
  cognitiveAccessibility: boolean
}

export interface ColorScheme {
  background: string
  arabicText: string
  englishText: string
  accent: string
  border: string
  highlight: string
  selection: string
}

export interface LayoutConfig {
  direction: 'ltr' | 'rtl' | 'auto'
  textAlign: 'left' | 'right' | 'center' | 'justify'
  margin: string
  padding: string
  containerMaxWidth: string
}

// ===== ARABIC TYPOGRAPHY VALIDATOR =====

export class ArabicTypographyValidator {
  private readonly RECOMMENDED_ARABIC_FONTS = [
    'Amiri',
    'Noto Naskh Arabic',
    'Scheherazade New',
    'Lateef',
    'Noto Sans Arabic',
    'Dubai',
    'Tahoma'
  ]

  private readonly MINIMUM_FONT_SIZES = {
    arabic: {
      small: 16,
      medium: 20,
      large: 24
    },
    english: {
      small: 14,
      medium: 16,
      large: 18
    }
  }

  /**
   * Validate Arabic typography settings
   */
  validateArabicTypography(config: TypographyConfig): {
    isValid: boolean
    score: number
    issues: string[]
    recommendations: string[]
  } {
    const issues: string[] = []
    const recommendations: string[] = []
    let score = 100

    // Check Arabic font
    if (!this.RECOMMENDED_ARABIC_FONTS.includes(config.arabicFont)) {
      issues.push(`Arabic font "${config.arabicFont}" is not optimal for Quranic text`)
      recommendations.push('Use Amiri or Noto Naskh Arabic for better readability')
      score -= 20
    }

    // Check font sizes
    const arabicSizes = this.extractFontSizes(config.arabicFontSize)
    Object.entries(arabicSizes).forEach(([size, value]) => {
      const minSize = this.MINIMUM_FONT_SIZES.arabic[size as keyof typeof this.MINIMUM_FONT_SIZES.arabic]
      if (value < minSize) {
        issues.push(`Arabic ${size} font size ${value}px is below minimum ${minSize}px`)
        score -= 15
      }
    })

    // Check line height for Arabic
    if (config.lineHeight.arabic < 1.6) {
      issues.push('Arabic line height should be at least 1.6 for proper diacritics display')
      recommendations.push('Increase Arabic line height to 1.8-2.0 for optimal readability')
      score -= 10
    }

    // Check letter spacing
    if (config.letterSpacing.arabic && parseFloat(config.letterSpacing.arabic) < 0) {
      issues.push('Negative letter spacing can affect Arabic text readability')
      score -= 5
    }

    return {
      isValid: score >= 80,
      score: Math.max(0, score),
      issues,
      recommendations
    }
  }

  /**
   * Generate optimal Arabic typography configuration
   */
  generateOptimalArabicConfig(): TypographyConfig {
    return {
      arabicFont: 'Amiri',
      englishFont: 'Inter',
      arabicFontSize: {
        small: '18px',
        medium: '24px',
        large: '32px'
      },
      englishFontSize: {
        small: '14px',
        medium: '16px',
        large: '20px'
      },
      lineHeight: {
        arabic: 1.8,
        english: 1.5
      },
      letterSpacing: {
        arabic: '0.02em',
        english: '0.01em'
      },
      wordSpacing: {
        arabic: '0.1em',
        english: 'normal'
      }
    }
  }

  /**
   * Extract numeric font sizes from string values
   */
  private extractFontSizes(fontSizes: { small: string; medium: string; large: string }): { small: number; medium: number; large: number } {
    return {
      small: parseFloat(fontSizes.small),
      medium: parseFloat(fontSizes.medium),
      large: parseFloat(fontSizes.large)
    }
  }
}

// ===== VISUAL PRESENTATION VALIDATOR =====

export class VisualPresentationValidator {
  private readonly ISLAMIC_COLOR_PALETTE = {
    primary: ['#1B4332', '#2D5016', '#40531B'], // Islamic green variations
    neutral: ['#2F3E46', '#354F52', '#52796F'], // Muted earth tones
    background: ['#F8F9FA', '#FFFFFF', '#F7F8F9'], // Clean whites/off-whites
    accent: ['#84A98C', '#CAD2C5', '#A4B494'] // Subtle green accents
  }

  /**
   * Validate Islamic design aesthetics
   */
  validateIslamicAesthetics(colorScheme: ColorScheme): {
    isAppropriate: boolean
    score: number
    issues: string[]
    suggestions: string[]
  } {
    const issues: string[] = []
    const suggestions: string[] = []
    let score = 100

    // Check color appropriateness
    const colors = Object.values(colorScheme)
    
    // Avoid overly bright or flashy colors
    const brightColors = colors.filter(color => this.isBrightColor(color))
    if (brightColors.length > 1) {
      issues.push('Too many bright colors may distract from sacred content')
      suggestions.push('Use more muted, respectful color tones')
      score -= 20
    }

    // Check for red colors (associated with danger/error)
    const redColors = colors.filter(color => this.isRedColor(color))
    if (redColors.length > 0) {
      issues.push('Red colors should be used sparingly in Islamic content')
      suggestions.push('Consider using green or blue tones instead')
      score -= 15
    }

    // Check contrast ratios
    const arabicContrast = this.calculateContrast(colorScheme.background, colorScheme.arabicText)
    if (arabicContrast < 7) {
      issues.push('Arabic text contrast ratio is below WCAG AAA standards')
      suggestions.push('Increase contrast for better readability')
      score -= 25
    }

    const englishContrast = this.calculateContrast(colorScheme.background, colorScheme.englishText)
    if (englishContrast < 4.5) {
      issues.push('English text contrast ratio is below WCAG AA standards')
      score -= 20
    }

    return {
      isAppropriate: score >= 70,
      score: Math.max(0, score),
      issues,
      suggestions
    }
  }

  /**
   * Generate Islamic-appropriate color scheme
   */
  generateIslamicColorScheme(variant: 'light' | 'dark' = 'light'): ColorScheme {
    if (variant === 'light') {
      return {
        background: '#FFFFFF',
        arabicText: '#1B4332',
        englishText: '#2F3E46',
        accent: '#52796F',
        border: '#CAD2C5',
        highlight: '#84A98C',
        selection: '#A4B494'
      }
    } else {
      return {
        background: '#1B1B1D',
        arabicText: '#E8F5E8',
        englishText: '#D4D4D8',
        accent: '#84A98C',
        border: '#3F3F46',
        highlight: '#52796F',
        selection: '#40531B'
      }
    }
  }

  /**
   * Check if color is too bright
   */
  private isBrightColor(color: string): boolean {
    const rgb = this.hexToRgb(color)
    if (!rgb) return false
    
    const brightness = (rgb.r * 299 + rgb.g * 587 + rgb.b * 114) / 1000
    return brightness > 200
  }

  /**
   * Check if color is red-dominant
   */
  private isRedColor(color: string): boolean {
    const rgb = this.hexToRgb(color)
    if (!rgb) return false
    
    return rgb.r > rgb.g + 50 && rgb.r > rgb.b + 50
  }

  /**
   * Calculate contrast ratio between two colors
   */
  private calculateContrast(bg: string, fg: string): number {
    const bgLum = this.getLuminance(bg)
    const fgLum = this.getLuminance(fg)
    
    const lightest = Math.max(bgLum, fgLum)
    const darkest = Math.min(bgLum, fgLum)
    
    return (lightest + 0.05) / (darkest + 0.05)
  }

  /**
   * Get luminance of a color
   */
  private getLuminance(color: string): number {
    const rgb = this.hexToRgb(color)
    if (!rgb) return 0

    const [r, g, b] = [rgb.r, rgb.g, rgb.b].map(c => {
      c = c / 255
      return c <= 0.03928 ? c / 12.92 : Math.pow((c + 0.055) / 1.055, 2.4)
    })

    return 0.2126 * r + 0.7152 * g + 0.0722 * b
  }

  /**
   * Convert hex color to RGB
   */
  private hexToRgb(hex: string): { r: number; g: number; b: number } | null {
    const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex)
    return result ? {
      r: parseInt(result[1], 16),
      g: parseInt(result[2], 16),
      b: parseInt(result[3], 16)
    } : null
  }
}

// ===== ACCESSIBILITY COMPLIANCE CHECKER =====

export class AccessibilityComplianceChecker {
  /**
   * Validate accessibility compliance for Islamic content
   */
  validateAccessibility(config: AccessibilityConfig, colorScheme: ColorScheme, typography: TypographyConfig): {
    isCompliant: boolean
    score: number
    violations: string[]
    improvements: string[]
  } {
    const violations: string[] = []
    const improvements: string[] = []
    let score = 100

    // Screen reader support
    if (!config.screenReaderSupport) {
      violations.push('Screen reader support is not enabled')
      improvements.push('Add proper ARIA labels and semantic markup')
      score -= 25
    }

    // Keyboard navigation
    if (!config.keyboardNavigation) {
      violations.push('Keyboard navigation is not fully supported')
      improvements.push('Ensure all interactive elements are keyboard accessible')
      score -= 20
    }

    // High contrast support
    if (!config.highContrast) {
      violations.push('High contrast mode is not available')
      improvements.push('Provide high contrast color scheme option')
      score -= 15
    }

    // Font size accessibility
    const minArabicSize = parseFloat(typography.arabicFontSize.small)
    if (minArabicSize < 18) {
      violations.push('Arabic font size may be too small for accessibility')
      improvements.push('Increase minimum Arabic font size to 18px or higher')
      score -= 15
    }

    // Color contrast
    const visualValidator = new VisualPresentationValidator()
    const contrastCheck = visualValidator.validateIslamicAesthetics(colorScheme)
    if (contrastCheck.issues.some(issue => issue.includes('contrast'))) {
      violations.push('Color contrast does not meet accessibility standards')
      score -= 20
    }

    return {
      isCompliant: score >= 80,
      score: Math.max(0, score),
      violations,
      improvements
    }
  }

  /**
   * Generate accessibility-compliant configuration
   */
  generateAccessibleConfig(): AccessibilityConfig {
    return {
      screenReaderSupport: true,
      keyboardNavigation: true,
      highContrast: true,
      visuallyImpairedOptimization: true,
      cognitiveAccessibility: true
    }
  }
}

// ===== LAYOUT OPTIMIZER =====

export class LayoutOptimizer {
  /**
   * Optimize layout for Islamic content
   */
  optimizeForIslamicContent(content: 'quran' | 'hadith' | 'dua'): LayoutConfig {
    const baseConfig: LayoutConfig = {
      direction: 'auto',
      textAlign: 'center',
      margin: '1rem',
      padding: '1.5rem',
      containerMaxWidth: '800px'
    }

    switch (content) {
      case 'quran':
        return {
          ...baseConfig,
          direction: 'rtl',
          textAlign: 'center',
          margin: '2rem auto',
          padding: '2rem',
          containerMaxWidth: '900px'
        }

      case 'hadith':
        return {
          ...baseConfig,
          direction: 'rtl',
          textAlign: 'justify',
          margin: '1.5rem auto',
          padding: '1.5rem',
          containerMaxWidth: '700px'
        }

      case 'dua':
        return {
          ...baseConfig,
          direction: 'rtl',
          textAlign: 'center',
          margin: '1rem auto',
          padding: '1rem',
          containerMaxWidth: '600px'
        }

      default:
        return baseConfig
    }
  }

  /**
   * Generate responsive layout CSS
   */
  generateResponsiveCSS(config: LayoutConfig, typography: TypographyConfig): string {
    return `
      .islamic-content-container {
        direction: ${config.direction};
        text-align: ${config.textAlign};
        margin: ${config.margin};
        padding: ${config.padding};
        max-width: ${config.containerMaxWidth};
        font-family: ${typography.arabicFont}, ${typography.englishFont}, sans-serif;
      }

      .arabic-text {
        font-family: ${typography.arabicFont}, serif;
        font-size: ${typography.arabicFontSize.medium};
        line-height: ${typography.lineHeight.arabic};
        letter-spacing: ${typography.letterSpacing.arabic};
        word-spacing: ${typography.wordSpacing.arabic};
        direction: rtl;
        text-align: center;
        margin-bottom: 1rem;
      }

      .english-text {
        font-family: ${typography.englishFont}, sans-serif;
        font-size: ${typography.englishFontSize.medium};
        line-height: ${typography.lineHeight.english};
        letter-spacing: ${typography.letterSpacing.english};
        word-spacing: ${typography.wordSpacing.english};
        direction: ltr;
        text-align: center;
        margin-top: 0.5rem;
      }

      @media (max-width: 768px) {
        .islamic-content-container {
          margin: 1rem;
          padding: 1rem;
        }

        .arabic-text {
          font-size: ${typography.arabicFontSize.small};
        }

        .english-text {
          font-size: ${typography.englishFontSize.small};
        }
      }

      @media (min-width: 1200px) {
        .arabic-text {
          font-size: ${typography.arabicFontSize.large};
        }

        .english-text {
          font-size: ${typography.englishFontSize.large};
        }
      }

      /* High contrast mode */
      @media (prefers-contrast: high) {
        .arabic-text {
          font-weight: 600;
        }
        
        .english-text {
          font-weight: 500;
        }
      }

      /* Reduced motion */
      @media (prefers-reduced-motion: reduce) {
        .islamic-content-container * {
          animation-duration: 0.01ms !important;
          animation-iteration-count: 1 !important;
          transition-duration: 0.01ms !important;
        }
      }
    `
  }
}

// ===== MAIN TYPOGRAPHY STANDARDS SERVICE =====

export class IslamicTypographyStandards {
  private arabicValidator: ArabicTypographyValidator
  private visualValidator: VisualPresentationValidator
  private accessibilityChecker: AccessibilityComplianceChecker
  private layoutOptimizer: LayoutOptimizer

  private currentConfig: TypographyConfig
  private currentColorScheme: ColorScheme
  private currentAccessibilityConfig: AccessibilityConfig

  constructor() {
    this.arabicValidator = new ArabicTypographyValidator()
    this.visualValidator = new VisualPresentationValidator()
    this.accessibilityChecker = new AccessibilityComplianceChecker()
    this.layoutOptimizer = new LayoutOptimizer()

    // Initialize with optimal defaults
    this.currentConfig = this.arabicValidator.generateOptimalArabicConfig()
    this.currentColorScheme = this.visualValidator.generateIslamicColorScheme('light')
    this.currentAccessibilityConfig = this.accessibilityChecker.generateAccessibleConfig()
  }

  /**
   * Validate complete typography and presentation standards
   */
  validateStandards(): {
    typography: { isValid: boolean; score: number; issues: string[]; recommendations: string[] }
    presentation: { isAppropriate: boolean; score: number; issues: string[]; suggestions: string[] }
    accessibility: { isCompliant: boolean; score: number; violations: string[]; improvements: string[] }
    overallScore: number
    isCompliant: boolean
  } {
    const typography = this.arabicValidator.validateArabicTypography(this.currentConfig)
    const presentation = this.visualValidator.validateIslamicAesthetics(this.currentColorScheme)
    const accessibility = this.accessibilityChecker.validateAccessibility(
      this.currentAccessibilityConfig,
      this.currentColorScheme,
      this.currentConfig
    )

    const overallScore = (typography.score + presentation.score + accessibility.score) / 3
    const isCompliant = typography.isValid && presentation.isAppropriate && accessibility.isCompliant

    return {
      typography,
      presentation,
      accessibility,
      overallScore,
      isCompliant
    }
  }

  /**
   * Get optimal typography configuration for Islamic content
   */
  getOptimalConfig(contentType: 'quran' | 'hadith' | 'dua'): {
    typography: TypographyConfig
    colorScheme: ColorScheme
    layout: LayoutConfig
    css: string
  } {
    const typography = this.arabicValidator.generateOptimalArabicConfig()
    const colorScheme = this.visualValidator.generateIslamicColorScheme('light')
    const layout = this.layoutOptimizer.optimizeForIslamicContent(contentType)
    const css = this.layoutOptimizer.generateResponsiveCSS(layout, typography)

    return {
      typography,
      colorScheme,
      layout,
      css
    }
  }

  /**
   * Apply typography standards to element
   */
  applyStandardsToElement(element: HTMLElement, contentType: 'quran' | 'hadith' | 'dua', isArabic: boolean = true): void {
    const config = this.getOptimalConfig(contentType)
    
    // Apply typography
    element.style.fontFamily = isArabic ? config.typography.arabicFont : config.typography.englishFont
    element.style.fontSize = isArabic ? config.typography.arabicFontSize.medium : config.typography.englishFontSize.medium
    element.style.lineHeight = isArabic ? config.typography.lineHeight.arabic.toString() : config.typography.lineHeight.english.toString()
    element.style.letterSpacing = isArabic ? config.typography.letterSpacing.arabic : config.typography.letterSpacing.english
    element.style.wordSpacing = isArabic ? config.typography.wordSpacing.arabic : config.typography.wordSpacing.english

    // Apply colors
    element.style.color = isArabic ? config.colorScheme.arabicText : config.colorScheme.englishText
    element.style.backgroundColor = config.colorScheme.background

    // Apply layout
    if (isArabic) {
      element.dir = 'rtl'
      element.lang = 'ar'
    } else {
      element.dir = 'ltr'
      element.lang = 'en'
    }

    // Add accessibility attributes
    if (isArabic) {
      element.setAttribute('aria-label', 'Arabic Islamic text')
    }
  }

  /**
   * Generate CSS variables for Islamic typography
   */
  generateCSSVariables(): string {
    const config = this.getOptimalConfig('quran')
    
    return `
      :root {
        /* Typography */
        --islamic-arabic-font: ${config.typography.arabicFont};
        --islamic-english-font: ${config.typography.englishFont};
        
        --islamic-arabic-font-small: ${config.typography.arabicFontSize.small};
        --islamic-arabic-font-medium: ${config.typography.arabicFontSize.medium};
        --islamic-arabic-font-large: ${config.typography.arabicFontSize.large};
        
        --islamic-english-font-small: ${config.typography.englishFontSize.small};
        --islamic-english-font-medium: ${config.typography.englishFontSize.medium};
        --islamic-english-font-large: ${config.typography.englishFontSize.large};
        
        --islamic-arabic-line-height: ${config.typography.lineHeight.arabic};
        --islamic-english-line-height: ${config.typography.lineHeight.english};
        
        /* Colors */
        --islamic-bg-color: ${config.colorScheme.background};
        --islamic-arabic-color: ${config.colorScheme.arabicText};
        --islamic-english-color: ${config.colorScheme.englishText};
        --islamic-accent-color: ${config.colorScheme.accent};
        --islamic-border-color: ${config.colorScheme.border};
        --islamic-highlight-color: ${config.colorScheme.highlight};
        --islamic-selection-color: ${config.colorScheme.selection};
        
        /* Layout */
        --islamic-container-max-width: ${config.layout.containerMaxWidth};
        --islamic-container-margin: ${config.layout.margin};
        --islamic-container-padding: ${config.layout.padding};
      }
    `
  }

  /**
   * Update configuration
   */
  updateConfiguration(
    typography?: Partial<TypographyConfig>,
    colorScheme?: Partial<ColorScheme>,
    accessibility?: Partial<AccessibilityConfig>
  ): void {
    if (typography) {
      this.currentConfig = { ...this.currentConfig, ...typography }
    }
    
    if (colorScheme) {
      this.currentColorScheme = { ...this.currentColorScheme, ...colorScheme }
    }
    
    if (accessibility) {
      this.currentAccessibilityConfig = { ...this.currentAccessibilityConfig, ...accessibility }
    }
  }

  /**
   * Get current configuration
   */
  getCurrentConfiguration(): {
    typography: TypographyConfig
    colorScheme: ColorScheme
    accessibility: AccessibilityConfig
  } {
    return {
      typography: this.currentConfig,
      colorScheme: this.currentColorScheme,
      accessibility: this.currentAccessibilityConfig
    }
  }
}

// ===== SINGLETON INSTANCE =====

export const islamicTypographyStandards = new IslamicTypographyStandards()

// Export classes for direct use
export {
  ArabicTypographyValidator,
  VisualPresentationValidator,
  AccessibilityComplianceChecker,
  LayoutOptimizer
}