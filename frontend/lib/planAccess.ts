import type { BackendBillingPayload } from '@/types/backend';

export function isPremiumActive(billing: BackendBillingPayload | undefined): boolean {
  return !!billing?.premiumActive;
}

export function privateCanvasSlotCount(billing: BackendBillingPayload | undefined): number {
  return billing?.privateCanvasSlots ?? 0;
}

export function hasCosmeticTheme(
  billing: BackendBillingPayload | undefined,
  themeId: string
): boolean {
  return !!billing?.uiThemes?.includes(themeId);
}
