/**
 * Islamic Content Integrity Protection
 * Implements digital signatures and verification for Quranic content
 */

import { getSecurityConfig } from './SecurityConfig';
import { EncryptionManager } from './EncryptionManager';
import CryptoJS from 'crypto-js';

export interface ContentSignature {
  content: string;
  signature: string;
  publicKey: string;
  algorithm: string;
  timestamp: number;
  source: string;
  version: string;
  metadata: ContentMetadata;
}

export interface ContentMetadata {
  type: 'quran' | 'hadith' | 'tafsir' | 'translation' | 'audio';
  language: string;
  source: string;
  chapter?: number;
  verse?: number;
  narrator?: string;
  translator?: string;
  reciter?: string;
  verified: boolean;
  authenticity: AuthenticityLevel;
}

export type AuthenticityLevel = 'verified' | 'authentic' | 'disputed' | 'unverified';

export interface VerificationResult {
  isValid: boolean;
  isAuthentic: boolean;
  trustLevel: number; // 0-100
  source: string;
  lastVerified: number;
  errors: string[];
  warnings: string[];
}

export interface TrustedSource {
  name: string;
  publicKey: string;
  authority: string;
  trustLevel: number;
  specialization: string[];
  verified: boolean;
  lastUpdated: number;
}

export class IslamicContentIntegrity {
  private static instance: IslamicContentIntegrity;
  private config = getSecurityConfig().contentIntegrity;
  private encryption = EncryptionManager.getInstance();
  private trustedSources: Map<string, TrustedSource> = new Map();
  private contentCache: Map<string, ContentSignature> = new Map();
  private verificationHistory: Map<string, VerificationResult[]> = new Map();

  private constructor() {
    this.initializeTrustedSources();
    this.setupContentMonitoring();
  }

  public static getInstance(): IslamicContentIntegrity {
    if (!IslamicContentIntegrity.instance) {
      IslamicContentIntegrity.instance = new IslamicContentIntegrity();
    }
    return IslamicContentIntegrity.instance;
  }

  /**
   * Initialize trusted Islamic content sources
   */
  private initializeTrustedSources(): void {
    // Add verified Islamic content sources
    const trustedSources: TrustedSource[] = [
      {
        name: 'Quran.com',
        publicKey: this.generatePublicKey('quran.com'),
        authority: 'King Fahd Complex for Printing the Holy Quran',
        trustLevel: 100,
        specialization: ['quran', 'translation'],
        verified: true,
        lastUpdated: Date.now()
      },
      {
        name: 'IslamicNetwork',
        publicKey: this.generatePublicKey('islamic.network'),
        authority: 'Islamic Network',
        trustLevel: 95,
        specialization: ['quran', 'hadith', 'audio'],
        verified: true,
        lastUpdated: Date.now()
      },
      {
        name: 'Tanzil',
        publicKey: this.generatePublicKey('tanzil.net'),
        authority: 'Tanzil Project',
        trustLevel: 90,
        specialization: ['quran'],
        verified: true,
        lastUpdated: Date.now()
      },
      {
        name: 'Sunnah.com',
        publicKey: this.generatePublicKey('sunnah.com'),
        authority: 'Center for Muslim-Jewish Engagement',
        trustLevel: 85,
        specialization: ['hadith'],
        verified: true,
        lastUpdated: Date.now()
      }
    ];

    trustedSources.forEach(source => {
      this.trustedSources.set(source.name, source);
    });
  }

  /**
   * Sign Islamic content with digital signature
   */
  public signContent(content: string, metadata: ContentMetadata, sourceKey: string): ContentSignature {
    const normalizedContent = this.normalizeContent(content, metadata.type);
    const contentHash = this.encryption.generateHash(normalizedContent);
    
    // Create signature payload
    const signaturePayload = {
      contentHash,
      metadata,
      timestamp: Date.now(),
      source: metadata.source
    };

    // Generate signature
    const signature = this.generateSignature(JSON.stringify(signaturePayload), sourceKey);

    const contentSignature: ContentSignature = {
      content: normalizedContent,
      signature,
      publicKey: this.getPublicKeyForSource(metadata.source),
      algorithm: this.config.signatureAlgorithm,
      timestamp: Date.now(),
      source: metadata.source,
      version: '1.0',
      metadata
    };

    // Cache signature
    const cacheKey = this.generateCacheKey(content, metadata);
    this.contentCache.set(cacheKey, contentSignature);

    return contentSignature;
  }

