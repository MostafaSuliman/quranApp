/**
 * Uptime Monitoring Service for QuranApp
 * 
 * Comprehensive uptime monitoring with 99.9% SLA target,
 * real-time health checks, alert systems, and recovery mechanisms.
 */

interface UptimeMetrics {
  uptime: number;
  totalChecks: number;
  successfulChecks: number;
  failedChecks: number;
  averageResponseTime: number;
  lastDowntime?: Date;
  downtimeEvents: DowntimeEvent[];
  currentStatus: 'online' | 'degraded' | 'offline';
  slaCompliance: number; // Percentage
}

interface DowntimeEvent {
  startTime: Date;
  endTime?: Date;
  duration?: number; // in milliseconds
  reason: string;
  severity: 'minor' | 'major' | 'critical';
  resolved: boolean;
  recoveryActions: string[];
}

interface HealthCheckEndpoint {
  name: string;
  url: string;
  method: 'GET' | 'POST' | 'HEAD';
  timeout: number;
  expectedStatus: number;
  expectedContent?: string;
  critical: boolean;
  islamicCompliance?: boolean;
}

interface AlertRule {
  name: string;
  condition: string;
  threshold: number;
  duration: number; // Duration in ms before alert fires
  severity: 'low' | 'medium' | 'high' | 'critical';
  channels: string[]; // notification channels
  enabled: boolean;
}

class UptimeMonitorService {
  private metrics: UptimeMetrics = {
    uptime: 100,
    totalChecks: 0,
    successfulChecks: 0,
    failedChecks: 0,
    averageResponseTime: 0,
    downtimeEvents: [],
    currentStatus: 'online',
    slaCompliance: 100
  };

  private healthCheckEndpoints: HealthCheckEndpoint[] = [
    {
      name: 'Main Application',
      url: '/health',
      method: 'GET',
      timeout: 5000,
      expectedStatus: 200,
      critical: true
    },
    {
      name: 'Quran API',
      url: '/api/quran/health',
      method: 'GET',
      timeout: 3000,
      expectedStatus: 200,
      critical: true,
      islamicCompliance: true
    },
    {
      name: 'Audio Service',
      url: '/api/audio/health',
      method: 'GET',
      timeout: 5000,
      expectedStatus: 200,
      critical: true
    },
    {
      name: 'Islamic Content Validator',
      url: '/api/islamic/validate/health',
      method: 'GET',
      timeout: 2000,
      expectedStatus: 200,
      critical: true,
      islamicCompliance: true
    },
    {
      name: 'Performance Monitor',
      url: '/api/performance/health',
      method: 'GET',
      timeout: 1000,
      expectedStatus: 200,
      critical: false
    },
    {
      name: 'Auto-Fix System',
      url: '/api/autofix/health',
      method: 'GET',
      timeout: 2000,
      expectedStatus: 200,
      critical: false
    }
  ];

  private alertRules: AlertRule[] = [
    {
      name: 'High Response Time',
      condition: 'responseTime',
      threshold: 2000, // 2 seconds
      duration: 60000, // 1 minute
      severity: 'medium',
      channels: ['console', 'ui'],
      enabled: true
    },
    {
      name: 'Service Unavailable',
      condition: 'status',
      threshold: 500, // HTTP 500+
      duration: 30000, // 30 seconds
      severity: 'critical',
      channels: ['console', 'ui', 'emergency'],
      enabled: true
    },
    {
      name: 'Islamic Compliance Violation',
      condition: 'islamicCompliance',
      threshold: 1, // Any violation
      duration: 0, // Immediate
      severity: 'critical',
      channels: ['console', 'ui', 'emergency'],
      enabled: true
    },
    {
      name: 'SLA Breach Warning',
      condition: 'slaCompliance',
      threshold: 99.9, // Below 99.9%
      duration: 300000, // 5 minutes
      severity: 'high',
      channels: ['console', 'ui'],
      enabled: true
    }
  ];

  private monitoringInterval: NodeJS.Timeout | null = null;
  private startTime: Date = new Date();
  private listeners: Map<string, Function[]> = new Map();

  /**
   * Initialize uptime monitoring
   */
  public async initialize(): Promise<void> {
    console.log('🔄 Initializing Uptime Monitor...');
    
    // Set start time
    this.startTime = new Date();
    
    // Load persisted metrics if available
    await this.loadPersistedMetrics();
    
    // Start monitoring
    this.startMonitoring();
    
    // Setup recovery mechanisms
    this.setupRecoveryMechanisms();
    
    console.log('✅ Uptime Monitor initialized successfully');
  }

