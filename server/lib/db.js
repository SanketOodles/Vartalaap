import mongoose from "mongoose";

export const connectDB = async (MONGODB_URI) => {
    try {
        mongoose.connection.on('connected',()=> console.log('MongoDB Connected'));
        await mongoose.connect(MONGODB_URI);
    } catch (error) {
        console.error(`Error: ${error.message}`);
    }
    }