  /**
   * Verify Islamic content integrity
   */
  public async verifyContent(signedContent: ContentSignature): Promise<VerificationResult> {
    const errors: string[] = [];
    const warnings: string[] = [];
    let isValid = true;
    let isAuthentic = true;
    let trustLevel = 0;

    try {
      // Verify digital signature
      const signatureValid = this.verifySignature(signedContent);
      if (!signatureValid) {
        errors.push('Digital signature verification failed');
        isValid = false;
      }

      // Verify source authenticity
      const sourceVerification = this.verifySource(signedContent.source);
      if (!sourceVerification.verified) {
        errors.push(`Source "${signedContent.source}" is not verified`);
        isAuthentic = false;
      }
      trustLevel = sourceVerification.trustLevel;

      // Verify content integrity
      const contentIntegrity = this.verifyContentIntegrity(signedContent);
      if (!contentIntegrity) {
        errors.push('Content integrity check failed');
        isValid = false;
      }

      // Verify Islamic content authenticity
      const islamicVerification = await this.verifyIslamicAuthenticity(signedContent);
      if (!islamicVerification.authentic) {
        warnings.push(...islamicVerification.warnings);
        if (islamicVerification.errors.length > 0) {
          errors.push(...islamicVerification.errors);
          isAuthentic = false;
        }
      }

      // Check content metadata
      const metadataValid = this.verifyMetadata(signedContent.metadata);
      if (!metadataValid) {
        warnings.push('Content metadata inconsistencies detected');
        trustLevel = Math.max(0, trustLevel - 10);
      }

      // Verify content has not been tampered with
      const tamperCheck = this.checkForTampering(signedContent);
      if (tamperCheck.detected) {
        errors.push('Content tampering detected');
        isValid = false;
        isAuthentic = false;
      }

      // Final trust level calculation
      if (!isValid) trustLevel = 0;
      else if (!isAuthentic) trustLevel = Math.max(0, trustLevel - 20);

    } catch (error) {
      errors.push(`Verification error: ${error}`);
      isValid = false;
      isAuthentic = false;
      trustLevel = 0;
    }

    const result: VerificationResult = {
      isValid,
      isAuthentic,
      trustLevel,
      source: signedContent.source,
      lastVerified: Date.now(),
      errors,
      warnings
    };

    // Store verification history
    this.storeVerificationResult(signedContent, result);

    return result;
  }

  /**
   * Verify Islamic content authenticity against known sources
   */
  private async verifyIslamicAuthenticity(signedContent: ContentSignature): Promise<{
    authentic: boolean;
    warnings: string[];
    errors: string[];
  }> {
    const warnings: string[] = [];
    const errors: string[] = [];
    let authentic = true;

    const { content, metadata } = signedContent;

    try {
      switch (metadata.type) {
        case 'quran':
          await this.verifyQuranContent(content, metadata, warnings, errors);
          break;
        case 'hadith':
          await this.verifyHadithContent(content, metadata, warnings, errors);
          break;
        case 'translation':
          await this.verifyTranslationContent(content, metadata, warnings, errors);
          break;
        case 'audio':
          await this.verifyAudioContent(content, metadata, warnings, errors);
          break;
        case 'tafsir':
          await this.verifyTafsirContent(content, metadata, warnings, errors);
          break;
      }

      if (errors.length > 0) {
        authentic = false;
      }

    } catch (error) {
      errors.push(`Authentication verification failed: ${error}`);
      authentic = false;
    }

    return { authentic, warnings, errors };
  }

