import express from 'express';
import { body, validationResult, matchedData } from 'express-validator'; 
import path from 'path';
import * as db from './db/index.js';


const router = express.Router();

router.post('/', (req, res) => {
    // verify with user db 

});

export default router;