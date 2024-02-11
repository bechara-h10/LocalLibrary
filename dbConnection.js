const mongoose = require("mongoose");

mongoose.set("strictQuery", false);

const mongoDB =
  "mongodb+srv://admin:Sayde324@cluster0.lpzokxg.mongodb.net/local_library?retryWrites=true&w=majority";

connectToDatabase().catch((err) => console.log(err));

async function connectToDatabase() {
  await mongoose.connect(mongoDB);
  console.log("Connected to MongoDB database");
}

async function closeConnection() {
  try {
    await mongoose.connection.close();
    console.log("MongoDB connection closed through app termination");
    process.exit(0);
  } catch (error) {
    console.error("Error closing MongoDB connection:", error);
    process.exit(1);
  }
}

module.exports = { connectToDatabase, closeConnection };
