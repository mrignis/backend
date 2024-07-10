import mongoose from 'mongoose';

const UserSchema = new mongoose.Schema({
    name: {
        type: String,
        required: true
    },
    email: {
        type: String,
        required: true,
        unique: true
    },
    password: {
        type: String,
        required: true
    },
    gender: {
        type: String
    },
    weight: {
        type: Number
    },
    activeSportsTime: {
        type: Number
    },
    dailyWaterIntake: {
        type: Number
    },
    avatar: {
        type: String
    }
});

const User = mongoose.model('User', UserSchema);

export default User;