  /**
   * Start continuous monitoring
   */
  private startMonitoring(): void {
    // Run health checks every 30 seconds
    this.monitoringInterval = setInterval(async () => {
      await this.runHealthChecks();
    }, 30000);

    // Run initial health check
    this.runHealthChecks();
  }

  /**
   * Stop monitoring
   */
  public stopMonitoring(): void {
    if (this.monitoringInterval) {
      clearInterval(this.monitoringInterval);
      this.monitoringInterval = null;
    }
  }

  /**
   * Run health checks on all endpoints
   */
  private async runHealthChecks(): Promise<void> {
    const checkPromises = this.healthCheckEndpoints.map(endpoint => 
      this.checkEndpoint(endpoint)
    );

    const results = await Promise.allSettled(checkPromises);
    
    let successCount = 0;
    let totalResponseTime = 0;
    let criticalFailures = 0;
    let islamicComplianceIssues = 0;

    results.forEach((result, index) => {
      const endpoint = this.healthCheckEndpoints[index];
      
      if (result.status === 'fulfilled') {
        const { success, responseTime, islamicCompliant } = result.value;
        
        if (success) {
          successCount++;
          totalResponseTime += responseTime;
        } else {
          if (endpoint.critical) {
            criticalFailures++;
          }
        }

        if (endpoint.islamicCompliance && !islamicCompliant) {
          islamicComplianceIssues++;
        }
      } else {
        if (endpoint.critical) {
          criticalFailures++;
        }
      }
    });

    // Update metrics
    this.updateMetrics(successCount, results.length, totalResponseTime / successCount);
    
    // Determine current status
    const newStatus = this.determineStatus(criticalFailures, successCount, results.length);
    
    // Handle status changes
    if (newStatus !== this.metrics.currentStatus) {
      await this.handleStatusChange(this.metrics.currentStatus, newStatus);
    }

    this.metrics.currentStatus = newStatus;

    // Check alert rules
    await this.evaluateAlerts(islamicComplianceIssues);

    // Persist metrics
    await this.persistMetrics();

    // Notify listeners
    this.notifyListeners('healthCheck', this.metrics);
  }

  /**
   * Check individual endpoint health
   */
  private async checkEndpoint(endpoint: HealthCheckEndpoint): Promise<{
    success: boolean;
    responseTime: number;
    islamicCompliant: boolean;
    error?: string;
  }> {
    const startTime = Date.now();
    
    try {
      // For demo purposes, we'll simulate the health check
      // In production, this would make actual HTTP requests
      const simulatedResponseTime = Math.random() * 1000 + 100; // 100-1100ms
      const simulatedSuccess = Math.random() > 0.02; // 98% success rate
      const simulatedIslamicCompliant = endpoint.islamicCompliance ? Math.random() > 0.001 : true; // 99.9% compliance

      // Simulate network delay
      await new Promise(resolve => setTimeout(resolve, Math.min(simulatedResponseTime, endpoint.timeout)));

      const responseTime = Date.now() - startTime;

      if (!simulatedSuccess) {
        throw new Error(`Endpoint ${endpoint.name} returned error status`);
      }

      return {
        success: true,
        responseTime,
        islamicCompliant: simulatedIslamicCompliant
      };

    } catch (error) {
      const responseTime = Date.now() - startTime;
      
      return {
        success: false,
        responseTime,
        islamicCompliant: false,
        error: error instanceof Error ? error.message : 'Unknown error'
      };
    }
  }

  /**
   * Update monitoring metrics
   */
  private updateMetrics(successCount: number, totalChecks: number, avgResponseTime: number): void {
    this.metrics.totalChecks += totalChecks;
    this.metrics.successfulChecks += successCount;
    this.metrics.failedChecks += (totalChecks - successCount);

    // Calculate uptime percentage
    this.metrics.uptime = (this.metrics.successfulChecks / this.metrics.totalChecks) * 100;

    // Update average response time (weighted average)
    const alpha = 0.1; // Smoothing factor
    this.metrics.averageResponseTime = 
      (alpha * avgResponseTime) + ((1 - alpha) * this.metrics.averageResponseTime);

    // Calculate SLA compliance (99.9% target)
    const uptimeMinutes = (Date.now() - this.startTime.getTime()) / (1000 * 60);
    const allowedDowntimeMinutes = uptimeMinutes * 0.001; // 0.1% downtime allowed
    const actualDowntimeMinutes = this.getTotalDowntimeMinutes();
    
    this.metrics.slaCompliance = Math.max(0, 
      ((uptimeMinutes - actualDowntimeMinutes) / uptimeMinutes) * 100
    );
  }

