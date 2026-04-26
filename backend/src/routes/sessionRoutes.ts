import { Router } from 'express';
import { createSession, getSession, joinSession } from '../controllers/sessionController';

const router = Router();

router.post('/create', createSession);
router.post('/join', joinSession);
router.get('/:id', getSession);

export default router;
