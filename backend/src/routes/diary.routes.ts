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
  uploadPhotos,
} from '../controllers/upload.controller';
import { createDiaryValidator, updateDiaryValidator } from '../validators/diary.validator';
import {
  createUploadSessionValidator,
  confirmUploadValidator,
} from '../validators/upload.validator';
import { upload } from '../config/multer';

const router = Router();

// All diary routes require authentication
router.use(authenticateToken);

// Upload photos directly to server
router.post('/upload-photos', upload.array('photos', 10), uploadPhotos);

// Upload session routes (presigned URLs - legacy)
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
router.post('/generate', (_req, res) => {
  res
    .status(501)
    .json({ success: false, error: { code: 'NOT_IMPLEMENTED', message: 'Not implemented yet' } });
});

export default router;
