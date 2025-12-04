import {
  S3Client,
  CopyObjectCommand,
  DeleteObjectCommand,
  DeleteObjectsCommand,
  HeadObjectCommand,
} from '@aws-sdk/client-s3';
import { getSignedUrl } from '@aws-sdk/s3-request-presigner';
import { PutObjectCommand } from '@aws-sdk/client-s3';
import { logger } from './logger';

// Configure AWS SDK v3
const region = process.env.AWS_REGION || 'ap-northeast-2';
const s3Client = new S3Client({
  region,
  credentials: {
    accessKeyId: process.env.AWS_ACCESS_KEY_ID || '',
    secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY || '',
  },
  forcePathStyle: false,
  endpoint: `https://s3.${region}.amazonaws.com`,
});

const BUCKET_NAME = process.env.AWS_S3_BUCKET || 'date-diary-images';
const PRESIGNED_URL_EXPIRATION = 300; // 5 minutes in seconds

export interface PresignedUrlData {
  fileId: string;
  uploadUrl: string;
  filePath: string;
}

/**
 * Upload file directly to S3
 */
export const uploadFile = async (
  file: Buffer,
  fileName: string,
  mimeType: string,
  uploadPath: string
): Promise<string> => {
  try {
    const command = new PutObjectCommand({
      Bucket: BUCKET_NAME,
      Key: uploadPath,
      Body: file,
      ContentType: mimeType,
    });

    await s3Client.send(command);

    logger.info(`Uploaded file to S3: ${uploadPath}`);
    return uploadPath;
  } catch (error) {
    logger.error('Error uploading file to S3:', error);
    throw new Error('Failed to upload file');
  }
};

/**
 * Generate presigned URLs for uploading files to S3
 */
export const generatePresignedUrls = async (
  userId: string,
  uploadId: string,
  fileCount: number,
  fileNames: string[]
): Promise<PresignedUrlData[]> => {
  try {
    const presignedUrls: PresignedUrlData[] = [];

    for (let i = 0; i < fileCount; i++) {
      const fileId = `${uploadId}-${i}`;
      const fileName = fileNames[i] || `photo-${i}.jpg`;
      const fileExtension = fileName.split('.').pop()?.toLowerCase() || 'jpg';
      const s3Key = `uploads/${userId}/${uploadId}/${fileId}.${fileExtension}`;

      const command = new PutObjectCommand({
        Bucket: BUCKET_NAME,
        Key: s3Key,
        ContentType: getMimeType(fileExtension),
      });

      const uploadUrl = await getSignedUrl(s3Client, command, {
        expiresIn: PRESIGNED_URL_EXPIRATION,
      });

      presignedUrls.push({
        fileId,
        uploadUrl,
        filePath: s3Key,
      });
    }

    logger.info(`Generated ${fileCount} presigned URLs for upload session: ${uploadId}`);
    return presignedUrls;
  } catch (error) {
    logger.error('Error generating presigned URLs:', error);
    throw new Error('Failed to generate upload URLs');
  }
};

/**
 * Get MIME type based on file extension
 */
const getMimeType = (extension: string): string => {
  const mimeTypes: { [key: string]: string } = {
    jpg: 'image/jpeg',
    jpeg: 'image/jpeg',
    png: 'image/png',
    gif: 'image/gif',
    webp: 'image/webp',
    heic: 'image/heic',
    heif: 'image/heif',
  };

  return mimeTypes[extension] || 'application/octet-stream';
};

/**
 * Copy file from temp location to permanent diary location
 */
export const copyToPhotos = async (
  sourcePath: string,
  userId: string,
  diaryId: string,
  photoId: string
): Promise<string> => {
  try {
    const fileExtension = sourcePath.split('.').pop() || 'jpg';
    const destinationKey = `photos/${userId}/${diaryId}/${photoId}.${fileExtension}`;

    const command = new CopyObjectCommand({
      Bucket: BUCKET_NAME,
      CopySource: `${BUCKET_NAME}/${sourcePath}`,
      Key: destinationKey,
    });

    await s3Client.send(command);

    logger.info(`Copied photo from ${sourcePath} to ${destinationKey}`);
    return destinationKey;
  } catch (error) {
    logger.error('Error copying photo to permanent location:', error);
    throw new Error('Failed to copy photo');
  }
};

/**
 * Delete file from S3
 */
export const deleteFile = async (filePath: string): Promise<void> => {
  try {
    const command = new DeleteObjectCommand({
      Bucket: BUCKET_NAME,
      Key: filePath,
    });

    await s3Client.send(command);

    logger.info(`Deleted file: ${filePath}`);
  } catch (error) {
    logger.error('Error deleting file:', error);
    throw new Error('Failed to delete file');
  }
};

/**
 * Delete multiple files from S3
 */
export const deleteFiles = async (filePaths: string[]): Promise<void> => {
  try {
    if (filePaths.length === 0) return;

    const objects = filePaths.map(path => ({ Key: path }));

    const command = new DeleteObjectsCommand({
      Bucket: BUCKET_NAME,
      Delete: {
        Objects: objects,
        Quiet: false,
      },
    });

    await s3Client.send(command);

    logger.info(`Deleted ${filePaths.length} files from S3`);
  } catch (error) {
    logger.error('Error deleting files:', error);
    throw new Error('Failed to delete files');
  }
};

/**
 * Get file metadata from S3
 */
export const getFileMetadata = async (
  filePath: string
): Promise<{ size: number; contentType: string }> => {
  try {
    const command = new HeadObjectCommand({
      Bucket: BUCKET_NAME,
      Key: filePath,
    });

    const result = await s3Client.send(command);

    return {
      size: result.ContentLength || 0,
      contentType: result.ContentType || 'application/octet-stream',
    };
  } catch (error) {
    logger.error('Error getting file metadata:', error);
    throw new Error('Failed to get file metadata');
  }
};

/**
 * Generate public URL for a file (for reading)
 */
export const generatePublicUrl = (filePath: string): string => {
  return `https://${BUCKET_NAME}.s3.${process.env.AWS_REGION || 'ap-northeast-2'}.amazonaws.com/${filePath}`;
};

export { s3Client };
export default s3Client;
