import { create } from "zustand";
import { axiosInstance } from "../lib/axios";
import toast from "react-hot-toast";
import { io } from "socket.io-client";

const BASE_URL = "http://localhost:5001";

export const useAuthStore = create((set, get) => ({
    authUser: null,
    isSigningUp: false,
    isLoggingIn: false,
    isUpdatingProfile: false,
    isCheckingAuth: true,
    onlineUsers: [],
    socket: null,

    checkAuth: async () => {
        try {
            const response = await axiosInstance.get("/auth/check");
            set({ authUser: response.data?.user || response.data });
            try {
                get().connectSocket();
            } catch (err) {
                console.log("Error connecting socket:", err);
            }
        } catch (error) {
            console.log("error in checkAuth:", error.message);
            set({ authUser: null });
        } finally {
            set({ isCheckingAuth: false });
        }
    },

    signup: async (data) => {
        set({ isSigningUp: true });
        try {
            const res = await axiosInstance.post("/auth/signup", data);
            if (res.data?.error) {
                toast.error(res.data.error);
                return;
            }
            set({ authUser: res.data });
            toast.success("Account created successfully");
            try {
                get().connectSocket();
            } catch (err) {
                console.log("Error connecting socket:", err);
            }
        } catch (error) {
            toast.error(error.response?.data?.message || error.response?.data?.error || "Signup failed");
        } finally {
            set({ isSigningUp: false });
        }
    },

    login: async (data) => {
        set({ isLoggingIn: true });
        try {
            const res = await axiosInstance.post("/auth/login", data);
            if (res.data?.error) {
                toast.error(res.data.error);
                return;
            }
            set({ authUser: res.data });
            toast.success("Logged in successfully");
            try {
                get().connectSocket();
            } catch (err) {
                console.log("Error connecting socket:", err);
            }
        } catch (error) {
            toast.error(error.response?.data?.message || error.response?.data?.error || "Login failed");
        } finally {
            set({ isLoggingIn: false });
        }
    },

    logout: async () => {
        try {
            await axiosInstance.post("/auth/logout");
            set({ authUser: null });
            get().disconnectSocket();
            toast.success("Logged out successfully");
        } catch (error) {
            toast.error(error.response?.data?.message || "Logout failed");
        }
    },

    updateProfile: async (data) => {
        set({ isUpdatingProfile: true });
        try {
            const res = await axiosInstance.put("/auth/update-profile", data);
            set({ authUser: res.data.updateUser || res.data });
            toast.success("Profile updated successfully");
        } catch (error) {
            console.log("error in update profile:", error);
            toast.error(error.response?.data?.message || "Failed to update profile");
        } finally {
            set({ isUpdatingProfile: false });
        }
    },

    connectSocket: () => {
        const { authUser } = get();
        if (!authUser || get().socket?.connected) return;

        try {
            const socket = io(BASE_URL, {
                query: {
                    userId: authUser._id,
                },
            });
            socket.connect();

            set({ socket: socket });

            socket.on("getOnlineUsers", (userIds) => {
                set({ onlineUsers: userIds });
            });
            socket.on("onlineUsers", (userIds) => {
                set({ onlineUsers: userIds });
            });
        } catch (err) {
            console.log("Socket connection error:", err);
        }
    },

    disconnectSocket: () => {
        if (get().socket?.connected) get().socket.disconnect();
    }
}));
