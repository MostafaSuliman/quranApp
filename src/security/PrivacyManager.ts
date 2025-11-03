/**
 * Privacy Manager for GDPR/CCPA Compliance
 * Implements comprehensive privacy controls and data protection
 */

import { getSecurityConfig } from './SecurityConfig';
import { EncryptionManager } from './EncryptionManager';
import { XSSProtection } from './XSSProtection';

export interface PrivacySettings {
  analytics: boolean;
  marketing: boolean;
  functional: boolean;
  personalization: boolean;
  dataSharing: boolean;
  location: boolean;
  biometric: boolean;
  advertising: boolean;
}

export interface ConsentRecord {
  userId?: string;
  sessionId: string;
  consentGiven: boolean;
  consentWithdrawn: boolean;
  purposes: PrivacySettings;
  timestamp: number;
  version: string;
  ipAddress: string;
  userAgent: string;
  method: 'explicit' | 'implicit' | 'inferred';
  granularity: 'global' | 'purpose-specific' | 'data-specific';
}

export interface DataProcessingRecord {
  id: string;
  userId?: string;
  dataType: DataType;
  purpose: ProcessingPurpose;
  legalBasis: LegalBasis;
  processingDate: number;
  retentionPeriod: number;
  anonymized: boolean;
  encrypted: boolean;
  location: string;
  thirdPartySharing: boolean;
  dataMinimized: boolean;
}

export interface PrivacyRequest {
  id: string;
  userId?: string;
  type: PrivacyRequestType;
  status: 'pending' | 'processing' | 'completed' | 'rejected';
  requestDate: number;
  completionDate?: number;
  description: string;
  data?: any;
  verification: VerificationData;
}

export interface VerificationData {
  method: 'email' | 'phone' | 'identity_document' | 'security_question';
  verified: boolean;
  verificationDate?: number;
  attempts: number;
}

export type DataType = 
  | 'personal_info'
  | 'contact_info'
  | 'device_info'
  | 'usage_data'
  | 'location_data'
  | 'biometric_data'
  | 'religious_preferences'
  | 'learning_progress'
  | 'audio_recordings';

export type ProcessingPurpose = 
  | 'service_provision'
  | 'personalization'
  | 'analytics'
  | 'marketing'
  | 'security'
  | 'legal_compliance'
  | 'religious_education'
  | 'community_features';

export type LegalBasis = 
  | 'consent'
  | 'contract'
  | 'legal_obligation'
  | 'vital_interests'
  | 'public_task'
  | 'legitimate_interests';

export type PrivacyRequestType = 
  | 'access'
  | 'rectification'
  | 'erasure'
  | 'portability'
  | 'restriction'
  | 'objection'
  | 'withdraw_consent';

export class PrivacyManager {
  private static instance: PrivacyManager;
  private config = getSecurityConfig().privacy;
  private encryption = EncryptionManager.getInstance();
  private consentRecords: Map<string, ConsentRecord[]> = new Map();
  private processingRecords: Map<string, DataProcessingRecord[]> = new Map();
  private privacyRequests: Map<string, PrivacyRequest> = new Map();
  private dataInventory: Map<string, any> = new Map();

  private constructor() {
    this.initializePrivacySystem();
  }

  public static getInstance(): PrivacyManager {
    if (!PrivacyManager.instance) {
      PrivacyManager.instance = new PrivacyManager();
    }
    return PrivacyManager.instance;
  }

  /**
   * Initialize privacy management system
   */
  private initializePrivacySystem(): void {
    this.loadConsentRecords();
    this.setupDataRetentionCleanup();
    this.initializePrivacyUI();
    this.setupCookieConsent();
  }

