/**
 * Offline Notice Component
 * Displays when the device is offline
 */

import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, Animated } from 'react-native';
import { useTheme } from '../../theme';
import { networkService } from '../../services/network';

export function OfflineNotice() {
  const { theme } = useTheme();
  const [isOffline, setIsOffline] = useState(false);
  const [slideAnim] = useState(new Animated.Value(-50));

  useEffect(() => {
    const unsubscribe = networkService.addListener((state) => {
      const offline = !state.isConnected;
      setIsOffline(offline);

      Animated.timing(slideAnim, {
        toValue: offline ? 0 : -50,
        duration: 300,
        useNativeDriver: true,
      }).start();
    });

    return () => unsubscribe();
  }, [slideAnim]);

  if (!isOffline) return null;

  return (
    <Animated.View
      style={[
        styles.container,
        {
          backgroundColor: theme.colors.warning,
          transform: [{ translateY: slideAnim }],
        },
      ]}
    >
      <Text style={styles.text}>No internet connection</Text>
      <Text style={styles.subtext}>Some features may be unavailable</Text>
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  container: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    paddingVertical: 8,
    paddingHorizontal: 16,
    zIndex: 1000,
    alignItems: 'center',
  },
  text: {
    color: '#000',
    fontSize: 14,
    fontWeight: '600',
  },
  subtext: {
    color: '#333',
    fontSize: 12,
  },
});
