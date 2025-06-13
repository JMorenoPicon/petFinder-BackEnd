import mongoose from 'mongoose';
// import bcrypt from 'bcryptjs';

const userSchema = new mongoose.Schema({
    username: {
        type: String,
        required: true,
        unique: true
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
    role: {
        type: String,
        enum: ['user', 'admin'],
        default: 'user'
    },
    resetPasswordToken: String,
    resetPasswordExpires: Date,
    verificationCode: String,
    isVerified: {
        type: Boolean,
        default: false
    },
    pendingEmail: {
        type: String,
        default: null
    },
    pendingEmailCode: {
        type: String,
        default: null
    },
}, {
    timestamps: true
});

// userSchema.methods.comparePassword = async function (password) {
//     return bcrypt.compare(password, this.password);
// };

const User = mongoose.model('User', userSchema);

export default User;
