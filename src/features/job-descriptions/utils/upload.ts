export const RESUME_UPLOAD_LIMIT = 20;

export const formatFileSize = (bytes: number) => {
  const units = ["B", "KB", "MB"];
  let size = bytes;
  let unitIndex = 0;

  while (size >= 1024 && unitIndex < units.length - 1) {
    size /= 1024;
    unitIndex += 1;
  }

  const decimals = unitIndex === 0 ? 0 : 1;
  return `${size.toFixed(decimals)} ${units[unitIndex]}`;
};

export const getRemainingSlots = (
  candidateCount: number | undefined,
  limit: number = RESUME_UPLOAD_LIMIT,
) => {
  if (candidateCount === undefined || Number.isNaN(candidateCount)) {
    return limit;
  }

  return Math.max(0, limit - candidateCount);
};

export const isUploadLimitReached = (
  candidateCount: number | undefined,
  limit: number = RESUME_UPLOAD_LIMIT,
) => getRemainingSlots(candidateCount, limit) === 0;
