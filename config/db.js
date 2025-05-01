import mongoose from 'mongoose';
import dotenv from 'dotenv';
// import mysql from 'mysql2';

dotenv.config();

mongoose.connect(process.env.MONGO_URI, {

})
.then(()=> console.log('Connected to MongoDB!'))
.catch(err =>{
    console.log('Error Connectig To MongoDB:', err.message);
    process.exit(1);
})

export default mongoose;




// db.connect(err =>{
//     if(err){
//         console.log("DataBase Connection failed:", err.stack);
//         return
//     }
//     console.log("Connected to Mysql database!");
// });

// export default db;