import { Response } from 'express';
import { validationResult } from 'express-validator';
import prisma from '../lib/prisma';
import { AuthRequest } from '../middleware/auth';
import { logger } from '../utils/logger';
import { generatePresignedUrls, uploadFile } from '../utils/s3';
import { v4 as uuidv4 } from 'uuid';

/**
 * Upload photos directly to S3
 */
export const uploadPhotos = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const userId = req.user?.userId;
    if (!userId) {
      res.status(401).json({ message: 'Unauthorized' });
      return;
    }

    const files = req.files as Express.Multer.File[];
    if (!files || files.length === 0) {
      res.status(400).json({ message: 'No files provided' });
      return;
    }

    // Create upload session
    const uploadSession = await prisma.uploadSession.create({
      data: {
        userId,
        fileCount: files.length,
        status: 'pending',
        expiresAt: new Date(Date.now() + 60 * 60 * 1000), // 1 hour
      },
    });

    const uploadedPhotos = [];

    // Upload each file to S3
    for (const file of files) {
      const photoId = uuidv4();
      const fileExtension = file.originalname.split('.').pop() || 'jpg';
      const tempPath = `temp/${userId}/${uploadSession.uploadId}/${photoId}.${fileExtension}`;

      // Upload to S3
      await uploadFile(file.buffer, file.originalname, file.mimetype, tempPath);

      // Create temp photo record
      const tempPhoto = await prisma.tempPhoto.create({
        data: {
          fileId: photoId,
          uploadId: uploadSession.uploadId,
          filePath: tempPath,
          fileSize: file.size,
          mimeType: file.mimetype,
        },
      });

      uploadedPhotos.push({
        fileId: tempPhoto.fileId,
        originalName: file.originalname,
        fileSize: tempPhoto.fileSize,
        mimeType: tempPhoto.mimeType,
      });
    }

    res.status(201).json({
      uploadSessionId: uploadSession.uploadId,
      photos: uploadedPhotos,
    });
  } catch (error) {
    logger.error('Error uploading photos:', error);
    res.status(500).json({ message: 'Failed to upload photos' });
  }
};

/**
 * Create upload session and generate presigned URLs for file uploads
 */
export const createUploadSession = async (req: AuthRequest, res: Response) => {
  try {
    // Validate request
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        success: false,
        error: {
          code: 'VALIDATION_ERROR',
          message: 'Invalid input data',
          details: errors.array(),
        },
      });
    }

    const { fileCount, fileNames } = req.body;
    const userId = req.user?.userId;

    if (!userId) {
      return res.status(401).json({
        success: false,
        error: {
          code: 'UNAUTHORIZED',
          message: 'User not authenticated',
        },
      });
    }

    // Create upload session (expires in 1 hour)
    const expiresAt = new Date();
    expiresAt.setHours(expiresAt.getHours() + 1);

    const uploadSession = await prisma.uploadSession.create({
      data: {
        userId,
        fileCount,
        status: 'pending',
        expiresAt,
      },
    });

    // Generate presigned URLs
    const presignedUrls = await generatePresignedUrls(
      userId,
      uploadSession.uploadId,
      fileCount,
      fileNames
    );

    logger.info(
      `Upload session created: ${uploadSession.uploadId} for user: ${userId} with ${fileCount} files`
    );

    return res.status(201).json({
      success: true,
      data: {
        uploadId: uploadSession.uploadId,
        expiresAt: uploadSession.expiresAt,
        presignedUrls,
      },
    });
  } catch (error) {
    logger.error('Create upload session error:', error);
    return res.status(500).json({
      success: false,
      error: {
        code: 'INTERNAL_ERROR',
        message: 'Failed to create upload session',
      },
    });
  }
};

/**
 * Confirm file upload and create temp photo record
 */
export const confirmUpload = async (req: AuthRequest, res: Response) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        success: false,
        error: {
          code: 'VALIDATION_ERROR',
          message: 'Invalid input data',
          details: errors.array(),
        },
      });
    }

    const { uploadId, fileId, filePath, fileSize, mimeType } = req.body;
    const userId = req.user?.userId;

    if (!userId) {
      return res.status(401).json({
        success: false,
        error: {
          code: 'UNAUTHORIZED',
          message: 'User not authenticated',
        },
      });
    }

    // Verify upload session belongs to user
    const uploadSession = await prisma.uploadSession.findFirst({
      where: {
        uploadId,
        userId,
      },
    });

    if (!uploadSession) {
      return res.status(404).json({
        success: false,
        error: {
          code: 'NOT_FOUND',
          message: 'Upload session not found',
        },
      });
    }

    if (uploadSession.status === 'expired') {
      return res.status(410).json({
        success: false,
        error: {
          code: 'UPLOAD_SESSION_EXPIRED',
          message: 'Upload session has expired',
        },
      });
    }

    // Create temp photo record
    const tempPhoto = await prisma.tempPhoto.create({
      data: {
        fileId,
        uploadId,
        filePath,
        fileSize,
        mimeType,
      },
    });

    logger.info(`File upload confirmed: ${fileId} for session: ${uploadId}`);

    return res.status(200).json({
      success: true,
      data: {
        tempPhoto: {
          fileId: tempPhoto.fileId,
          uploadId: tempPhoto.uploadId,
        },
      },
    });
  } catch (error) {
    logger.error('Confirm upload error:', error);
    return res.status(500).json({
      success: false,
      error: {
        code: 'INTERNAL_ERROR',
        message: 'Failed to confirm upload',
      },
    });
  }
};

/**
 * Get upload session status
 */
export const getUploadSession = async (req: AuthRequest, res: Response) => {
  try {
    const { uploadId } = req.params;
    const userId = req.user?.userId;

    if (!userId) {
      return res.status(401).json({
        success: false,
        error: {
          code: 'UNAUTHORIZED',
          message: 'User not authenticated',
        },
      });
    }

    const uploadSession = await prisma.uploadSession.findFirst({
      where: {
        uploadId,
        userId,
      },
      include: {
        tempPhotos: {
          select: {
            fileId: true,
            filePath: true,
            fileSize: true,
            mimeType: true,
            createdAt: true,
          },
        },
      },
    });

    if (!uploadSession) {
      return res.status(404).json({
        success: false,
        error: {
          code: 'NOT_FOUND',
          message: 'Upload session not found',
        },
      });
    }

    return res.status(200).json({
      success: true,
      data: {
        uploadSession: {
          uploadId: uploadSession.uploadId,
          fileCount: uploadSession.fileCount,
          status: uploadSession.status,
          expiresAt: uploadSession.expiresAt,
          tempPhotos: uploadSession.tempPhotos,
        },
      },
    });
  } catch (error) {
    logger.error('Get upload session error:', error);
    return res.status(500).json({
      success: false,
      error: {
        code: 'INTERNAL_ERROR',
        message: 'Failed to retrieve upload session',
      },
    });
  }
};
