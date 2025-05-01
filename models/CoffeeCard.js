import mongoose from "mongoose";
// import { Types } from "mysql2";

const coffeeCardSchema = new mongoose.Schema({
    title: {
        type: String,
        required: true,
    },
    description:{
        type: String,
        required: true,
    },
    amount:{
        type: Number,
        required: true,
    },
    imageUrl:{
        type: String,
        required: true,
    },
});

export const CoffeeCard = mongoose.model('CoffeeCard', coffeeCardSchema);
