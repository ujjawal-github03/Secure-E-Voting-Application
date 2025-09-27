const mongoose = require('mongoose');
const bcrypt = require('bcrypt');

// Define the Person schema
const userSchema = new mongoose.Schema({
    name: {
        type: String,
        required: true
    },
    age: {
        type: Number,
        required: true
    },
    email: {
        type: String
    },
    mobile: {
        type: String,
        required: true
    },
    address: {
        type: String,
        required: true
    },
    aadharCardNumber: {
        type: Number,
        required: true,
        unique: true
    },
    password: {
        type: String,
        required: true
    },
    role: {
        type: String,
        enum: ['voter', 'admin'],
        default: 'voter'
    },
    isVoted: {
        type: Boolean,
        default: false
    }
});

userSchema.pre('save', async function(next){
    const person = this;
    
    // Check if this user is being set as an admin
    if (person.role === 'admin'){
        // Count the existing admins, excluding the current user if it's an update
        const query = { role: 'admin' };
        if (person._id) {
            query._id = { $ne: person._id }; // Exclude current user from count
        }
        
        const adminCount = await mongoose.model('User').countDocuments(query);
    
        // If an admin already exists, prevent saving this user as another admin
        if (adminCount > 0){
            const error = new Error('Only one admin is allowed.');
            return next(error);
        }
    }

    // Hash the password only if it has been modified (or is new)
    if(!person.isModified('password')) return next();
    
    try{
        // hash password generation
        const salt = await bcrypt.genSalt(10);

        // hash password
        const hashedPassword = await bcrypt.hash(person.password, salt);
        
        // Override the plain password with the hashed one
        person.password = hashedPassword;
        next();
    }catch(err){
        return next(err);
    }
});

userSchema.methods.comparePassword = async function(candidatePassword){
    try{
        // Use bcrypt to compare the provided password with the hashed password
        const isMatch = await bcrypt.compare(candidatePassword, this.password);
        return isMatch;
    }catch(err){
        throw err;
    }
};

const User = mongoose.model('User', userSchema);
module.exports = User;