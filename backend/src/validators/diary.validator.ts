import { body } from 'express-validator';

export const createDiaryValidator = [
  body('title')
    .notEmpty()
    .withMessage('Title is required')
    .isLength({ min: 1, max: 200 })
    .withMessage('Title must be between 1 and 200 characters')
    .trim(),
  body('content')
    .notEmpty()
    .withMessage('Content is required')
    .isLength({ min: 1, max: 10000 })
    .withMessage('Content must be between 1 and 10000 characters')
    .trim(),
  body('date')
    .notEmpty()
    .withMessage('Date is required')
    .isISO8601()
    .withMessage('Date must be a valid ISO 8601 date'),
  body('uploadId').optional().isUUID().withMessage('Upload ID must be a valid UUID'),
];

export const updateDiaryValidator = [
  body('title')
    .optional()
    .isLength({ min: 1, max: 200 })
    .withMessage('Title must be between 1 and 200 characters')
    .trim(),
  body('content')
    .optional()
    .isLength({ min: 1, max: 10000 })
    .withMessage('Content must be between 1 and 10000 characters')
    .trim(),
  body('date').optional().isISO8601().withMessage('Date must be a valid ISO 8601 date'),
];
