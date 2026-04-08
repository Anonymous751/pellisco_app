import mongoose from "mongoose";

export const connectMongodbDatabase = () => {
  mongoose.connect(process.env.DB_URI, {
    autoIndex: true,
  })
  .then((data) => {
    console.log(`Mongodb Connected with Server ${data.connection.host}`);

    mongoose.connection.on("open", async () => {
      await mongoose.connection.db.command({ ping: 1 });
      console.log("Indexes will be ensured by Mongoose");
    });
  });
};

export default connectMongodbDatabase;
