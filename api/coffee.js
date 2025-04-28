import db from "../../config/db.js";
import cloudinary from "../../config/cloudinary.js";
import multer from 'multer';
import fs from "fs";

const upload = multer({ dest: '/tmp/' }); // Vercel allows only /tmp for temp storage

export const config = {
  api: {
    bodyParser: false,
  },
};

export default async function handler(req, res) {
  // Multer handling
  await new Promise((resolve, reject) => {
    upload.single('image')(req, {}, (err) => {
      if (err) return reject(err);
      resolve();
    });
  });

  if (req.method === 'POST') {
    // Create Coffee Card
    const { title, description, amount } = req.body;
    const localFilePath = req.file?.path;

    if (!title || !description || !amount || !localFilePath) {
      if (localFilePath && fs.existsSync(localFilePath)) fs.unlinkSync(localFilePath);
      return res.status(400).json({ message: "All fields (title, description, amount, image) are required!" });
    }

    try {
      const uploadResult = await cloudinary.uploader.upload(localFilePath, {
        resource_type: "image",
      });

      fs.unlinkSync(localFilePath);

      const sql = `INSERT INTO coffee_cards (title, description, amount, image_url) VALUES (?, ?, ?, ?)`;
      const values = [title, description, amount, uploadResult.secure_url];

      db.query(sql, values, (err, result) => {
        if (err) return res.status(500).json({ error: err.message });

        res.status(201).json({ message: "Coffee Card Created Successfully", id: result.insertId });
      });
    } catch (error) {
      if (localFilePath && fs.existsSync(localFilePath)) fs.unlinkSync(localFilePath);

      return res.status(500).json({ error: "Failed to create coffee card", details: error.message });
    }
  }

  else if (req.method === 'GET') {
    // Get All Coffee Cards
    db.query('SELECT * FROM coffee_cards', (err, results) => {
      if (err) return res.status(500).json({ err: err.message });
      res.json(results);
    });
  }

  else if (req.method === 'PUT') {
    // Update Coffee Card
    const { id } = req.query; // Because Vercel uses query params
    const { title, description, amount } = req.body;
    const localFilePath = req.file?.path;

    if (!title || !description || !amount) {
      if (localFilePath && fs.existsSync(localFilePath)) fs.unlinkSync(localFilePath);
      return res.status(400).json({ message: "Title, description, and amount are required!" });
    }

    try {
      let imageUrl;

      if (localFilePath) {
        const uploadResult = await cloudinary.uploader.upload(localFilePath, {
          resource_type: 'image'
        });
        imageUrl = uploadResult.secure_url;
        fs.unlinkSync(localFilePath);
      }

      const sql = `UPDATE coffee_cards SET title = ?, description = ?, amount = ?, image_url = COALESCE(?, image_url) WHERE id = ?`;
      const values = [title, description, amount, imageUrl, id];

      db.query(sql, values, (err, result) => {
        if (err) return res.status(500).json({ error: err.message });

        res.json({ message: "Coffee card updated successfully" });
      });
    } catch (error) {
      if (localFilePath && fs.existsSync(localFilePath)) fs.unlinkSync(localFilePath);
      res.status(500).json({ error: "Failed to update coffee card" });
    }
  }

  else if (req.method === 'DELETE') {
    // Delete Coffee Card
    const { id } = req.query;

    const sql = `DELETE FROM coffee_cards WHERE id = ?`;

    db.query(sql, [id], (err, result) => {
      if (err) return res.status(500).json({ error: err.message });

      if (result.affectedRows === 0) {
        return res.status(404).json({ message: "Coffee card not found" });
      }

      res.json({ message: "Coffee card deleted successfully" });
    });
  }

  else {
    res.status(405).json({ message: "Method not allowed" });
  }
}
