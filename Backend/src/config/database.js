const mongoose = require('mongoose')

async function connectToDB(){
    try{
        console.log('Attempting to connect to MongoDB...')
        await mongoose.connect(process.env.MONGO_URI)
        console.log('✓ Connected to Database Successfully')
    }
    catch(err){
        console.error('Error:', err.message)
        console.error('Code:', err.code)
    }
}

module.exports = connectToDB