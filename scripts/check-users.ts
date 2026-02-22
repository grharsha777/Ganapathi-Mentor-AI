import mongoose from 'mongoose';

// Connect locally just for the script
const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017/neural-code-symbiosis';

const UserSchema = new mongoose.Schema({}, { strict: false });
const User = mongoose.models.User || mongoose.model('User', UserSchema);

async function check() {
    try {
        await mongoose.connect(MONGODB_URI);
        const users = await User.find({}).select('email full_name metrics').lean();
        console.log("All users:");
        console.dir(users, { depth: null });
    } catch (err) {
        console.error('Check failed:', err);
    } finally {
        await mongoose.disconnect();
    }
}

check();