  /**
   * Determine system status based on health checks
   */
  private determineStatus(criticalFailures: number, successCount: number, totalChecks: number): 'online' | 'degraded' | 'offline' {
    if (criticalFailures > 0) {
      return 'offline';
    }
    
    const successRate = successCount / totalChecks;
    if (successRate < 0.8) {
      return 'degraded';
    }
    
    return 'online';
  }

  /**
   * Handle status changes and record downtime events
   */
  private async handleStatusChange(oldStatus: string, newStatus: string): Promise<void> {
    console.log(`🔄 Status change: ${oldStatus} → ${newStatus}`);

    if (newStatus === 'offline' || newStatus === 'degraded') {
      // Start downtime event
      const downtimeEvent: DowntimeEvent = {
        startTime: new Date(),
        reason: `Status changed from ${oldStatus} to ${newStatus}`,
        severity: newStatus === 'offline' ? 'critical' : 'major',
        resolved: false,
        recoveryActions: []
      };

      this.metrics.downtimeEvents.push(downtimeEvent);
      this.metrics.lastDowntime = downtimeEvent.startTime;

      // Trigger recovery mechanisms
      await this.triggerRecovery(newStatus);

    } else if (oldStatus !== 'online' && newStatus === 'online') {
      // End downtime event
      const lastEvent = this.metrics.downtimeEvents[this.metrics.downtimeEvents.length - 1];
      if (lastEvent && !lastEvent.resolved) {
        lastEvent.endTime = new Date();
        lastEvent.duration = lastEvent.endTime.getTime() - lastEvent.startTime.getTime();
        lastEvent.resolved = true;
        
        console.log(`✅ Service recovered after ${lastEvent.duration}ms downtime`);
      }
    }
  }

  /**
   * Evaluate alert rules and trigger notifications
   */
  private async evaluateAlerts(islamicComplianceIssues: number): Promise<void> {
    for (const rule of this.alertRules.filter(r => r.enabled)) {
      let shouldAlert = false;

      switch (rule.condition) {
        case 'responseTime':
          shouldAlert = this.metrics.averageResponseTime > rule.threshold;
          break;
        case 'status':
          shouldAlert = this.metrics.currentStatus === 'offline';
          break;
        case 'islamicCompliance':
          shouldAlert = islamicComplianceIssues > rule.threshold;
          break;
        case 'slaCompliance':
          shouldAlert = this.metrics.slaCompliance < rule.threshold;
          break;
      }

      if (shouldAlert) {
        await this.triggerAlert(rule);
      }
    }
  }

  /**
   * Trigger alert notifications
   */
  private async triggerAlert(rule: AlertRule): Promise<void> {
    const alertMessage = `🚨 Alert: ${rule.name} (${rule.severity.toUpperCase()})`;
    
    console.warn(alertMessage, {
      rule: rule.name,
      severity: rule.severity,
      metrics: this.metrics
    });

    // Notify UI listeners
    this.notifyListeners('alert', { rule, metrics: this.metrics });

    // In production, this would send notifications through various channels
    for (const channel of rule.channels) {
      switch (channel) {
        case 'console':
          console.warn(`[${channel.toUpperCase()}] ${alertMessage}`);
          break;
        case 'ui':
          // UI notification would be handled by listeners
          break;
        case 'emergency':
          console.error(`[EMERGENCY] ${alertMessage} - Immediate attention required!`);
          break;
      }
    }
  }

  /**
   * Setup automated recovery mechanisms
   */
  private setupRecoveryMechanisms(): void {
    // Auto-restart services on failure
    this.addEventListener('statusChange', async (status) => {
      if (status === 'offline') {
        console.log('🔧 Attempting automated recovery...');
        
        // Simulate recovery actions
        setTimeout(async () => {
          await this.attemptRecovery();
        }, 5000);
      }
    });
  }

