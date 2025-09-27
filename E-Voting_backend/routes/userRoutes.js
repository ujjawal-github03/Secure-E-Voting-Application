const express = require('express');
const router = express.Router();
const User = require('./../models/user');
const {jwtAuthMiddleware, generateToken} = require('./../jwt');

// POST route to add a person
router.post('/signup', async (req, res) =>{
    try{
        const data = req.body // Assuming the request body contains the User data

        // Check if there is already an admin user
        const adminUser = await User.findOne({ role: 'admin' });
        if (data.role === 'admin' && adminUser) {
            return res.status(400).json({ error: 'Admin user already exists' });
        }

        // Validate Aadhar Card Number must have exactly 12 digit
        if (!/^\d{12}$/.test(data.aadharCardNumber)) {
            return res.status(400).json({ error: 'Aadhar Card Number must be exactly 12 digits' });
        }

        // Validate mobile number must have exactly 10 digits
        if (!/^\d{10}$/.test(data.mobile)) {
            return res.status(400).json({ error: 'Mobile number must be exactly 10 digits' });
        }

        // Check if a user with the same Aadhar Card Number already exists
        const existingUserByAadhar = await User.findOne({ aadharCardNumber: data.aadharCardNumber });
        if (existingUserByAadhar) {
            return res.status(400).json({ error: 'User with the same Aadhar Card Number already exists' });
        }

        // Check if a user with the same mobile number already exists
        const existingUserByMobile = await User.findOne({ mobile: data.mobile });
        if (existingUserByMobile) {
            return res.status(400).json({ error: 'User with the same mobile number already exists' });
        }

        // Check if a user with the same email already exists
        const existingUserByEmail = await User.findOne({ email: data.email });
        if (existingUserByEmail) {
            return res.status(400).json({ error: 'User with the same email already exists' });
        }

        // Validate age
        if (parseInt(data.age) < 18) {
            return res.status(400).json({ error: 'Age must be 18 or above to register' });
        }

        // Create a new User document using the Mongoose model
        const newUser = new User(data);

        // Save the new user to the database
        const response = await newUser.save();
        console.log('User data saved successfully');

        const payload = {
            id: response.id
        }
        console.log(JSON.stringify(payload));
        const token = generateToken(payload);

        res.status(200).json({response: response, token: token});
    }
    catch(err){
        console.log(err);
        res.status(500).json({error: 'Internal Server Error'});
    }
})

// Login Route
router.post('/login', async(req, res) => {
    try{
        // Extract aadharCardNumber and password from request body
        const {aadharCardNumber, password} = req.body;

        // Check if aadharCardNumber or password is missing
        if (!aadharCardNumber || !password) {
            return res.status(400).json({ error: 'Aadhar Card Number and password are required' });
        }

        // Validate Aadhar Card Number format
        if (!/^\d{12}$/.test(aadharCardNumber)) {
            return res.status(400).json({ error: 'Invalid Aadhar Card Number format' });
        }

        // Find the user by aadharCardNumber
        const user = await User.findOne({aadharCardNumber: aadharCardNumber});

        // If user does not exist or password does not match, return error
        if( !user || !(await user.comparePassword(password))){
            return res.status(401).json({error: 'Invalid Aadhar Card Number or Password'});
        }

        // generate Token 
        const payload = {
            id: user.id,
        }
        const token = generateToken(payload);

        // return token as response
        res.json({token})
    }catch(err){
        console.error(err);
        res.status(500).json({ error: 'Internal Server Error' });
    }
});

// Profile route
router.get('/profile', jwtAuthMiddleware, async (req, res) => {
    try{
        const userData = req.user;
        const userId = userData.id;
        const user = await User.findById(userId);
        res.status(200).json({user});
    }catch(err){
        console.error(err);
        res.status(500).json({ error: 'Internal Server Error' });
    }
})

// Update password route
router.put('/profile/password', jwtAuthMiddleware, async (req, res) => {
    try {
        const userId = req.user.id; // Extract the id from the token
        const { currentPassword, newPassword } = req.body; // Extract current and new passwords from request body

        // Check if currentPassword and newPassword are present in the request body
        if (!currentPassword || !newPassword) {
            return res.status(400).json({ error: 'Both currentPassword and newPassword are required' });
        }

        // Validate new password length
        if (newPassword.length < 6) {
            return res.status(400).json({ error: 'New password must be at least 6 characters long' });
        }

        // Find the user by userID
        const user = await User.findById(userId);

        // If user does not exist or password does not match, return error
        if (!user || !(await user.comparePassword(currentPassword))) {
            return res.status(401).json({ error: 'Invalid current password' });
        }

        // Update the user's password
        user.password = newPassword;
        await user.save();

        console.log('Password updated successfully');
        res.status(200).json({ message: 'Password updated successfully' });
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: 'Internal Server Error' });
    }
});

// Forgot Password - Verify Aadhar Number route
router.post('/forgot-password/verify-aadhar', async (req, res) => {
    try {
        const { aadharCardNumber } = req.body;

        // Check if aadharCardNumber is provided
        if (!aadharCardNumber) {
            return res.status(400).json({ error: 'Aadhar Card Number is required' });
        }

        // Validate Aadhar Card Number format
        if (!/^\d{12}$/.test(aadharCardNumber)) {
            return res.status(400).json({ error: 'Invalid Aadhar Card Number format' });
        }

        // Find the user by aadharCardNumber
        const user = await User.findOne({ aadharCardNumber: aadharCardNumber });

        if (!user) {
            return res.status(404).json({ error: 'No account found with this Aadhar Card Number' });
        }

        // Return the mobile number (masked for security)
        const maskedMobile = user.mobile.replace(/(\d{2})(\d{4})(\d{4})/, '$1****$3');
        
        res.status(200).json({
            message: 'Aadhar Card Number verified successfully',
            mobile: user.mobile, // Frontend needs full number for OTP
            maskedMobile: maskedMobile // For display purposes
        });

    } catch (err) {
        console.error('Error in forgot password verify aadhar:', err);
        res.status(500).json({ error: 'Internal Server Error' });
    }
});

// Forgot Password - Reset Password route
router.post('/forgot-password/reset', async (req, res) => {
    try {
        const { aadharCardNumber, newPassword } = req.body;

        // Check if required fields are provided
        if (!aadharCardNumber || !newPassword) {
            return res.status(400).json({ error: 'Aadhar Card Number and new password are required' });
        }

        // Validate Aadhar Card Number format
        if (!/^\d{12}$/.test(aadharCardNumber)) {
            return res.status(400).json({ error: 'Invalid Aadhar Card Number format' });
        }

        // Validate new password length
        if (newPassword.length < 6) {
            return res.status(400).json({ error: 'New password must be at least 6 characters long' });
        }

        // Find the user by aadharCardNumber
        const user = await User.findOne({ aadharCardNumber: aadharCardNumber });

        if (!user) {
            return res.status(404).json({ error: 'No account found with this Aadhar Card Number' });
        }

        // Update the user's password
        user.password = newPassword;
        await user.save();

        console.log(`Password reset successfully for user: ${user.aadharCardNumber}`);
        res.status(200).json({ 
            message: 'Password has been reset successfully. You can now login with your new password.' 
        });

    } catch (err) {
        console.error('Error in forgot password reset:', err);
        res.status(500).json({ error: 'Internal Server Error' });
    }
});

module.exports = router;