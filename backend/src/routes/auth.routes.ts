import { Router } from 'express';
import { signup, login } from '../controllers/auth.controller';
import { signupValidator, loginValidator } from '../validators/auth.validator';

const router = Router();

// Signup route
router.post('/signup', signupValidator, signup);

// Login route
router.post('/login', loginValidator, login);

export default router;
