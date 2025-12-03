import { body } from 'express-validator';

export const createUploadSessionValidator = [
  body('fileCount').isInt({ min: 1, max: 10 }).withMessage('File count must be between 1 and 10'),
  body('fileNames')
    .isArray({ min: 1, max: 10 })
    .withMessage('File names must be an array with 1-10 items'),
  body('fileNames.*').isString().withMessage('Each file name must be a string'),
];

export const confirmUploadValidator = [
  body('uploadId').isUUID().withMessage('Upload ID must be a valid UUID'),
  body('fileId').notEmpty().withMessage('File ID is required'),
  body('filePath').notEmpty().withMessage('File path is required'),
  body('fileSize').isInt({ min: 1 }).withMessage('File size must be a positive integer'),
  body('mimeType')
    .matches(/^image\/(jpeg|png|gif|webp|heic|heif)$/)
    .withMessage('MIME type must be a valid image type'),
];
