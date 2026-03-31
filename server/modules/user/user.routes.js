import { Router } from 'express';
import { loginOrRegister } from './user.controller.js';

const router = Router();

router.post('/login/register', loginOrRegister);

export default router;