  /**
   * Record user consent
   */
  public recordConsent(consent: Partial<ConsentRecord>): string {
    const sessionId = this.generateSessionId();
    const consentRecord: ConsentRecord = {
      sessionId,
      consentGiven: consent.consentGiven || false,
      consentWithdrawn: consent.consentWithdrawn || false,
      purposes: consent.purposes || this.getDefaultPrivacySettings(),
      timestamp: Date.now(),
      version: this.getPrivacyPolicyVersion(),
      ipAddress: this.getClientIP(),
      userAgent: navigator.userAgent,
      method: consent.method || 'explicit',
      granularity: consent.granularity || 'purpose-specific',
      ...consent
    };

    // Store consent record
    const userId = consent.userId || 'anonymous';
    const userConsents = this.consentRecords.get(userId) || [];
    userConsents.push(consentRecord);
    this.consentRecords.set(userId, userConsents);

    // Persist consent
    this.persistConsentRecord(consentRecord);

    // Apply consent settings
    this.applyConsentSettings(consentRecord);

    return sessionId;
  }

  /**
   * Withdraw consent
   */
  public withdrawConsent(userId: string, purposes?: (keyof PrivacySettings)[]): void {
    const currentConsent = this.getCurrentConsent(userId);
    if (!currentConsent) return;

    const withdrawalRecord: ConsentRecord = {
      userId,
      sessionId: this.generateSessionId(),
      consentGiven: false,
      consentWithdrawn: true,
      purposes: purposes ? 
        { ...currentConsent.purposes, ...Object.fromEntries(purposes.map(p => [p, false])) } :
        Object.fromEntries(Object.keys(currentConsent.purposes).map(k => [k, false])),
      timestamp: Date.now(),
      version: this.getPrivacyPolicyVersion(),
      ipAddress: this.getClientIP(),
      userAgent: navigator.userAgent,
      method: 'explicit',
      granularity: 'purpose-specific'
    };

    this.recordConsent(withdrawalRecord);

    // Trigger data deletion if required
    if (!purposes || purposes.length === 0) {
      this.initiateDataDeletion(userId);
    }
  }

  /**
   * Get current consent status
   */
  public getCurrentConsent(userId: string): ConsentRecord | null {
    const userConsents = this.consentRecords.get(userId) || [];
    return userConsents.length > 0 ? userConsents[userConsents.length - 1] : null;
  }

  /**
   * Check if processing is allowed for specific purpose
   */
  public isProcessingAllowed(userId: string, purpose: keyof PrivacySettings): boolean {
    const consent = this.getCurrentConsent(userId);
    if (!consent) return false;

    return consent.consentGiven && consent.purposes[purpose];
  }

  /**
   * Record data processing activity
   */
  public recordDataProcessing(processing: Partial<DataProcessingRecord>): string {
    const record: DataProcessingRecord = {
      id: this.generateProcessingId(),
      processingDate: Date.now(),
      retentionPeriod: this.config.dataRetentionPeriod,
      anonymized: false,
      encrypted: true,
      location: 'local',
      thirdPartySharing: false,
      dataMinimized: true,
      ...processing,
      dataType: processing.dataType || 'usage_data',
      purpose: processing.purpose || 'service_provision',
      legalBasis: processing.legalBasis || 'consent'
    };

    // Store processing record
    const userId = record.userId || 'anonymous';
    const userProcessing = this.processingRecords.get(userId) || [];
    userProcessing.push(record);
    this.processingRecords.set(userId, userProcessing);

    // Persist processing record
    this.persistProcessingRecord(record);

    return record.id;
  }

  /**
   * Handle privacy request (GDPR/CCPA)
   */
  public async handlePrivacyRequest(request: Partial<PrivacyRequest>): Promise<string> {
    const privacyRequest: PrivacyRequest = {
      id: this.generateRequestId(),
      type: request.type || 'access',
      status: 'pending',
      requestDate: Date.now(),
      description: request.description || '',
      verification: {
        method: 'email',
        verified: false,
        attempts: 0
      },
      ...request
    };

    this.privacyRequests.set(privacyRequest.id, privacyRequest);

    // Start verification process
    await this.initiateVerification(privacyRequest);

    // Process request based on type
    switch (privacyRequest.type) {
      case 'access':
        await this.processDataAccessRequest(privacyRequest);
        break;
      case 'erasure':
        await this.processDataErasureRequest(privacyRequest);
        break;
      case 'portability':
        await this.processDataPortabilityRequest(privacyRequest);
        break;
      case 'rectification':
        await this.processDataRectificationRequest(privacyRequest);
        break;
      default:
        privacyRequest.status = 'processing';
    }

    return privacyRequest.id;
  }

