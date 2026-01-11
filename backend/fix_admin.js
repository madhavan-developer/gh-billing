const mongoose = require('mongoose');
const dotenv = require('dotenv');
const User = require('./models/User');
const bcrypt = require('bcryptjs');

dotenv.config();

const fixAdmin = async () => {
    try {
        await mongoose.connect(process.env.MONGO_URI);
        console.log('MongoDB Connected');

        // Find the user created with the plain text password
        const email = 'ghbrothershop@gmail.com';
        const user = await User.findOne({ email });

        if (!user) {
            console.log('User not found, nothing to fix.');
            process.exit();
        }

        console.log('Found user:', user.email);

        // Hash the correct password
        const salt = await bcrypt.genSalt(10);
        const hashedPassword = await bcrypt.hash('GHBrother@123', salt);

        // Update the user
        user.password = hashedPassword;
        await user.save();

        console.log('User password updated to hashed version successfully.');
        process.exit();
    } catch (error) {
        console.error(error);
        process.exit(1);
    }
};

fixAdmin();
