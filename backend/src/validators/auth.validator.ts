import { body } from 'express-validator';

export const signupValidator = [
  body('email').isEmail().withMessage('Valid email is required').normalizeEmail().trim(),
  body('password')
    .isLength({ min: 8 })
    .withMessage('Password must be at least 8 characters long')
    .trim(),
  body('nickname')
    .notEmpty()
    .withMessage('Nickname is required')
    .isLength({ min: 2, max: 20 })
    .withMessage('Nickname must be between 2 and 20 characters')
    .trim(),
];

export const loginValidator = [
  body('email').isEmail().withMessage('Valid email is required').normalizeEmail().trim(),
  body('password').notEmpty().withMessage('Password is required').trim(),
];
