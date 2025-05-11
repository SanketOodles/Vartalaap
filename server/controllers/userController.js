import User from '../models/User.js';
import bcrypt from 'bcryptjs';
import { generateToken } from '../lib/utils.js';
import cloudinary from '../lib/cloudinary.js'


export const signup = async (req, res) => {
    const { fullName, email, password, bio } = req.body;
    try {
        if (!fullName || !email || !password || !bio) {
            return res.status(400).json({ success: false, mmessage: "Please fill all the fields" });
        }
        const user = await User.findOne({ email });
        if (user) {
            return res.status(400).json({ success: false, message: "User already exists" });
        }
        const salt = await bcrypt.genSalt(10);
        const hashedPassword = await bcrypt.hash(password, salt);

        const newUser = await User.create({
            fullName,
            email,
            password: hashedPassword,
            bio,
        });
        const token = generateToken(newUser._id);
        res.status(201).json({ success: true, message: "User created successfully", userData: newUser, token });

    } catch (error) {
        console.error("Error in signup:", error);
        res.status(500).json({ success: false, message: "Internal server error" });

    }
}

export const login = async (req, res) => {
    const { email, password } = req.body
    try {
        const userData = await User.findOne({ email });
        const isPasswordCorrect = bcrypt.compare(password, userData.password);
        if (!isPasswordCorrect) {
            return res.status(400).json({ success: false, message: "Invalid Crdential" });
        }
        const token = generateToken(userData._id);
        res.status(201).json({ success: true, message: "Login successfully", userData, token });

    } catch (error) {
        console.error("Error in login:", error);
        res.status(500).json({ success: false, message: "Internal server error" });
    }
}

export const checkAuth = (req, res) => {
    res.status(200).json({ success: true, user: req.user });
}

export const updateProfile = async(req, res) => {
    try {
        const { profilePic, bio, fullName } = req.body;
        const userId = req.user._id;
        let updateUser;
        if(!profilePic){
            await User.findByIdAndUpdate(userId,{bio,fullName},{new:true});
        }else{
            const upload = await cloudinary.uploader.upload(profilePic);
            updateUser = await User.findByIdAndUpdate(userId,{profilePic:upload.secure_url,bio,fullName},{new:true})
        }
        res.status(200).json({success:true, user:updateUser})
    } catch (error) {
        console.error("Error :", error);
        res.status(500).json({ success: false, message: "Internal server error" });
    }
}