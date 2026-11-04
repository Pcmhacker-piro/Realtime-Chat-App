import mongose from "mongoose";


export const connectDB = async () =>{
    try {
        await mongose.connect(process.env.MONGODB_URL);
        console.log("connected to mongodb");
    } catch (error) {
        console.log("error while connecting to mongodb");
    }
}