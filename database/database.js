const express=require("express");
const mongoose=require("mongoose");
const dotenv=require("dotenv");
dotenv.config();
const connectdb=(DATABASE_URL)=>{
  
    return mongoose.connect(DATABASE_URL,{
        dbName: "Recruitment_Platform", 
    }).then((success)=>{
        console.log("database connected!");

    }).catch((error)=>{
        console.log(DATABASE_URL);
        console.log("database not connected");
        console.log(error);
    })
}
module.exports=connectdb;