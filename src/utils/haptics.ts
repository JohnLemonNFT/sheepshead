// Haptic feedback utilities for native mobile experience
import { Haptics, ImpactStyle, NotificationType } from '@capacitor/haptics';
import { Capacitor } from '@capacitor/core';

const isNative = Capacitor.isNativePlatform();

/**
 * Light tap - for card selection, button taps
 */
export async function tapLight() {
  if (!isNative) return;
  try {
    await Haptics.impact({ style: ImpactStyle.Light });
  } catch {
    // Haptics not available
  }
}

/**
 * Medium tap - for playing a card
 */
export async function tapMedium() {
  if (!isNative) return;
  try {
    await Haptics.impact({ style: ImpactStyle.Medium });
  } catch {
    // Haptics not available
  }
}

/**
 * Heavy tap - for winning a trick, important actions
 */
export async function tapHeavy() {
  if (!isNative) return;
  try {
    await Haptics.impact({ style: ImpactStyle.Heavy });
  } catch {
    // Haptics not available
  }
}

/**
 * Success notification - for winning a hand
 */
export async function notifySuccess() {
  if (!isNative) return;
  try {
    await Haptics.notification({ type: NotificationType.Success });
  } catch {
    // Haptics not available
  }
}

/**
 * Warning notification - for almost making a mistake
 */
export async function notifyWarning() {
  if (!isNative) return;
  try {
    await Haptics.notification({ type: NotificationType.Warning });
  } catch {
    // Haptics not available
  }
}

/**
 * Error notification - for losing, invalid action
 */
export async function notifyError() {
  if (!isNative) return;
  try {
    await Haptics.notification({ type: NotificationType.Error });
  } catch {
    // Haptics not available
  }
}