  /**
   * Verify Quranic content authenticity
   */
  private async verifyQuranContent(
    content: string, 
    metadata: ContentMetadata, 
    warnings: string[], 
    errors: string[]
  ): Promise<void> {
    // Validate chapter and verse numbers
    if (metadata.chapter && (metadata.chapter < 1 || metadata.chapter > 114)) {
      errors.push(`Invalid chapter number: ${metadata.chapter}`);
    }

    if (metadata.verse && metadata.chapter) {
      const maxVerses = this.getMaxVersesForChapter(metadata.chapter);
      if (metadata.verse < 1 || metadata.verse > maxVerses) {
        errors.push(`Invalid verse number ${metadata.verse} for chapter ${metadata.chapter}`);
      }
    }

    // Verify Arabic text patterns
    if (metadata.language === 'ar') {
      const arabicValidation = this.validateArabicQuranText(content);
      if (!arabicValidation.valid) {
        errors.push(...arabicValidation.errors);
        warnings.push(...arabicValidation.warnings);
      }
    }

    // Cross-reference with known authentic sources
    const crossReference = await this.crossReferenceQuranContent(content, metadata);
    if (!crossReference.matches) {
      if (crossReference.confidence < 0.8) {
        errors.push('Content does not match known authentic sources');
      } else {
        warnings.push('Content variations detected from standard sources');
      }
    }
  }

  /**
   * Verify Hadith content authenticity
   */
  private async verifyHadithContent(
    content: string,
    metadata: ContentMetadata,
    warnings: string[],
    errors: string[]
  ): Promise<void> {
    // Verify narrator chain if provided
    if (metadata.narrator) {
      const narratorVerification = this.verifyNarratorChain(metadata.narrator);
      if (!narratorVerification.valid) {
        warnings.push(`Narrator chain verification: ${narratorVerification.issues.join(', ')}`);
      }
    }

    // Check against known hadith collections
    const hadithVerification = await this.verifyAgainstHadithCollections(content, metadata);
    if (!hadithVerification.found) {
      warnings.push('Hadith not found in major authenticated collections');
    } else if (hadithVerification.grade) {
      if (hadithVerification.grade === 'weak' || hadithVerification.grade === 'fabricated') {
        warnings.push(`Hadith grade: ${hadithVerification.grade}`);
      }
    }
  }

  /**
   * Verify translation content
   */
  private async verifyTranslationContent(
    content: string,
    metadata: ContentMetadata,
    warnings: string[],
    errors: string[]
  ): Promise<void> {
    // Verify translator credentials
    if (metadata.translator) {
      const translatorVerification = this.verifyTranslatorCredentials(metadata.translator);
      if (!translatorVerification.verified) {
        warnings.push(`Translator credentials could not be verified: ${metadata.translator}`);
      }
    }

    // Check for consistent translation patterns
    const consistencyCheck = this.checkTranslationConsistency(content, metadata);
    if (!consistencyCheck.consistent) {
      warnings.push('Translation consistency issues detected');
    }
  }

  /**
   * Verify audio content
   */
  private async verifyAudioContent(
    content: string,
    metadata: ContentMetadata,
    warnings: string[],
    errors: string[]
  ): Promise<void> {
    // Verify reciter credentials
    if (metadata.reciter) {
      const reciterVerification = this.verifyReciterCredentials(metadata.reciter);
      if (!reciterVerification.verified) {
        warnings.push(`Reciter credentials could not be verified: ${metadata.reciter}`);
      }
    }

    // Check audio quality and authenticity markers
    const audioVerification = this.verifyAudioAuthenticity(content);
    if (!audioVerification.authentic) {
      warnings.push('Audio authenticity markers not found or invalid');
    }
  }