  /**
   * Trigger recovery mechanisms
   */
  private async triggerRecovery(status: string): Promise<void> {
    const recoveryActions = [];

    if (status === 'offline') {
      recoveryActions.push('Restarting critical services');
      recoveryActions.push('Clearing caches');
      recoveryActions.push('Validating Islamic content integrity');
    } else if (status === 'degraded') {
      recoveryActions.push('Optimizing performance');
      recoveryActions.push('Scaling resources');
    }

    // Record recovery actions
    const lastEvent = this.metrics.downtimeEvents[this.metrics.downtimeEvents.length - 1];
    if (lastEvent) {
      lastEvent.recoveryActions.push(...recoveryActions);
    }

    console.log('🔧 Triggering recovery actions:', recoveryActions);
  }

  /**
   * Attempt automated recovery
   */
  private async attemptRecovery(): Promise<void> {
    console.log('🔄 Attempting automated recovery...');
    
    try {
      // Simulate recovery process
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      // Force a health check
      await this.runHealthChecks();
      
      console.log('✅ Automated recovery completed');
    } catch (error) {
      console.error('❌ Automated recovery failed:', error);
    }
  }

  /**
   * Get total downtime in minutes
   */
  private getTotalDowntimeMinutes(): number {
    return this.metrics.downtimeEvents.reduce((total, event) => {
      if (event.duration) {
        return total + (event.duration / (1000 * 60));
      }
      return total;
    }, 0);
  }

  /**
   * Load persisted metrics from storage
   */
  private async loadPersistedMetrics(): Promise<void> {
    try {
      const stored = localStorage.getItem('quranapp_uptime_metrics');
      if (stored) {
        const parsed = JSON.parse(stored);
        this.metrics = { ...this.metrics, ...parsed };
      }
    } catch (error) {
      console.warn('Failed to load persisted uptime metrics:', error);
    }
  }

  /**
   * Persist metrics to storage
   */
  private async persistMetrics(): Promise<void> {
    try {
      localStorage.setItem('quranapp_uptime_metrics', JSON.stringify(this.metrics));
    } catch (error) {
      console.warn('Failed to persist uptime metrics:', error);
    }
  }

  /**
   * Add event listener
   */
  public addEventListener(event: string, callback: Function): void {
    if (!this.listeners.has(event)) {
      this.listeners.set(event, []);
    }
    this.listeners.get(event)!.push(callback);
  }

  /**
   * Remove event listener
   */
  public removeEventListener(event: string, callback: Function): void {
    const eventListeners = this.listeners.get(event);
    if (eventListeners) {
      const index = eventListeners.indexOf(callback);
      if (index > -1) {
        eventListeners.splice(index, 1);
      }
    }
  }

  /**
   * Notify event listeners
   */
  private notifyListeners(event: string, data: any): void {
    const eventListeners = this.listeners.get(event);
    if (eventListeners) {
      eventListeners.forEach(callback => {
        try {
          callback(data);
        } catch (error) {
          console.error(`Error in event listener for ${event}:`, error);
        }
      });
    }
  }

  /**
   * Get current uptime metrics
   */
  public getMetrics(): UptimeMetrics {
    return { ...this.metrics };
  }

  /**
   * Get uptime report
   */
  public generateUptimeReport(): {
    summary: string;
    slaCompliance: number;
    totalDowntime: number;
    averageResponseTime: number;
    recentEvents: DowntimeEvent[];
  } {
    const totalDowntime = this.getTotalDowntimeMinutes();
    const recentEvents = this.metrics.downtimeEvents.slice(-5);

    return {
      summary: `System uptime: ${this.metrics.uptime.toFixed(3)}% | SLA compliance: ${this.metrics.slaCompliance.toFixed(3)}%`,
      slaCompliance: this.metrics.slaCompliance,
      totalDowntime,
      averageResponseTime: this.metrics.averageResponseTime,
      recentEvents
    };
  }

  /**
   * Force health check
   */
  public async forceHealthCheck(): Promise<UptimeMetrics> {
    await this.runHealthChecks();
    return this.getMetrics();
  }

  /**
   * Reset metrics (for testing purposes)
   */
  public resetMetrics(): void {
    this.metrics = {
      uptime: 100,
      totalChecks: 0,
      successfulChecks: 0,
      failedChecks: 0,
      averageResponseTime: 0,
      downtimeEvents: [],
      currentStatus: 'online',
      slaCompliance: 100
    };
    this.startTime = new Date();
  }
}

// Export singleton instance
export const uptimeMonitor = new UptimeMonitorService();