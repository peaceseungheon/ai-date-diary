import { Router } from 'express';

const router = Router();

// TODO: Implement diary routes
router.post('/upload-urls', (req, res) => {
  res
    .status(501)
    .json({ success: false, error: { code: 'NOT_IMPLEMENTED', message: 'Not implemented yet' } });
});

router.post('/generate', (req, res) => {
  res
    .status(501)
    .json({ success: false, error: { code: 'NOT_IMPLEMENTED', message: 'Not implemented yet' } });
});

router.post('/', (req, res) => {
  res
    .status(501)
    .json({ success: false, error: { code: 'NOT_IMPLEMENTED', message: 'Not implemented yet' } });
});

router.get('/', (req, res) => {
  res
    .status(501)
    .json({ success: false, error: { code: 'NOT_IMPLEMENTED', message: 'Not implemented yet' } });
});

router.get('/:diaryId', (req, res) => {
  res
    .status(501)
    .json({ success: false, error: { code: 'NOT_IMPLEMENTED', message: 'Not implemented yet' } });
});

export default router;
