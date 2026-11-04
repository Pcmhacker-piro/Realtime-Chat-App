import Message from "../models/message.model.js";
import { User } from "../models/user.model.js";
import cloudinary from "../lib/cloudinary.js";
import { getReceiverSocketId, io } from "../lib/socket.js";

export const getUserForSidebar = async (req, res) => {
    try {
        const loggedInUserId = req.user._id;
        const filterUserId = await User.find({ _id: { $ne: loggedInUserId } }).select("-password");
        return res.status(200).json(filterUserId);
    } catch (error) {
        console.log("error", error.message);
        return res.status(500).json({ message: "Internal Server Error" });
    }
};

export const getMessages = async (req, res) => {
    try {
        const { id: chatId } = req.params;
        const myId = req.user._id;

        const message = await Message.find({
            $or: [
                { senderId: myId, receiverId: chatId },
                { senderId: chatId, receiverId: myId },
            ]
        });
        res.status(200).json(message);

    } catch (error) {
        console.log("error", error.message);
        return res.status(500).json({ message: "Internal Server Error" });
    }
};

export const sendMessage = async (req, res) => {
    try {
        const { text, image } = req.body;
        const receiverId = req.params.id;
        const senderId = req.user._id;
        if (!text && !image) {
            return res.status(400).json({ message: "Message is required" });
        }

        let imageUrl;
        if (image) {
            const uploadResponse = await cloudinary.uploader.upload(image);
            imageUrl = uploadResponse.secure_url;
        }

        const message = new Message({
            senderId,
            receiverId,
            ...(text && { text }),
            ...(imageUrl && { image: imageUrl }),
        });

        await message.save();

        const receiverSocketId = getReceiverSocketId(receiverId);
        if (receiverSocketId) {
            io.to(receiverSocketId).emit("newMessage", message);
        }

        return res.status(201).json(message);
    } catch (error) {
        console.log("error in sendMessage controller:", error.message);
        return res.status(500).json({ message: "Internal Server Error" });
    }
};
