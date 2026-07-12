/** Pure fee helpers — safe for client and server */

export function calcPlatformSplit(grossAmount: number, feePercent: number) {
  const safeGross = Math.max(0, Number(grossAmount) || 0);
  const safePercent = Math.min(50, Math.max(0, Number(feePercent) || 0));
  const platformFee = Math.round((safeGross * safePercent) / 100);
  const organizerNet = Math.max(0, safeGross - platformFee);
  return { platformFee, organizerNet };
}
