const mongoose = require('mongoose');

const connectDB = async () => {
    try {
        // Default MongoDB connection string
        const mongoURI = process.env.MONGO_URI || 'mongodb://localhost:27017/career_line';
        
        await mongoose.connect(mongoURI);
        
        console.log('✅ MongoDB Connected Successfully');
        console.log(`📊 Database: ${mongoose.connection.name}`);
        
    } catch (error) {
        console.error('❌ MongoDB Connection Error:', error.message);
        console.error('💡 Make sure MongoDB is running!');
        console.error('   Windows: net start MongoDB');
        console.error('   Mac/Linux: sudo systemctl start mongod');
        process.exit(1);
    }
};

module.exports = connectDB;