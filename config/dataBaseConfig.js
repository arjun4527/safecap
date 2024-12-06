const mongoose=require('mongoose')

const connectDB=async()=>{
  const uri=process.env.DATABASE_CONFIG

  try{
    await mongoose.connect(uri)
    console.log("Database connected successfully")
  }catch(error){
    console.log("Error connecting to MongoDB",error.message)
  }
}

module.exports=connectDB

// aJ9lCwZoVSqfdFXh