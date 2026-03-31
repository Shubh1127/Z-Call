import mongoose from 'mongoose';

const { Schema } = mongoose;

const userSchema = new Schema(
    {
        name: {
            type: String,
            required: true,
            trim: true,
        },
        email: {
            type: String,
            required: true,
            unique: true,
            lowercase: true,
            trim: true,
        },
        token: {
            type: String,
            default: null,
        },
        googleId: {
            type: String,
            unique: true,
            sparse: true,
        },
        provider: {
            type: String,
            default: 'google',
        },
        avatar: {
            type: String,
            default: null,
        },
        isBlocked: {
            type: Boolean,
            default: false,
        },
    },
    {
        timestamps: true,
    }
);

const User = mongoose.models.User || mongoose.model('User', userSchema);

export default User;