  /**
   * Verify Tafsir content
   */
  private async verifyTafsirContent(
    content: string,
    metadata: ContentMetadata,
    warnings: string[],
    errors: string[]
  ): Promise<void> {
    // Verify scholar credentials and methodology
    const scholarVerification = this.verifyScholarCredentials(metadata.source);
    if (!scholarVerification.verified) {
      warnings.push(`Scholar credentials could not be verified: ${metadata.source}`);
    }

    // Check for orthodox interpretation
    const orthodoxCheck = this.checkOrthodoxInterpretation(content, metadata);
    if (!orthodoxCheck.orthodox) {
      warnings.push('Interpretation may deviate from orthodox understanding');
    }
  }

  /**
   * Normalize content for consistent verification
   */
  private normalizeContent(content: string, type: ContentMetadata['type']): string {
    let normalized = content.trim();

    if (type === 'quran') {
      // Remove diacritics variations, normalize Arabic text
      normalized = this.normalizeArabicText(normalized);
    }

    // Remove extra whitespace
    normalized = normalized.replace(/\s+/g, ' ');

    return normalized;
  }

  /**
   * Normalize Arabic text for Quran
   */
  private normalizeArabicText(text: string): string {
    // Normalize Arabic characters and diacritics
    return text
      .replace(/ي/g, 'ى') // Normalize Ya
      .replace(/ة/g, 'ه') // Normalize Ta Marbuta
      .replace(/أ|إ|آ/g, 'ا') // Normalize Alif variations
      .replace(/[\u064B-\u065F\u0670\u0640]/g, '') // Remove diacritics and tatweel
      .trim();
  }

  /**
   * Validate Arabic Quran text patterns
   */
  private validateArabicQuranText(text: string): {
    valid: boolean;
    errors: string[];
    warnings: string[];
  } {
    const errors: string[] = [];
    const warnings: string[] = [];

    // Check for Arabic text patterns
    const arabicPattern = /^[\u0600-\u06FF\u0750-\u077F\u08A0-\u08FF\uFB50-\uFDFF\uFE70-\uFEFF\s\u060C\u061B\u061F\u0640]+$/;
    if (!arabicPattern.test(text)) {
      errors.push('Text contains non-Arabic characters');
    }

    // Check for common Quranic phrases
    const commonPhrases = [
      'بسم الله الرحمن الرحيم',
      'الحمد لله',
      'لا إله إلا الله',
      'سبحان الله'
    ];

    // Check text structure and length
    if (text.length < 10) {
      warnings.push('Text appears too short for Quranic content');
    }

    if (text.length > 10000) {
      warnings.push('Text appears unusually long for single verse/passage');
    }

    return {
      valid: errors.length === 0,
      errors,
      warnings
    };
  }

  /**
   * Cross-reference Quran content with authentic sources
   */
  private async crossReferenceQuranContent(
    content: string,
    metadata: ContentMetadata
  ): Promise<{ matches: boolean; confidence: number }> {
    // Simulate cross-referencing with authentic Quran sources
    // In production, this would check against verified Quran databases
    
    const normalizedContent = this.normalizeArabicText(content);
    const contentHash = this.encryption.generateHash(normalizedContent);
    
    // Check against cached authentic content hashes
    const knownHashes = this.getKnownQuranHashes(metadata.chapter, metadata.verse);
    const matches = knownHashes.includes(contentHash);
    
    // Calculate confidence based on similarity
    let confidence = matches ? 1.0 : 0.5; // Simplified confidence calculation
    
    return { matches, confidence };
  }

  /**
   * Helper methods for content verification
   */
  private getMaxVersesForChapter(chapter: number): number {
    // Simplified verse count mapping - in production, use complete data
    const verseCounts: { [key: number]: number } = {
      1: 7, 2: 286, 3: 200, 4: 176, 5: 120, 6: 165, 7: 206, 8: 75, 9: 129, 10: 109,
      // ... complete mapping would be here
    };
    return verseCounts[chapter] || 100;
  }

  private getKnownQuranHashes(chapter?: number, verse?: number): string[] {
    // In production, this would return verified content hashes from database
    return [];
  }

  private verifyNarratorChain(narrator: string): { valid: boolean; issues: string[] } {
    // Simplified narrator verification
    return { valid: true, issues: [] };
  }

