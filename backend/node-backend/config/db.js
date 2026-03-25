import mongoose from "mongoose";
import dotenv from "dotenv";
dotenv.config();
const connectDB = async () => {
  try {
    await mongoose.connect(process.env.MONGO_URL, {
      dbName: 'resume_screening'
    })
    console.log("successfully connect to mongodb (resume_screening)")
  } catch (error) {
    console.log(error);
    process.exit(1);
  }
}
export default connectDB;