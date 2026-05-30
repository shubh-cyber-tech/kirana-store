import mongoose from "mongoose";

export const connectDb = async () => {
  const uri = process.env.MONGO_URI;

  if (!uri) {
    throw new Error("MONGO_URI is required in server/.env");
  }

  if (uri.includes("YOUR_USERNAME") || uri.includes("YOUR_PASSWORD") || uri.includes("cluster0.mongodb.net")) {
    throw new Error(
      "MONGO_URI in server/.env still has placeholder values. Paste your full MongoDB Atlas connection string from Atlas > Database > Connect > Drivers."
    );
  }

  await mongoose.connect(uri, {
    serverSelectionTimeoutMS: 10000
  });
  console.log("MongoDB connected");
};