  /**
   * Process data access request
   */
  private async processDataAccessRequest(request: PrivacyRequest): Promise<void> {
    if (!request.userId) return;

    try {
      const userData = await this.collectUserData(request.userId);
      request.data = userData;
      request.status = 'completed';
      request.completionDate = Date.now();
    } catch (error) {
      console.error('Data access request failed:', error);
      request.status = 'rejected';
    }

    this.privacyRequests.set(request.id, request);
  }

  /**
   * Process data erasure request
   */
  private async processDataErasureRequest(request: PrivacyRequest): Promise<void> {
    if (!request.userId) return;

    try {
      await this.eraseUserData(request.userId);
      request.status = 'completed';
      request.completionDate = Date.now();
    } catch (error) {
      console.error('Data erasure request failed:', error);
      request.status = 'rejected';
    }

    this.privacyRequests.set(request.id, request);
  }

  /**
   * Process data portability request
   */
  private async processDataPortabilityRequest(request: PrivacyRequest): Promise<void> {
    if (!request.userId) return;

    try {
      const portableData = await this.exportUserDataPortable(request.userId);
      request.data = portableData;
      request.status = 'completed';
      request.completionDate = Date.now();
    } catch (error) {
      console.error('Data portability request failed:', error);
      request.status = 'rejected';
    }

    this.privacyRequests.set(request.id, request);
  }

  /**
   * Process data rectification request
   */
  private async processDataRectificationRequest(request: PrivacyRequest): Promise<void> {
    if (!request.userId || !request.data) return;

    try {
      await this.updateUserData(request.userId, request.data);
      request.status = 'completed';
      request.completionDate = Date.now();
    } catch (error) {
      console.error('Data rectification request failed:', error);
      request.status = 'rejected';
    }

    this.privacyRequests.set(request.id, request);
  }

  /**
   * Collect all user data for access request
   */
  private async collectUserData(userId: string): Promise<any> {
    const userData = {
      personal: this.encryption.getSecureItem(`user_${userId}`),
      consents: this.consentRecords.get(userId) || [],
      processing: this.processingRecords.get(userId) || [],
      preferences: this.encryption.getSecureItem(`preferences_${userId}`),
      progress: this.encryption.getSecureItem(`progress_${userId}`),
      sessions: this.encryption.getSecureItem(`sessions_${userId}`)
    };

    // Anonymize sensitive data
    return this.anonymizeDataForExport(userData);
  }

  /**
   * Erase all user data
   */
  private async eraseUserData(userId: string): Promise<void> {
    // Remove from encrypted storage
    const dataKeys = [
      `user_${userId}`,
      `preferences_${userId}`,
      `progress_${userId}`,
      `sessions_${userId}`
    ];

    dataKeys.forEach(key => {
      this.encryption.removeSecureItem(key);
    });

    // Remove consent and processing records
    this.consentRecords.delete(userId);
    this.processingRecords.delete(userId);

    // Remove from data inventory
    this.dataInventory.delete(userId);

    // Anonymize remaining data that cannot be deleted
    await this.anonymizeRemainingData(userId);
  }

  /**
   * Export user data in portable format
   */
  private async exportUserDataPortable(userId: string): Promise<any> {
    const userData = await this.collectUserData(userId);
    
    return {
      format: 'JSON',
      version: '1.0',
      exportDate: new Date().toISOString(),
      data: userData,
      schema: this.getDataSchema()
    };
  }

  /**
   * Update user data for rectification
   */
  private async updateUserData(userId: string, updates: any): Promise<void> {
    const currentData = this.encryption.getSecureItem(`user_${userId}`);
    if (currentData) {
      const updatedData = { ...currentData, ...updates };
      this.encryption.setSecureItem(`user_${userId}`, updatedData);
    }
  }

