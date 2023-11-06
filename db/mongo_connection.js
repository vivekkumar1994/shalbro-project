const { default: mongoose } = require("mongoose");
const dotenv = require("dotenv");

dotenv.config()

// console.log("CURRENT_SERVER_IP : ",process.env.CURRENT_SERVER_IP)


  const connectdb =  async() => {
  try{
  
      const conn = await mongoose.connect(process.env.MONO_URL)
      console.log(`connected to database `)

  }
  catch(err){
      console.log(`err in mongodb ${err}`);

  }
}

module.exports = connectdb