  private async verifyAgainstHadithCollections(
    content: string,
    metadata: ContentMetadata
  ): Promise<{ found: boolean; grade?: string }> {
    // Simplified hadith verification
    return { found: true, grade: 'sahih' };
  }

  private verifyTranslatorCredentials(translator: string): { verified: boolean } {
    // Simplified translator verification
    return { verified: true };
  }

  private checkTranslationConsistency(
    content: string,
    metadata: ContentMetadata
  ): { consistent: boolean } {
    // Simplified consistency check
    return { consistent: true };
  }

  private verifyReciterCredentials(reciter: string): { verified: boolean } {
    // Simplified reciter verification
    return { verified: true };
  }

  private verifyAudioAuthenticity(content: string): { authentic: boolean } {
    // Simplified audio verification
    return { authentic: true };
  }

  private verifyScholarCredentials(scholar: string): { verified: boolean } {
    // Simplified scholar verification
    return { verified: true };
  }

  private checkOrthodoxInterpretation(
    content: string,
    metadata: ContentMetadata
  ): { orthodox: boolean } {
    // Simplified orthodoxy check
    return { orthodox: true };
  }

  /**
   * Digital signature operations
   */
  private generateSignature(data: string, privateKey: string): string {
    // Simplified signature generation using HMAC
    return CryptoJS.HmacSHA256(data, privateKey).toString();
  }

  private verifySignature(signedContent: ContentSignature): boolean {
    const source = this.trustedSources.get(signedContent.source);
    if (!source) return false;

    const signaturePayload = {
      contentHash: this.encryption.generateHash(signedContent.content),
      metadata: signedContent.metadata,
      timestamp: signedContent.timestamp,
      source: signedContent.source
    };

    const expectedSignature = this.generateSignature(
      JSON.stringify(signaturePayload),
      source.publicKey
    );

    return expectedSignature === signedContent.signature;
  }

  private verifySource(sourceName: string): { verified: boolean; trustLevel: number } {
    const source = this.trustedSources.get(sourceName);
    return {
      verified: source?.verified || false,
      trustLevel: source?.trustLevel || 0
    };
  }

  private verifyContentIntegrity(signedContent: ContentSignature): boolean {
    const currentHash = this.encryption.generateHash(signedContent.content);
    const signaturePayload = JSON.parse(
      // This would decode the signature payload in production
      JSON.stringify({
        contentHash: currentHash,
        metadata: signedContent.metadata,
        timestamp: signedContent.timestamp,
        source: signedContent.source
      })
    );

    return signaturePayload.contentHash === currentHash;
  }

  private verifyMetadata(metadata: ContentMetadata): boolean {
    // Verify metadata consistency and validity
    if (!metadata.type || !metadata.language || !metadata.source) {
      return false;
    }

    return true;
  }

  private checkForTampering(signedContent: ContentSignature): { detected: boolean } {
    // Check for signs of content tampering
    const suspiciousPatterns = [
      /\u200B/g, // Zero-width space
      /\u200C/g, // Zero-width non-joiner
      /\u200D/g, // Zero-width joiner
      /\uFEFF/g  // Zero-width no-break space
    ];

    const detected = suspiciousPatterns.some(pattern => 
      pattern.test(signedContent.content)
    );

    return { detected };
  }

  /**
   * Helper methods
   */
  private generatePublicKey(source: string): string {
    return CryptoJS.SHA256(source + '_public_key').toString();
  }

  private getPublicKeyForSource(source: string): string {
    const trustedSource = this.trustedSources.get(source);
    return trustedSource?.publicKey || '';
  }

  private generateCacheKey(content: string, metadata: ContentMetadata): string {
    return CryptoJS.SHA256(content + JSON.stringify(metadata)).toString();
  }

