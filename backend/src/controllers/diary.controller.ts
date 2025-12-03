import { Response } from 'express';
import { validationResult } from 'express-validator';
import prisma from '../lib/prisma';
import { AuthRequest } from '../middleware/auth';
import { logger } from '../utils/logger';
import { copyToPhotos, deleteFiles } from '../utils/s3';

export const createDiary = async (req: AuthRequest, res: Response) => {
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

    const { title, content, date, uploadId } = req.body;
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

    // If uploadId is provided, verify the upload session
    let tempPhotos: any[] = [];
    if (uploadId) {
      const uploadSession = await prisma.uploadSession.findFirst({
        where: {
          uploadId,
          userId,
          status: 'pending',
        },
        include: {
          tempPhotos: true,
        },
      });

      if (!uploadSession) {
        return res.status(400).json({
          success: false,
          error: {
            code: 'INVALID_UPLOAD_SESSION',
            message: 'Upload session not found or already used',
          },
        });
      }

      if (uploadSession.expiresAt < new Date()) {
        return res.status(410).json({
          success: false,
          error: {
            code: 'UPLOAD_SESSION_EXPIRED',
            message: 'Upload session has expired',
          },
        });
      }

      tempPhotos = uploadSession.tempPhotos;
    }

    // Create diary with photos in a transaction
    const result = await prisma.$transaction(async tx => {
      // Create diary
      const diary = await tx.diary.create({
        data: {
          userId,
          title,
          content,
          date: new Date(date),
        },
      });

      // If there are temp photos, copy them to permanent location
      const photos: any[] = [];
      if (tempPhotos.length > 0) {
        for (let i = 0; i < tempPhotos.length; i++) {
          const tempPhoto = tempPhotos[i];
          const photoId = `photo-${Date.now()}-${i}`;

          // Copy file to permanent location
          const permanentPath = await copyToPhotos(
            tempPhoto.filePath,
            userId,
            diary.diaryId,
            photoId
          );

          // Create photo record
          const photo = await tx.photo.create({
            data: {
              photoId,
              diaryId: diary.diaryId,
              filePath: permanentPath,
              thumbnailPath: permanentPath, // For now, use same as original
              fileSize: tempPhoto.fileSize,
              mimeType: tempPhoto.mimeType,
              order: i,
            },
          });

          photos.push(photo);
        }

        // Mark upload session as completed
        await tx.uploadSession.update({
          where: { uploadId },
          data: { status: 'completed' },
        });

        // Delete temp photos after successful copy
        await tx.tempPhoto.deleteMany({
          where: { uploadId },
        });

        // Clean up temp files from S3
        const tempFilePaths = tempPhotos.map(tp => tp.filePath);
        await deleteFiles(tempFilePaths);
      }

      return {
        diary: await tx.diary.findUnique({
          where: { diaryId: diary.diaryId },
          select: {
            diaryId: true,
            title: true,
            content: true,
            date: true,
            createdAt: true,
            updatedAt: true,
            photos: {
              select: {
                photoId: true,
                filePath: true,
                thumbnailPath: true,
                order: true,
              },
              orderBy: {
                order: 'asc',
              },
            },
          },
        }),
      };
    });

    logger.info(
      `Diary created: ${result.diary?.diaryId} by user: ${userId} with ${tempPhotos.length} photos`
    );

    return res.status(201).json({
      success: true,
      data: {
        diary: result.diary,
      },
    });
  } catch (error) {
    logger.error('Create diary error:', error);
    return res.status(500).json({
      success: false,
      error: {
        code: 'INTERNAL_ERROR',
        message: 'Failed to create diary',
      },
    });
  }
};

