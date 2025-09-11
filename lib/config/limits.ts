// Centralized quota / limits configuration
// Priority: server env (FREE_IMAGE_DAILY_LIMIT) > public env (NEXT_PUBLIC_FREE_IMAGE_LIMIT) > default 35
export const FREE_IMAGE_DAILY_LIMIT: number = Number(
  process.env.FREE_IMAGE_DAILY_LIMIT ??
    process.env.NEXT_PUBLIC_FREE_IMAGE_LIMIT ??
    35
);

export function remainingFreeImageQuota(count: number) {
  return Math.max(0, FREE_IMAGE_DAILY_LIMIT - count);
}
