import { create } from "zustand";
import toast from "react-hot-toast";
import { axiosInstance } from "../lib/axios";
import { useAuthStore } from "./userAuthStore";

export const useChatStore = create((set, get) => ({
  messages: [],
  users: [],
  selectedUser: null,
  isUsersLoading: false,
  isUserLoading: false,
  isMessagesLoading: false,
  isMessageLoading: false,

  getUsers: async () => {
    set({ isUsersLoading: true, isUserLoading: true });
    try {
      const res = await axiosInstance.get("/messages/users");
      set({ users: Array.isArray(res.data) ? res.data : [] });
    } catch (error) {
      toast.error(error.response?.data?.message || "Failed to load users");
    } finally {
      set({ isUsersLoading: false, isUserLoading: false });
    }
  },

  getMessages: async (userId) => {
    set({ isMessagesLoading: true, isMessageLoading: true });
    try {
      const res = await axiosInstance.get(`/messages/${userId}`);
      set({ messages: Array.isArray(res.data) ? res.data : [] });
    } catch (error) {
      toast.error(error.response?.data?.message || "Failed to load messages");
    } finally {
      set({ isMessagesLoading: false, isMessageLoading: false });
    }
  },

  sendMessage: async (messageData) => {
    const { selectedUser, messages } = get();
    try {
      const res = await axiosInstance.post(`/messages/send/${selectedUser._id}`, messageData);
      set({ messages: [...messages, res.data] });
    } catch (error) {
      toast.error(error.response?.data?.message || "Failed to send message");
    }
  },

  subscribeToMessages: () => {
    const { selectedUser } = get();
    if (!selectedUser) return;

    const socket = useAuthStore.getState().socket;
    if (!socket) return;

    // Remove any previous listener to avoid duplicate message appending
    socket.off("newMessage");

    socket.on("newMessage", (newMessage) => {
      const currentSelectedUser = get().selectedUser;
      if (!currentSelectedUser) return;

      const isMessageSentFromSelectedUser =
        String(newMessage.senderId) === String(currentSelectedUser._id);
      if (!isMessageSentFromSelectedUser) return;

      set({
        messages: [...get().messages, newMessage],
      });
    });
  },

  unsubscribeFromMessages: () => {
    const socket = useAuthStore.getState().socket;
    if (!socket) return;
    socket.off("newMessage");
  },

  // Aliases for compatibility
  subscribeToSocketMessages: () => get().subscribeToMessages(),
  unsubsCribeFromSocketMessages: () => get().unsubscribeFromMessages(),
  unsubsCribeToMessages: () => get().unsubscribeFromMessages(),

  setSelectedUser: (selectedUser) => set({ selectedUser }),
}));

// Export alias so either useChatStore or userChatStore works
export const userChatStore = useChatStore;
