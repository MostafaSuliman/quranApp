/**
 * Network Service
 * Monitors network connectivity status
 */

import NetInfo, { NetInfoState, NetInfoSubscription } from '@react-native-community/netinfo';
import type { NetworkState } from '../types/api';

// Network state change listener
export type NetworkStateListener = (state: NetworkState) => void;

class NetworkService {
  private listeners: Set<NetworkStateListener> = new Set();
  private subscription: NetInfoSubscription | null = null;
  private currentState: NetworkState = {
    isConnected: true,
    isInternetReachable: null,
    type: 'unknown',
  };

  /**
   * Initialize network monitoring
   */
  async initialize(): Promise<void> {
    try {
      // Get initial state
      const state = await NetInfo.fetch();
      this.updateState(state);

      // Subscribe to changes
      this.subscription = NetInfo.addEventListener((state) => {
        this.updateState(state);
      });
    } catch (error) {
      console.error('Error initializing network service:', error);
    }
  }

  /**
   * Update internal state and notify listeners
   */
  private updateState(netInfoState: NetInfoState): void {
    this.currentState = {
      isConnected: netInfoState.isConnected ?? false,
      isInternetReachable: netInfoState.isInternetReachable,
      type: netInfoState.type,
    };

    this.notifyListeners();
  }

  /**
   * Notify all listeners of state change
   */
  private notifyListeners(): void {
    this.listeners.forEach((listener) => listener(this.currentState));
  }

  /**
   * Add network state change listener
   */
  addListener(listener: NetworkStateListener): () => void {
    this.listeners.add(listener);
    // Immediately call with current state
    listener(this.currentState);
    return () => this.listeners.delete(listener);
  }

  /**
   * Get current network state
   */
  getState(): NetworkState {
    return this.currentState;
  }

  /**
   * Check if connected to the internet
   */
  isConnected(): boolean {
    return this.currentState.isConnected;
  }

  /**
   * Check if internet is reachable
   */
  isInternetReachable(): boolean {
    return this.currentState.isInternetReachable === true;
  }

  /**
   * Refresh network state
   */
  async refresh(): Promise<NetworkState> {
    try {
      const state = await NetInfo.fetch();
      this.updateState(state);
      return this.currentState;
    } catch (error) {
      console.error('Error refreshing network state:', error);
      return this.currentState;
    }
  }

  /**
   * Clean up subscription
   */
  cleanup(): void {
    if (this.subscription) {
      this.subscription();
      this.subscription = null;
    }
    this.listeners.clear();
  }
}

export const networkService = new NetworkService();
