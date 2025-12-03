import { Router } from 'express';
import { authenticateToken } from '../middleware/auth';
import {
  createDiary,
  getDiaries,
  getDiary,
  updateDiary,
  deleteDiary,
} from '../controllers/diary.controller';
import {
  createUploadSession,
  confirmUpload,
  getUploadSession,
} from '../controllers/upload.controller';
import { createDiaryValidator, updateDiaryValidator } from '../validators/diary.validator';
import {
  createUploadSessionValidator,
  confirmUploadValidator,
} from '../validators/upload.validator';

const router = Router();

// All diary routes require authentication
router.use(authenticateToken);

// Upload session routes
router.post('/upload-session', createUploadSessionValidator, createUploadSession);
router.post('/upload-confirm', confirmUploadValidator, confirmUpload);
router.get('/upload-session/:uploadId', getUploadSession);

// Create a new diary
router.post('/', createDiaryValidator, createDiary);

// Get all diaries for the authenticated user
router.get('/', getDiaries);

// Get a specific diary
router.get('/:diaryId', getDiary);

// Update a diary
router.put('/:diaryId', updateDiaryValidator, updateDiary);

// Delete a diary
router.delete('/:diaryId', deleteDiary);

// TODO: Implement AI generation route
router.post('/generate', (req, res) => {
  res
    .status(501)
    .json({ success: false, error: { code: 'NOT_IMPLEMENTED', message: 'Not implemented yet' } });
});

export default router;
