const mongoose = require("mongoose") ; 
const connectDb = async()=>{
    await mongoose.connect(`${process.env.MONGODB_URL}CampusConnect`) ; 
    console.log("Server connected to CampusConnect database ") ; 
}
module.exports = connectDb ; 