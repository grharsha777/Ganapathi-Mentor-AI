const mongoose = require('mongoose');
const dotenv = require('dotenv');

dotenv.config({ path: '.env.local' });

const MONGODB_URI = process.env.MONGODB_URI;

console.log('Testing MongoDB Connection...');
console.log('URI:', MONGODB_URI ? 'Defined' : 'Missing');

async function test() {
    try {
        await mongoose.connect(MONGODB_URI);
        console.log('Connected to MongoDB successfully!');
        await mongoose.connection.close();
    } catch (err) {
        console.error('Connection failed:', err);
    }
}

test();
