import express from 'express';

const router = express.Router();

router.get('/', (req: any, res: any) => {

    res.status(200).send('Hello world');
});

export default router;