  /**
   * Anonymize data for export
   */
  private anonymizeDataForExport(data: any): any {
    // Create deep copy
    const anonymized = JSON.parse(JSON.stringify(data));
    
    // Remove or hash sensitive identifiers
    if (anonymized.personal) {
      delete anonymized.personal.passwordHash;
      delete anonymized.personal.twoFactorSecret;
      if (anonymized.personal.email) {
        anonymized.personal.email = this.hashEmail(anonymized.personal.email);
      }
    }

    return anonymized;
  }

  /**
   * Anonymize remaining data that cannot be deleted
   */
  private async anonymizeRemainingData(userId: string): Promise<void> {
    // This would anonymize data in analytics, logs, etc.
    // that cannot be immediately deleted but needs to be anonymized
    const anonymousId = this.generateAnonymousId();
    
    // Replace user ID with anonymous ID in logs, analytics, etc.
    // Implementation depends on your logging and analytics systems
  }

  /**
   * Hash email for anonymization
   */
  private hashEmail(email: string): string {
    return this.encryption.generateHash(email).substring(0, 16) + '@anonymized.local';
  }

  /**
   * Generate anonymous ID
   */
  private generateAnonymousId(): string {
    return 'anon_' + this.encryption.generateSecureToken(16);
  }

  /**
   * Get data schema for portability
   */
  private getDataSchema(): any {
    return {
      personal: {
        type: 'object',
        description: 'Personal user information'
      },
      consents: {
        type: 'array',
        description: 'Consent records'
      },
      processing: {
        type: 'array',
        description: 'Data processing records'
      },
      preferences: {
        type: 'object',
        description: 'User preferences and settings'
      },
      progress: {
        type: 'object',
        description: 'Learning progress and achievements'
      }
    };
  }

  /**
   * Setup cookie consent banner
   */
  private setupCookieConsent(): void {
    if (!this.hasValidConsent()) {
      this.showConsentBanner();
    }
  }

  /**
   * Check if user has valid consent
   */
  private hasValidConsent(): boolean {
    const consent = this.getCurrentConsent('current_user'); // Replace with actual user ID
    if (!consent) return false;

    // Check if consent is still valid (not expired)
    const consentAge = Date.now() - consent.timestamp;
    const maxAge = 365 * 24 * 60 * 60 * 1000; // 1 year

    return consentAge < maxAge && consent.consentGiven;
  }

  /**
   * Show consent banner
   */
  private showConsentBanner(): void {
    const banner = document.createElement('div');
    banner.id = 'privacy-consent-banner';
    banner.style.cssText = `
      position: fixed;
      bottom: 0;
      left: 0;
      right: 0;
      background: #2d3748;
      color: white;
      padding: 20px;
      z-index: 10000;
      box-shadow: 0 -2px 10px rgba(0,0,0,0.3);
    `;

    // Create banner content safely without innerHTML
    const xssProtection = XSSProtection.getInstance();
    const safeContent = `
      <div style="max-width: 1200px; margin: 0 auto; display: flex; align-items: center; justify-content: space-between; flex-wrap: wrap; gap: 15px;">
        <div style="flex: 1; min-width: 300px;">
          <h3 style="margin: 0 0 10px 0; font-size: 18px;">🔒 Your Privacy Matters</h3>
          <p style="margin: 0; font-size: 14px; line-height: 1.4;">
            We use cookies and similar technologies to provide our Islamic learning services, analyze usage, and improve your experience.
            Your data is encrypted and handled in accordance with Islamic principles of privacy and trust.
          </p>
        </div>
        <div style="display: flex; gap: 10px; flex-wrap: wrap;">
          <button id="privacy-accept-all" style="background: #38a169; color: white; border: none; padding: 12px 24px; border-radius: 6px; cursor: pointer; font-weight: bold;">
            Accept All
          </button>
          <button id="privacy-customize" style="background: transparent; color: white; border: 1px solid white; padding: 12px 24px; border-radius: 6px; cursor: pointer;">
            Customize
          </button>
          <button id="privacy-decline" style="background: #e53e3e; color: white; border: none; padding: 12px 24px; border-radius: 6px; cursor: pointer;">
            Decline
          </button>
        </div>
      </div>
    `;
    xssProtection.setSafeInnerHTML(banner, safeContent);

    document.body.appendChild(banner);

    // Add event listeners
    document.getElementById('privacy-accept-all')?.addEventListener('click', () => {
      this.acceptAllConsent();
      banner.remove();
    });

    document.getElementById('privacy-customize')?.addEventListener('click', () => {
      this.showPrivacySettings();
      banner.remove();
    });

    document.getElementById('privacy-decline')?.addEventListener('click', () => {
      this.declineAllConsent();
      banner.remove();
    });
  }

