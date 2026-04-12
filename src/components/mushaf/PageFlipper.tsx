import React, { useState } from 'react';
import { StyleSheet, useWindowDimensions, View } from 'react-native';
import { Gesture, GestureDetector } from 'react-native-gesture-handler';
import Animated, {
  interpolate,
  runOnJS,
  useAnimatedStyle,
  useSharedValue,
  withTiming,
} from 'react-native-reanimated';
import { MushafPage } from './MushafPage';
import { tapMedium } from '@/utils/haptics';

interface PageFlipperProps {
  pageNumber: number;
  onPageChange: (page: number) => void;
  currentVerseKey: string | null;
  onVersePress: (verseKey: string) => void;
}

/**
 * 3D page turn. A horizontal pan rotates the active page around its right edge
 * (for "next") or left edge (for "prev"). The back face is the neighboring page
 * pre-rendered for a zero-flash hand-off.
 */
export function PageFlipper({
  pageNumber,
  onPageChange,
  currentVerseKey,
  onVersePress,
}: PageFlipperProps) {
  const { width, height } = useWindowDimensions();
  const usableHeight = height - 120; // leave room for tab bar + safe areas
  const rotation = useSharedValue(0);
  const [pendingNext, setPendingNext] = useState<number | null>(null);

  const commit = (next: number) => {
    onPageChange(next);
    rotation.value = 0;
    setPendingNext(null);
    tapMedium();
  };

  const pan = Gesture.Pan()
    .activeOffsetX([-10, 10])
    .onUpdate((e) => {
      const max = 180;
      const ratio = Math.max(-1, Math.min(1, e.translationX / (width * 0.7)));
      rotation.value = ratio * max;
    })
    .onEnd(() => {
      'worklet';
      if (rotation.value <= -90 && pageNumber < 604) {
        rotation.value = withTiming(-180, { duration: 220 }, () => {
          runOnJS(commit)(pageNumber + 1);
        });
      } else if (rotation.value >= 90 && pageNumber > 1) {
        rotation.value = withTiming(180, { duration: 220 }, () => {
          runOnJS(commit)(pageNumber - 1);
        });
      } else {
        rotation.value = withTiming(0, { duration: 220 });
      }
    });

  const frontStyle = useAnimatedStyle(() => {
    const pivotLeft = rotation.value > 0 ? width / 2 : -width / 2;
    return {
      transform: [
        { perspective: 1200 },
        { translateX: pivotLeft },
        { rotateY: `${rotation.value}deg` },
        { translateX: -pivotLeft },
      ],
      opacity: interpolate(Math.abs(rotation.value), [0, 90], [1, 0.85]),
    };
  });

  // Pre-render the next page as a static back face so the flip hand-off is flash-free.
  const nextPage = pageNumber < 604 ? pageNumber + 1 : null;

  return (
    <GestureDetector gesture={pan}>
      <View style={{ width, height: usableHeight }}>
        {/* Back face: next page (pre-rendered for smooth hand-off) */}
        {nextPage && (
          <View style={StyleSheet.absoluteFill}>
            <MushafPage
              pageNumber={nextPage}
              width={width}
              height={usableHeight}
              currentVerseKey={null}
              onVersePress={() => {}}
            />
          </View>
        )}
        {/* Front face: current page, animated */}
        <Animated.View style={[StyleSheet.absoluteFill, frontStyle]}>
          <MushafPage
            pageNumber={pageNumber}
            width={width}
            height={usableHeight}
            currentVerseKey={currentVerseKey}
            onVersePress={onVersePress}
          />
        </Animated.View>
      </View>
    </GestureDetector>
  );
}
