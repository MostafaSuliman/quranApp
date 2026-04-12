import * as Haptics from 'expo-haptics';

export const tapLight = () => Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
export const tapMedium = () => Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
export const tapHeavy = () => Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Heavy);
export const notifySuccess = () => Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
export const notifyError = () => Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
export const selectionChanged = () => Haptics.selectionAsync();