export const getDiaries = async (req: AuthRequest, res: Response) => {
  try {
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

    const { page = '1', limit = '10' } = req.query;
    const pageNum = parseInt(page as string, 10);
    const limitNum = parseInt(limit as string, 10);
    const skip = (pageNum - 1) * limitNum;

    const [diaries, total] = await Promise.all([
      prisma.diary.findMany({
        where: { userId },
        select: {
          diaryId: true,
          title: true,
          content: true,
          date: true,
          createdAt: true,
          updatedAt: true,
          photos: {
            select: {
              photoId: true,
              thumbnailPath: true,
              order: true,
            },
            orderBy: {
              order: 'asc',
            },
          },
        },
        orderBy: {
          date: 'desc',
        },
        skip,
        take: limitNum,
      }),
      prisma.diary.count({
        where: { userId },
      }),
    ]);

    return res.status(200).json({
      success: true,
      data: {
        diaries,
        pagination: {
          page: pageNum,
          limit: limitNum,
          total,
          totalPages: Math.ceil(total / limitNum),
        },
      },
    });
  } catch (error) {
    logger.error('Get diaries error:', error);
    return res.status(500).json({
      success: false,
      error: {
        code: 'INTERNAL_ERROR',
        message: 'Failed to retrieve diaries',
      },
    });
  }
};

export const getDiary = async (req: AuthRequest, res: Response) => {
  try {
    const { diaryId } = req.params;
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

    const diary = await prisma.diary.findFirst({
      where: {
        diaryId,
        userId,
      },
      select: {
        diaryId: true,
        title: true,
        content: true,
        date: true,
        createdAt: true,
        updatedAt: true,
        photos: {
          select: {
            photoId: true,
            filePath: true,
            thumbnailPath: true,
            fileSize: true,
            mimeType: true,
            order: true,
          },
          orderBy: {
            order: 'asc',
          },
        },
      },
    });

    if (!diary) {
      return res.status(404).json({
        success: false,
        error: {
          code: 'NOT_FOUND',
          message: 'Diary not found',
        },
      });
    }

    return res.status(200).json({
      success: true,
      data: {
        diary,
      },
    });
  } catch (error) {
    logger.error('Get diary error:', error);
    return res.status(500).json({
      success: false,
      error: {
        code: 'INTERNAL_ERROR',
        message: 'Failed to retrieve diary',
      },
    });
  }
};

export const updateDiary = async (req: AuthRequest, res: Response) => {
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

    const { diaryId } = req.params;
    const { title, content, date } = req.body;
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

    // Check if diary exists and belongs to user
    const existingDiary = await prisma.diary.findFirst({
      where: {
        diaryId,
        userId,
      },
    });

    if (!existingDiary) {
      return res.status(404).json({
        success: false,
        error: {
          code: 'NOT_FOUND',
          message: 'Diary not found',
        },
      });
    }

    // Update diary
    const diary = await prisma.diary.update({
      where: {
        diaryId,
      },
      data: {
        title,
        content,
        date: date ? new Date(date) : undefined,
      },
      select: {
        diaryId: true,
        title: true,
        content: true,
        date: true,
        createdAt: true,
        updatedAt: true,
      },
    });

    logger.info(`Diary updated: ${diary.diaryId} by user: ${userId}`);

    return res.status(200).json({
      success: true,
      data: {
        diary,
      },
    });
  } catch (error) {
    logger.error('Update diary error:', error);
    return res.status(500).json({
      success: false,
      error: {
        code: 'INTERNAL_ERROR',
        message: 'Failed to update diary',
      },
    });
  }
};

export const deleteDiary = async (req: AuthRequest, res: Response) => {
  try {
    const { diaryId } = req.params;
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

    // Check if diary exists and belongs to user
    const existingDiary = await prisma.diary.findFirst({
      where: {
        diaryId,
        userId,
      },
    });

    if (!existingDiary) {
      return res.status(404).json({
        success: false,
        error: {
          code: 'NOT_FOUND',
          message: 'Diary not found',
        },
      });
    }

    // Delete diary (cascade will delete photos)
    await prisma.diary.delete({
      where: {
        diaryId,
      },
    });

    logger.info(`Diary deleted: ${diaryId} by user: ${userId}`);

    return res.status(200).json({
      success: true,
      data: {
        message: 'Diary deleted successfully',
      },
    });
  } catch (error) {
    logger.error('Delete diary error:', error);
    return res.status(500).json({
      success: false,
      error: {
        code: 'INTERNAL_ERROR',
        message: 'Failed to delete diary',
      },
    });
  }
};