  /**
   * Accept all consent
   */
  private acceptAllConsent(): void {
    const settings: PrivacySettings = {
      analytics: true,
      marketing: false, // Default to false for Islamic app
      functional: true,
      personalization: true,
      dataSharing: false,
      location: false,
      biometric: false,
      advertising: false
    };

    this.recordConsent({
      consentGiven: true,
      purposes: settings,
      method: 'explicit',
      granularity: 'purpose-specific'
    });
  }

  /**
   * Decline all consent
   */
  private declineAllConsent(): void {
    const settings: PrivacySettings = {
      analytics: false,
      marketing: false,
      functional: true, // Essential for app functionality
      personalization: false,
      dataSharing: false,
      location: false,
      biometric: false,
      advertising: false
    };

    this.recordConsent({
      consentGiven: false,
      purposes: settings,
      method: 'explicit',
      granularity: 'purpose-specific'
    });
  }

  /**
   * Show privacy settings modal
   */
  private showPrivacySettings(): void {
    // Implementation for detailed privacy settings modal
    // This would show a detailed interface for granular consent
  }

  /**
   * Initialize privacy UI components
   */
  private initializePrivacyUI(): void {
    // Add privacy policy link to footer
    this.addPrivacyPolicyLink();
    
    // Add data request links
    this.addDataRequestLinks();
  }

  /**
   * Add privacy policy link
   */
  private addPrivacyPolicyLink(): void {
    const link = document.createElement('a');
    link.href = '/privacy-policy';
    link.textContent = 'Privacy Policy';
    link.style.cssText = 'color: #4a5568; text-decoration: none; font-size: 14px;';
    
    // Add to footer if it exists
    const footer = document.querySelector('footer');
    if (footer) {
      footer.appendChild(link);
    }
  }

  /**
   * Add data request links
   */
  private addDataRequestLinks(): void {
    const container = document.createElement('div');

    // Use XSS Protection to safely set HTML content
    const xssProtection = XSSProtection.getInstance();
    const safeContent = `
      <div style="margin: 20px 0; padding: 15px; background: #f7fafc; border-radius: 8px; border-left: 4px solid #38a169;">
        <h4 style="margin: 0 0 10px 0; color: #2d3748;">Your Data Rights</h4>
        <p style="margin: 0 0 10px 0; font-size: 14px; color: #4a5568;">
          You have the right to access, rectify, or delete your personal data. Contact us to exercise your rights.
        </p>
        <div id="data-rights-buttons" style="display: flex; gap: 10px; flex-wrap: wrap;">
        </div>
      </div>
    `;
    xssProtection.setSafeInnerHTML(container, safeContent);

    // Create buttons safely with event listeners instead of inline onclick
    const buttonsContainer = container.querySelector('#data-rights-buttons');
    if (buttonsContainer) {
      const accessButton = document.createElement('button');
      accessButton.textContent = 'Request My Data';
      accessButton.style.cssText = 'background: #38a169; color: white; border: none; padding: 8px 16px; border-radius: 4px; cursor: pointer; font-size: 12px;';
      accessButton.addEventListener('click', () => this.requestDataAccess());

      const deleteButton = document.createElement('button');
      deleteButton.textContent = 'Delete My Data';
      deleteButton.style.cssText = 'background: #e53e3e; color: white; border: none; padding: 8px 16px; border-radius: 4px; cursor: pointer; font-size: 12px;';
      deleteButton.addEventListener('click', () => this.requestDataDeletion());

      buttonsContainer.appendChild(accessButton);
      buttonsContainer.appendChild(deleteButton);
    }

    // Add to settings page if it exists
    const settingsPage = document.querySelector('#settings, .settings');
    if (settingsPage) {
      settingsPage.appendChild(container);
    }

    // Make privacy manager globally accessible
    (window as any).privacyManager = this;
  }

