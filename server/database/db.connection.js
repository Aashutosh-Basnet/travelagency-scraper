import mongoose from "mongoose";

//function connectDb
const connectDb = () => {
    mongoose.connect(process.env.MONGODB_URI)
    .then(() => { //in case of successful connection
        console.log("Database connected successfully.");
    })
    .catch((error) => { //in case of database connection failure i.e. any error occured
        console.log(error.message);
    });
}

export default connectDb;