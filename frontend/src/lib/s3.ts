/**
 * Generate public URL for S3 objects
 */
export const generatePublicUrl = (filePath: string): string => {
  const region = import.meta.env.VITE_AWS_REGION || 'ap-northeast-2';
  const bucket = import.meta.env.VITE_AWS_S3_BUCKET || 'ai-date-diary';
  return `https://${bucket}.s3.${region}.amazonaws.com/${filePath}`;
};

export default { generatePublicUrl };
