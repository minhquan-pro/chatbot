import {
  useCallback,
  useEffect,
  useLayoutEffect,
  useRef,
  useState,
} from "react";
import { Link } from "react-router-dom";
import api from "@/libs/api";
import { API_ENDPOINTS } from "@/config/apiEndpoints";
import { MessageList } from "@/components/chat/MessageList";
import { Composer } from "@/components/chat/Composer";
import { TypingIndicator } from "@/components/chat/TypingIndicator";

const ASSISTANT_NAME = "Nhân viên bán hàng";

function getErrorMessage(err) {
  const d = err.response?.data;
  if (typeof d === "string") return d;
  if (d && typeof d === "object" && typeof d.message === "string")
    return d.message;
  return err.message || "Request failed";
}

export default function ChatbotPage() {
  const [input, setInput] = useState("");
  const [messages, setMessages] = useState([]);
  const [sending, setSending] = useState(false);
  const [error, setError] = useState("");
  const scrollRef = useRef(null);

  const scrollToBottom = useCallback(() => {
    const el = scrollRef.current;
    if (!el) return;
    requestAnimationFrame(() => {
      el.scrollTop = el.scrollHeight;
    });
  }, []);

  const getMessages = async () => {
    const response = await api.get(API_ENDPOINTS.chatbot.getMessages);
    const messages = response.data;
    return messages;
  };

  useEffect(() => {
    (async () => {
      const result = await getMessages();
      setMessages(result);
    })();
  }, []);

  useLayoutEffect(() => {
    scrollToBottom();
  }, [messages, sending, scrollToBottom]);

  async function handleSend(content) {
    setError("");
    setMessages((prev) => [
      ...prev,
      {
        role: "user",
        content,
        createdAt: Date.now(),
      },
    ]);
    setInput("");
    setSending(true);
    try {
      const assistantMessage = await api.post(API_ENDPOINTS.chatbot.chat, {
        input: content,
      });

      setMessages((prev) => [...prev, assistantMessage.data]);
    } catch (err) {
      setError(getErrorMessage(err));
    } finally {
      setSending(false);
    }
  }

  return (
    <div className="flex h-full min-h-0 flex-col overflow-hidden bg-slate-100">
      <div className="shrink-0 border-b border-slate-200 bg-white px-4 py-3">
        <div className="flex items-center justify-between gap-2">
          <div className="min-w-0">
            <h1 className="text-sm font-semibold text-slate-900">Chatbot</h1>
            <p className="truncate text-xs text-slate-500">{ASSISTANT_NAME}</p>
          </div>
          <Link
            to="/users"
            className="shrink-0 text-xs font-medium text-sky-700 hover:underline"
          >
            Users
          </Link>
        </div>
      </div>

      {error ? (
        <div
          className="shrink-0 border-b border-red-200 bg-red-50 px-4 py-2 text-sm text-red-800"
          role="alert"
        >
          {error}
        </div>
      ) : null}

      <div
        ref={scrollRef}
        className="min-h-0 flex-1 overflow-y-auto overscroll-contain"
      >
        {messages.length === 0 ? (
          <p className="px-4 py-6 text-sm text-slate-500">
            No messages yet. Say hello below.
          </p>
        ) : (
          <MessageList messages={messages} />
        )}
      </div>

      {sending ? <TypingIndicator assistantName={ASSISTANT_NAME} /> : null}

      <Composer
        value={input}
        onChange={setInput}
        onSend={handleSend}
        disabled={sending}
        placeholder={"Nhập tin nhắn…"}
      />
    </div>
  );
}
