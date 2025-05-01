import { IncomingForm } from 'formidable';
import fs from 'fs';
import cloudinary from '../../config/cloudinary.js';
import { CoffeeCard } from '../../models/coffee.model.js';
import { connectDB } from '../../config/db.js';

export const config = {
  api: {
    bodyParser: false, // Required for formidable
  },
};

export default async function handler(req, res) {
  await connectDB();

  const method = req.method;

  const form = new IncomingForm({ uploadDir: '/tmp', keepExtensions: true });

  form.parse(req, async (err, fields, files) => {
    if (err) return res.status(500).json({ error: 'Form parsing failed', details: err.message });

    const { title, description, amount } = fields;
    const file = files.image;

    if (method === 'POST') {
      if (!title || !description || !amount || !file) {
        if (file?.filepath && fs.existsSync(file.filepath)) fs.unlinkSync(file.filepath);
        return res.status(400).json({ message: 'All fields are required!' });
      }

      try {
        const uploadResult = await cloudinary.uploader.upload(file.filepath);
        fs.unlinkSync(file.filepath);

        const newCard = await CoffeeCard.create({
          title,
          description,
          amount,
          imageUrl: uploadResult.secure_url
        });

        return res.status(201).json({ message: 'Coffee card created', card: newCard });
      } catch (error) {
        if (file?.filepath && fs.existsSync(file.filepath)) fs.unlinkSync(file.filepath);
        return res.status(500).json({ error: 'Creation failed', details: error.message });
      }
    }

    // Handle GET, PUT, DELETE etc. outside of `form.parse` if no file/fields are needed
    if (method === 'GET') {
      try {
        const cards = await CoffeeCard.find();
        return res.status(200).json(cards);
      } catch (error) {
        return res.status(500).json({ error: error.message });
      }
    }

    // Add similar handling for PUT/DELETE using `fields` and `files`
    res.status(405).json({ message: 'Method not allowed' });
  });
}
