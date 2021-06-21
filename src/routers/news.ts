import express from 'express';
import { searchHtml } from '../search/searchHTML';

const router = express.Router();

router.get('/', (req: any, res: any) => {

    searchHtml('news', 1, 'lang_en')
    .then((data: any) => res.status(200).send(data));
});

export default router;  