  /**
   * Request data access (public method)
   */
  public async requestDataAccess(): Promise<void> {
    const userId = this.getCurrentUserId();
    if (userId) {
      await this.handlePrivacyRequest({
        userId,
        type: 'access',
        description: 'User requested access to their data'
      });
      alert('Data access request submitted. You will receive your data within 30 days.');
    }
  }

  /**
   * Request data deletion (public method)
   */
  public async requestDataDeletion(): Promise<void> {
    const userId = this.getCurrentUserId();
    if (userId && confirm('Are you sure you want to delete all your data? This action cannot be undone.')) {
      await this.handlePrivacyRequest({
        userId,
        type: 'erasure',
        description: 'User requested deletion of their data'
      });
      alert('Data deletion request submitted. Your data will be deleted within 30 days.');
    }
  }

  /**
   * Helper methods
   */
  private getDefaultPrivacySettings(): PrivacySettings {
    return {
      analytics: false,
      marketing: false,
      functional: true,
      personalization: false,
      dataSharing: false,
      location: false,
      biometric: false,
      advertising: false
    };
  }

  private generateSessionId(): string {
    return 'session_' + this.encryption.generateSecureToken(16);
  }

  private generateProcessingId(): string {
    return 'proc_' + this.encryption.generateSecureToken(16);
  }

  private generateRequestId(): string {
    return 'req_' + this.encryption.generateSecureToken(16);
  }

  private getPrivacyPolicyVersion(): string {
    return '1.0.0';
  }

  private getClientIP(): string {
    // In a real application, this would be provided by the server
    return 'unknown';
  }

  private getCurrentUserId(): string | null {
    // This would get the current authenticated user ID
    return 'current_user'; // Replace with actual implementation
  }

  private async initiateVerification(request: PrivacyRequest): Promise<void> {
    // Implementation for user verification process
    request.verification.verified = true; // Simplified for demo
  }

  private async initiateDataDeletion(userId: string): Promise<void> {
    // Schedule data deletion
    setTimeout(() => {
      this.eraseUserData(userId);
    }, 30 * 24 * 60 * 60 * 1000); // 30 days
  }

  private persistConsentRecord(record: ConsentRecord): void {
    this.encryption.setSecureItem(`consent_${record.sessionId}`, record);
  }

  private persistProcessingRecord(record: DataProcessingRecord): void {
    this.encryption.setSecureItem(`processing_${record.id}`, record);
  }

  private loadConsentRecords(): void {
    // Load consent records from secure storage
    // Implementation depends on storage backend
  }

  private applyConsentSettings(consent: ConsentRecord): void {
    // Apply consent settings to analytics, marketing, etc.
    if (!consent.purposes.analytics) {
      this.disableAnalytics();
    }
    if (!consent.purposes.marketing) {
      this.disableMarketing();
    }
    // etc.
  }

  private disableAnalytics(): void {
    // Disable analytics tracking
    (window as any).gtag?.('consent', 'update', {
      analytics_storage: 'denied'
    });
  }

  private disableMarketing(): void {
    // Disable marketing tracking
    (window as any).gtag?.('consent', 'update', {
      ad_storage: 'denied'
    });
  }

  private setupDataRetentionCleanup(): void {
    // Automatically delete expired data
    setInterval(() => {
      this.cleanupExpiredData();
    }, 24 * 60 * 60 * 1000); // Daily cleanup
  }

  private cleanupExpiredData(): void {
    const now = Date.now();
    
    // Clean up processing records past retention period
    for (const [userId, records] of this.processingRecords.entries()) {
      const validRecords = records.filter(record => 
        now - record.processingDate < record.retentionPeriod
      );
      this.processingRecords.set(userId, validRecords);
    }
  }
}