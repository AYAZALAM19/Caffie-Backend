import { IncomingForm } from 'formidable';
import fs from 'fs';
import cloudinary from '../../../config/cloudinary.js';
import { CoffeeCard } from '../../../models/coffee.model.js';
import { connectDB } from '../../../config/db.js';

export const config = {
  api: { bodyParser: false }
};

export default async function handler(req, res) {
  await connectDB();
  const { id } = req.query;

  if (req.method === 'DELETE') {
    try {
      const deleted = await CoffeeCard.findByIdAndDelete(id);
      if (!deleted) return res.status(404).json({ message: 'Card not found' });
      return res.status(200).json({ message: 'Deleted' });
    } catch (err) {
      return res.status(500).json({ error: err.message });
    }
  }

  if (req.method === 'PUT') {
    const form = new IncomingForm({ uploadDir: '/tmp', keepExtensions: true });

    form.parse(req, async (err, fields, files) => {
      if (err) return res.status(500).json({ error: 'Form parsing failed' });

      const { title, description, amount } = fields;
      const file = files.image;
      const updateData = { title, description, amount };

      if (file) {
        const upload = await cloudinary.uploader.upload(file.filepath);
        updateData.imageUrl = upload.secure_url;
        fs.unlinkSync(file.filepath);
      }

      try {
        const updated = await CoffeeCard.findByIdAndUpdate(id, updateData, { new: true });
        if (!updated) return res.status(404).json({ message: 'Card not found' });
        return res.status(200).json({ message: 'Updated', updated });
      } catch (error) {
        return res.status(500).json({ error: error.message });
      }
    });
  } else {
    return res.status(405).json({ message: 'Method not allowed' });
  }
}
