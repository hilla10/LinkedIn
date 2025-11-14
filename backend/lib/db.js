import mongoose from 'mongoose';

const connectDB = async() => {
    try {
      const conn =  await mongoose.connect(process.env.MONGODB_URI)
        console.log(`Mongodb connected ${conn.connection.host}`)
        
    } catch (error) {
        console.error('Error connecting to mongodb', error)
        process.exit(1)
    }
}

export default connectDB