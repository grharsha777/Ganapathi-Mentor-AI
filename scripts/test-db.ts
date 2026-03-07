import mongoose from 'mongoose';
import * as dotenv from 'dotenv';
import path from 'path';
import bcrypt from 'bcryptjs';

dotenv.config({ path: '.env.local' });

const MONGODB_URI = process.env.MONGODB_URI;

async function testConnection() {
    if (!MONGODB_URI) {
        console.error('MONGODB_URI is not defined in .env.local');
        process.exit(1);
    }

    console.log('Attempting to connect to MongoDB...');
    // Log a masked version of the URI
    const maskedUri = MONGODB_URI.replace(/:([^@]+)@/, ':****@');
    console.log('URI:', maskedUri);

    try {
        await mongoose.connect(MONGODB_URI);
        console.log('Successfully connected to MongoDB!');

        // Test bcryptjs
        const salt = await bcrypt.genSalt(10);
        const hash = await bcrypt.hash('password123', salt);
        const isMatch = await bcrypt.compare('password123', hash);
        console.log('bcryptjs test:', isMatch ? 'PASSED' : 'FAILED');

        // Try a simple query
        const collections = await mongoose.connection.db?.listCollections().toArray();
        console.log('Collections:', collections?.map(c => c.name));

        // Try to find any user
        const User = mongoose.model('User', new mongoose.Schema({ email: String }));
        const user = await User.findOne();
        console.log('Found a user:', user ? user.email : 'NONE');

        await mongoose.disconnect();
        console.log('Disconnected.');
    } catch (error) {
        console.error('Connection failed:', error);
        process.exit(1);
    }
}

testConnection();
