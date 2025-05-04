import express  from 'express';
import dotenv from 'dotenv';
import coffeeRoutes from './routes/coffee.routes.js';

const app = express()
dotenv.config()

// Middleware
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Routes
app.use('/api/coffee', coffeeRoutes);

// Start Server
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Server is running on http://localhost:${PORT}`);
});