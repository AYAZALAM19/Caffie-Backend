import db from "../config/db.js";
import cloudinary from "../config/cloudinary.js";
import fs from "fs";


// Create coffee card (POST)
export const createCoffeeCard = async (req, res) => {
  const { title, description, amount } = req.body;
  const localFilePath = req.file?.path;

  // Validation
  if (!title || !description || !amount || !localFilePath) {
    if (localFilePath && fs.existsSync(localFilePath)) fs.unlinkSync(localFilePath);
    return res.status(400).json({
      message: "All fields (title, description, amount, image) are required!",
    });
  }

  try {
    // Upload image to Cloudinary
    const uploadResult = await cloudinary.uploader.upload(localFilePath, {
      resource_type: "image",
    });

    // Remove the file from local storage
    fs.unlinkSync(localFilePath);

    // Insert into DB
    const sql = `
      INSERT INTO coffee_cards (title, description, amount, image_url)
      VALUES (?, ?, ?, ?)
    `;
    const values = [title, description, amount, uploadResult.secure_url];

    db.query(sql, values, (err, result) => {
      if (err) {
        return res.status(500).json({ error: err.message });
      }

      res.status(201).json({
        message: "Coffee Card Created Successfully",
        id: result.insertId,
      });
    });
  } catch (error) {
    // Clean up local file if upload failed
    if (localFilePath && fs.existsSync(localFilePath)) fs.unlinkSync(localFilePath);

    return res.status(500).json({
      error: "Failed to create coffee card",
      details: error.message,
    });
  }
};

export const getAllCoffeeCards = (req, res) => {
    db.query('SELECT * FROM coffee_cards', (err, results)=>{
        if (err) return res.status(500).json({
            err: err.message
        });
        res.json(results)
    });
};

export const updateCoffeeCards = async (req, res) => {
    const { id } = req.params;
    const { title, description, amount } = req.body;
    const {localFilePath} = req.file?.path;

    if(!title || !description || !amount){
        if(localFilePath && fs.existsSync(localFilePath)) fs.unlinkSync(localFilePath);
        return res.status(404)
        .json({message : "Title, description, and amount are required!"})
    }
    try {
        let imageUrl;

        if(localFilePath){
            const uploadResult = await cloudinary.uploader.upload(localFilePath, {
                resource_type: 'image'
            });
            imageUrl = uploadResult.secure_url;
            fs.unlinkSync(localFilePath);
        }
        const sql =`UPDATE coffee_cards
        SET title = ?, description = ?, amount = ?, image_url = COALESCE(?, image_url) WHERE id = ?`;

        const values = [title, description, amount, imageUrl, id];

        db.query(sql, values, (err, result)=> {
            if (err) return res.status(500).json({ error: err.message });

            res.json({ message:"Coffee card updated successfully" });
        });
    } catch (error) {
        if(localFilePath && fs.existsSync(localFilePath)) fs.unlinkSync(localFilePath);
        res.status(500).json({error: "Failed to update coffee card"})
    }
};

export const deleteCoffeeCard =(req, res) => {
    const {id} = req.params;

    const sql = `DELETE FROM  coffee_cards WHERE id = ? `;

    db.query(sql ,[id], (err, result) => {
        if(err) return res.status(500).json({
            error : err.message
        })
        if(result.affectedRows === 0){
            return res.status(404).json({
                message: "Coffee card not found"
            });
        }

        res.json({
            message: "Coffee card deleted successfully" 
        })
    })
};