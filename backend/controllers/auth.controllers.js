import { User } from "../models/user.model.js";
import generateToken from "../lib/utils.js";
import bcrypt from "bcryptjs";
import cloudinary from "../lib/cloudinary.js";

export const signup = async (req,res) =>{

    try{
        const {fullName,email,password} = req.body;

        if(!fullName || !email || !password){
            return res.status(400).json({message : "All field are required"});
        }

        if(password.length < 6){
            return res.status(400).json({message:"password is too short"});
            
        }

        const existUser = await User.findOne({email});
        
        if(existUser){
            return res.status(400).json({message:"User already exists"});
        }
        
        const hashpassword = await bcrypt.hash(password,10);
        
        const newUser = new User({
            fullName : fullName,
            email : email,
            password : hashpassword
        });
        
        if(newUser){
            await newUser.save();
            generateToken(newUser._id,res);
            return res.status(201).json({
                _id : newUser._id,
                fullName : newUser.fullName,
                email : newUser.email,
                profilePic : newUser.profilePic,
                message : "Signup successfully",
            });
        }else{
            return res.status(400).json({message:"Error during signup"});
        }

    } catch(error){
        console.log("Error in signup controller:", error.message);
        res.status(500).json({ message: "Internal Server Error" });
    }
}

export const login = async (req,res) =>{
    try{
        const {email,password} = req.body;
        if(!email || !password){
            return res.status(400).json({error : "All field required"});
        }

        const userExistOrNot = await User.findOne({email});
        if(!userExistOrNot){
            return res.status(400).json({error : "Invalid Credentials"});
        }

        //check for password now
        const passwordmatch = await bcrypt.compare(password , userExistOrNot.password);
        if(!passwordmatch){
            return res.status(400).json({error : "Invalid password"});
        }

        generateToken(userExistOrNot._id,res);
        res.json({
            _id : userExistOrNot.id,
            fullName : userExistOrNot.fullName,
            email : userExistOrNot.email,
            profilePic : userExistOrNot.profilePic,
            message : "Login successfully"
        });

        // res.status(200).json({message : "Login successfully"});


    }catch(error){
        console.log("Error in login controller:", error.message);
        res.status(500).json({ message: "Internal Server Error" });

    }
}

export const logout = (req,res) =>{
    try{
        res.cookie("jwt", "", {
            maxAge:0,
            httpOnly:true,
            sameSite:"strict",
            secure:process.env.NODE_ENV != "development",
        })
        res.status(200).json({message : "Logout successfully"});

    }catch(error){
        console.log("Error in logout controller:", error.message);
        res.status(500).json({ message: "Internal Server Error" });

    }
}

export const updateProfile = async (req,res) =>{
    try{    
        const {profilePic} = req.body;
        const userId = req.user._id;
        if(!profilePic){
            return res.status(400).json({messge :"proifle pic required"});
        }
        const uploadResonse = await cloudinary.uploader.upload(profilePic);
        const updateUser = await User.findByIdAndUpdate(userId,{profilePic : uploadResonse.secure_url},{new:true});
        return res.status(200).json({message : "profile pic updated successfully",updateUser})
    }catch(error){
        console.log("error in updateProfile controller:", error);
        return res.status(500).json({ message: error.message || "Internal Server Error" })
    }
    
}

export const checkAuth = (req,res) =>{
    try{
        return res.status(200).json({message : "Authonticated",user : req.user});
    }catch(error){
        console.log("error in updateProfile controller:", error);
        return res.status(500).json({ message: error.message || "Internal Server Error" })
    }

}