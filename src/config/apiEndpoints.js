/** Central place for API paths (single source of truth). */
export const API_ENDPOINTS = {
  auth: {
    login: "/auth/login",
    register: "/auth/register",
    refresh: "/auth/refresh",
    me: "/auth/me",
  },
  users: {
    list: "/users",
  },
  conversations: {
    list: "/conversations",
    dm: (peerUserId) => `/conversations/dm/${peerUserId}`,
    dmMessages: (peerUserId) => `/conversations/dm/${peerUserId}/messages`,
    messages: (conversationId) => `/conversations/${conversationId}/messages`,
  },
  chatbot: {
    chat: "/chatbotMessage/chat",
    getMessages: "/chatbotMessage/messages",
  },
};
