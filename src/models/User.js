const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

/**
 * @swagger
 * components:
 *   schemas:
 *     User:
 *       type: object
 *       required:
 *         - username
 *         - email
 *         - password
 *       properties:
 *         _id:
 *           type: string
 *           description: Auto-generated MongoDB ObjectId
 *           example: 507f1f77bcf86cd799439011
 *         username:
 *           type: string
 *           minLength: 3
 *           maxLength: 30
 *           description: Unique username (letters, numbers, hyphens, underscores only)
 *           example: john_doe
 *         email:
 *           type: string
 *           format: email
 *           description: Unique email address
 *           example: john.doe@example.com
 *         password:
 *           type: string
 *           minLength: 6
 *           description: Hashed password (not returned in responses)
 *           example: $2a$10$...
 *         role:
 *           type: string
 *           enum: [admin, teacher, student]
 *           default: student
 *           description: User role
 *           example: student
 *         createdAt:
 *           type: string
 *           format: date-time
 *           description: Account creation timestamp
 *         updatedAt:
 *           type: string
 *           format: date-time
 *           description: Last update timestamp
 */

const userSchema = new mongoose.Schema({
    username: {
        type: String,
        required: [true, 'Username is required'],
        unique: true,
        trim: true,
        minlength: [3, 'Username must be at least 3 characters long'],
        maxlength: [30, 'Username cannot exceed 30 characters']
    },
    email: {
        type: String,
        required: [true, 'Email is required'],
        unique: true,
        trim: true,
        lowercase: true,
        match: [
            /^\w+([\.-]?\w+)*@\w+([\.-]?\w+)*(\.\w{2,3})+$/,
            'Please fill a valid email address'
        ]
    },
    password: {
        type: String,
        required: [true, 'Password is required'],
        minlength: [6, 'Password must be at least 6 characters long'],
        select: false  // Don't return password by default
    },
    role: {
        type: String,
        enum: ['admin', 'teacher', 'student'],
        default: 'student'
    }
}, {
    timestamps: true
});

// Hash password before saving the user
userSchema.pre('save', async function(next) {
    // Only hash password if it's been modified
    if (!this.isModified('password')) return next();

    try {
        // Hash password with salt rounds of 10
        this.password = await bcrypt.hash(this.password, 10);
        next();
    } catch (error) {
        next(error);
    }
});

// Method to compare passwords for login
userSchema.methods.comparePassword = async function(candidatePassword) {
    try {
        // Compare plain text password with hashed password
        return await bcrypt.compare(candidatePassword, this.password);
    } catch (error) {
        throw new Error('Error comparing passwords');
    }
};

// Method to get user data without password (safe for responses)
userSchema.methods.toSafeObject = function() {
    const userObject = this.toObject();
    delete userObject.password;
    return userObject;
};

module.exports = mongoose.model('User', userSchema);