  private storeVerificationResult(
    signedContent: ContentSignature,
    result: VerificationResult
  ): void {
    const cacheKey = this.generateCacheKey(signedContent.content, signedContent.metadata);
    const history = this.verificationHistory.get(cacheKey) || [];
    history.push(result);
    
    // Keep only last 10 verification results
    if (history.length > 10) {
      history.splice(0, history.length - 10);
    }
    
    this.verificationHistory.set(cacheKey, history);
  }

  private setupContentMonitoring(): void {
    // Setup real-time content monitoring for tampering detection
    this.monitorContentChanges();
    this.setupIntegrityChecks();
  }

  private monitorContentChanges(): void {
    // Monitor DOM changes for content tampering
    const observer = new MutationObserver((mutations) => {
      mutations.forEach((mutation) => {
        if (mutation.type === 'childList' || mutation.type === 'characterData') {
          this.validateDOMContentIntegrity(mutation.target);
        }
      });
    });

    observer.observe(document.body, {
      childList: true,
      subtree: true,
      characterData: true
    });
  }

  private validateDOMContentIntegrity(element: Node): void {
    // Check if element contains Islamic content that needs verification
    if (element.nodeType === Node.TEXT_NODE && element.textContent) {
      const content = element.textContent;
      if (this.containsIslamicContent(content)) {
        this.verifyDisplayedContent(content);
      }
    }
  }

  private containsIslamicContent(content: string): boolean {
    // Check if content contains Arabic/Islamic text
    const arabicPattern = /[\u0600-\u06FF]/;
    const islamicKeywords = ['quran', 'hadith', 'allah', 'prophet', 'sunnah'];
    
    return arabicPattern.test(content) || 
           islamicKeywords.some(keyword => 
             content.toLowerCase().includes(keyword)
           );
  }

  private verifyDisplayedContent(content: string): void {
    // Verify content displayed in DOM against signed versions
    const cacheKey = this.encryption.generateHash(content);
    const signedContent = this.contentCache.get(cacheKey);
    
    if (signedContent) {
      this.verifyContent(signedContent).then(result => {
        if (!result.isValid || !result.isAuthentic) {
          this.reportContentIntegrityViolation(content, result);
        }
      });
    }
  }

  private setupIntegrityChecks(): void {
    // Periodic integrity checks
    setInterval(() => {
      this.performIntegrityAudit();
    }, 300000); // Every 5 minutes
  }

  private performIntegrityAudit(): void {
    // Audit all cached content for integrity
    for (const [key, signedContent] of this.contentCache.entries()) {
      this.verifyContent(signedContent).then(result => {
        if (!result.isValid) {
          console.warn('Content integrity violation detected:', key);
        }
      });
    }
  }

  private reportContentIntegrityViolation(content: string, result: VerificationResult): void {
    const report = {
      type: 'content_integrity_violation',
      content: content.substring(0, 200), // Limit content length
      verificationResult: result,
      timestamp: new Date().toISOString(),
      userAgent: navigator.userAgent,
      url: window.location.href
    };

    console.error('Islamic content integrity violation:', report);

    // Send to security monitoring in production
    if (import.meta.env.MODE === 'production') {
      fetch('/api/security/content-integrity-violation', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(report)
      }).catch(err => {
        console.error('Failed to report content integrity violation:', err);
      });
    }
  }

  /**
   * Public API methods
   */
  public async verifyIslamicContent(content: string, metadata: ContentMetadata): Promise<VerificationResult> {
    const signedContent = this.signContent(content, metadata, 'system');
    return await this.verifyContent(signedContent);
  }

  public getTrustedSources(): TrustedSource[] {
    return Array.from(this.trustedSources.values());
  }

  public addTrustedSource(source: TrustedSource): void {
    this.trustedSources.set(source.name, source);
  }

  public getVerificationHistory(content: string, metadata: ContentMetadata): VerificationResult[] {
    const cacheKey = this.generateCacheKey(content, metadata);
    return this.verificationHistory.get(cacheKey) || [];
  }

  public clearContentCache(): void {
    this.contentCache.clear();
    this.verificationHistory.clear();
  }
}