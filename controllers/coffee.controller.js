import db from "../config/db.js";
import cloudinary from "../config/cloudinary.js";
import { CoffeeCard } from "../models/CoffeeCard.js";
import fs from "fs";

// Create Coffee Card (POST)
export const createCoffeeCard = async(req, res) =>{
  const {title, description, amount } =req.body;
  const localFilePath  = req.file?.path;

  // Validation
  if(!title || !description|| !amount){
    if(localFilePath && fs.existsSync( localFilePath )) fs.unlinkSync(localFilePath);
    return res.status(400)
    .json({
      message: "All fields (title, description, amount, image ) are required!",
    })
  }
  try{
    // Upload image to Cloudinary
    const uploadResult = await cloudinary.uploader.upload(localFilePath, {
      resource_type: "image"
    });
     // Remove the file from local storage
    fs.unlinkSync(localFilePath);

    // Create a new Coffee Card and save it to MongoDB
    const newCoffeeCard = new CoffeeCard({
      title,
      description,
      amount,
      imageUrl: uploadResult.secure_url, // Save image URL from Cloudinary
    })

    await  newCoffeeCard.save();  // Save the coffee card to MongoDB

    res.status(201)
    .json({
      message: " Coffee Card Created Successfully",
      CoffeeCard: newCoffeeCard,  // Respond with the created card
    });
  }
  catch(error){
     // Clean up local file if upload failed
    if(localFilePath && fs.existsSync(localFilePath)) fs.unlinkSync(localFilePath);

    return res.status(500)
    .json({
      error: "Failed to create coffee card",
      details: error.message
    });
  }
}

/* Get All Cards */
export const getAllCoffeeCards = async (req, res)=>{
  try{
    // Fetch all coffee cards from MongoDB
    const coffeeCards = await CoffeeCard.find();
    res.status(200)
    .json(coffeeCards) // Send the list of cards as a response
  }
  catch (error){
    res.status(500
      .json({
        error:"Faild to fetch Coffee cards",
        details: err.message,
      })
    );
  };
};
 

/*  updateCoffeeCards  */

export const updateCoffeeCards = async(req, res) =>{
  const { id } = req.params;
  const {title, description, amount} = req.body;
  const localFilePath = req.file?.path

  if(!title || !description || amount){
    if(localFilePath && fs.existsSync(localFilePath)) fs.unlinkSync(localFilePath);
    return res.status(400)
    .json({
        message: "Title, description, and amount are required!",
      });
    }

    try{
      let updateData = { title, description, amount };

      if(localFilePath){
        const uploadResult = await cloudinary.uploader.upload(localFilePath, {
          resource_type: "image",
        });
        updateData.imageUrl = uploadResult.secure_url
        fs.unlinkSync(localFilePath);
      }

      const updateCoffeeCard = await CoffeeCard.findByIdAndUpdate(id, updateData,{new: true});

      if(!updateCoffeeCard){
        return res.status(400).
        json({
          message: "Coffee card not found" 
        });
      }

      res.status(200)
      .json({
        message: "Coffee card updated successfully",
        CoffeeCard: updateCoffeeCard // Return Updated card
      })
    }
    catch (error){
      if(localFilePath && fs.existsSync(localFilePath)) fs.unlinkSync(localFilePath);
      res.status(500)
      .json({
          error: "Failed to update coffee card",
          details: error.message
        });
       }
  };

  // Delete Coffee Card (DELETE)
export const deleteCoffeeCard = async (req, res) => {
  const { id } = req.params;

  try {
    // Delete the coffee card from MongoDB by ID
    const deletedCoffeeCard = await CoffeeCard.findByIdAndDelete(id);

    if (!deletedCoffeeCard) {
      return res.status(404).json({ message: "Coffee card not found" });
    }

    res.status(200).json({
      message: "Coffee card deleted successfully",
    });
  } catch (err) {
    res.status(500).json({
      error: "Failed to delete coffee card",
      details: err.message,
    });
  }
};
