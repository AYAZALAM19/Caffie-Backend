import express from 'express';
import multer from 'multer';
import  { createCoffeeCard, getAllCoffeeCards, updateCoffeeCards, deleteCoffeeCard} from '../controllers/coffee.controller.js';

const router = express.Router();
const upload = multer({dest: 'uploads/'})

// CRUD Routes
router.post('/', upload.single('image'), createCoffeeCard);
router.get('/', getAllCoffeeCards);
router.put('/:id', upload.single('image'), updateCoffeeCards);
router.delete('/:id', deleteCoffeeCard);

export default router;