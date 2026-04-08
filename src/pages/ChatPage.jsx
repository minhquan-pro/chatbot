import { useCallback, useEffect, useLayoutEffect, useRef, useState } from "react";
import { Link, Navigate, useParams } from "react-router-dom";
import { getAccessToken } from "@/libs/authStorage";
import api from "@/libs/api";
import { API_ENDPOINTS } from "@/config/apiEndpoints";
import { MessageList } from "@/components/chat/MessageList";
import { Composer } from "@/components/chat/Composer";
import { useAuthUser } from "@/hooks/useAuthUser";
import pusher from "@/libs/pusher";
import {
	mapRealtimePayloadToMessage,
	normalizeMessagePayload,
} from "@/libs/messageViewModel";

const PAGE_SIZE = 20;
const PUSHER_MESSAGE_CREATED = "message:created";

function getErrorMessage(err) {
	const d = err.response?.data;
	if (typeof d === "string") return d;
	if (d && typeof d === "object" && typeof d.message === "string") return d.message;
	return err.message || "Request failed";
}

export default function ChatPage() {
	const { conversationId } = useParams();
	const { user: me, loading: authLoading } = useAuthUser();

	const [input, setInput] = useState("");
	const [messages, setMessages] = useState([]);
	const [peerEmail, setPeerEmail] = useState("");
	const [error, setError] = useState("");
	const [loading, setLoading] = useState(true);
	const [sending, setSending] = useState(false);
	const [hasOlder, setHasOlder] = useState(false);
	const [loadingOlder, setLoadingOlder] = useState(false);
	const [reachedStart, setReachedStart] = useState(false);

	const scrollRef = useRef(null);
	const messagesRef = useRef(messages);
	messagesRef.current = messages;

	const pendingScrollBottomRef = useRef(false);
	const scrollRestoreRef = useRef(null);
	const loadOlderLockRef = useRef(false);

	const scrollToBottom = useCallback(() => {
		const el = scrollRef.current;
		if (!el) return;
		requestAnimationFrame(() => {
			el.scrollTop = el.scrollHeight;
		});
	}, []);

	useLayoutEffect(() => {
		if (scrollRestoreRef.current) {
			const el = scrollRef.current;
			const { oldHeight, oldTop } = scrollRestoreRef.current;
			scrollRestoreRef.current = null;
			if (el) {
				const nextTop = el.scrollHeight - oldHeight + oldTop;
				el.scrollTop = nextTop;
			}
			return;
		}
		if (pendingScrollBottomRef.current) {
			pendingScrollBottomRef.current = false;
			scrollToBottom();
		}
	}, [messages, scrollToBottom]);

	useEffect(() => {
		if (!conversationId || !me || loading) return;

		const channelName = `conversation-${conversationId}`;
		const channel = pusher.subscribe(channelName);

		const onCreated = (payload) => {
			if (!payload?.id || payload.senderId === me.id) return;
			setMessages((prev) => {
				if (prev.some((m) => m.id === payload.id)) return prev;
				const el = scrollRef.current;
				const nearBottom =
					!el || el.scrollHeight - el.scrollTop - el.clientHeight < 140;
				if (nearBottom) pendingScrollBottomRef.current = true;
				return [...prev, mapRealtimePayloadToMessage(payload, me.id)];
			});
		};

		channel.bind(PUSHER_MESSAGE_CREATED, onCreated);

		return () => {
			channel.unbind(PUSHER_MESSAGE_CREATED, onCreated);
			pusher.unsubscribe(channelName);
		};
	}, [conversationId, me, loading]);

	useEffect(() => {
		if (!conversationId || !me) return;
		let cancelled = false;
		pendingScrollBottomRef.current = false;
		scrollRestoreRef.current = null;
		setMessages([]);
		setHasOlder(false);
		setReachedStart(false);
		(async () => {
			setError("");
			setLoading(true);
			try {
				const [convRes, msgRes] = await Promise.all([
					api.get(API_ENDPOINTS.conversations.list),
					api.get(API_ENDPOINTS.conversations.messages(conversationId), {
						params: { limit: PAGE_SIZE },
					}),
				]);
				if (cancelled) return;
				const list = Array.isArray(convRes.data) ? convRes.data : [];
				const row = list.find((c) => c.id === conversationId);
				if (row?.peer?.email) {
					setPeerEmail(row.peer.email);
				}
				const raw = Array.isArray(msgRes.data) ? msgRes.data : [];
				const mapped = raw.map((m) => normalizeMessagePayload(m, me.id));
				setMessages(mapped);
				setHasOlder(raw.length === PAGE_SIZE);
				setReachedStart(raw.length < PAGE_SIZE);
				pendingScrollBottomRef.current = true;
			} catch (err) {
				if (!cancelled) setError(getErrorMessage(err));
			} finally {
				if (!cancelled) setLoading(false);
			}
		})();
		return () => {
			cancelled = true;
		};
	}, [conversationId, me]);

	const loadOlder = useCallback(async () => {
		if (!conversationId || !me || loading || loadingOlder || !hasOlder) return;
		if (loadOlderLockRef.current) return;
		const oldest = messagesRef.current[0];
		if (!oldest || String(oldest.id).startsWith("temp-")) return;

		const el = scrollRef.current;
		if (!el) return;

		loadOlderLockRef.current = true;
		const snapshot = {
			oldHeight: el.scrollHeight,
			oldTop: el.scrollTop,
		};
		scrollRestoreRef.current = snapshot;
		setLoadingOlder(true);
		try {
			const { data } = await api.get(API_ENDPOINTS.conversations.messages(conversationId), {
				params: { before: oldest.id, limit: PAGE_SIZE },
			});
			const raw = Array.isArray(data) ? data : [];
			const older = raw.map((m) => normalizeMessagePayload(m, me.id));
			if (older.length === 0) {
				scrollRestoreRef.current = null;
				requestAnimationFrame(() => {
					const node = scrollRef.current;
					if (node) node.scrollTop = snapshot.oldTop;
				});
				setHasOlder(false);
				setReachedStart(true);
				return;
			}
			setHasOlder(older.length === PAGE_SIZE);
			if (older.length < PAGE_SIZE) {
				setReachedStart(true);
			}
			setMessages((prev) => [...older, ...prev]);
		} catch (err) {
			scrollRestoreRef.current = null;
			requestAnimationFrame(() => {
				const node = scrollRef.current;
				if (node) node.scrollTop = snapshot.oldTop;
			});
			setError(getErrorMessage(err));
		} finally {
			setLoadingOlder(false);
			loadOlderLockRef.current = false;
		}
	}, [conversationId, me, loading, loadingOlder, hasOlder]);

	const onScroll = useCallback(() => {
		const el = scrollRef.current;
		if (!el || loading || loadingOlder || !hasOlder) return;
		if (el.scrollTop < 80) {
			void loadOlder();
		}
	}, [loading, loadingOlder, hasOlder, loadOlder]);

	async function handleSend(text) {
		if (!conversationId || !me) return;
		setError("");
		setSending(true);
		const optimistic = {
			id: `temp-${Date.now()}`,
			role: "user",
			text,
			senderName: me.email,
			createdAt: Date.now(),
		};
		pendingScrollBottomRef.current = true;
		setMessages((prev) => [...prev, optimistic]);
		setInput("");
		try {
			const { data } = await api.post(API_ENDPOINTS.conversations.messages(conversationId), {
				content: text,
			});
			const mapped = normalizeMessagePayload(data, me.id);
			pendingScrollBottomRef.current = true;
			setMessages((prev) => prev.map((m) => (m.id === optimistic.id ? mapped : m)));
		} catch (err) {
			setError(getErrorMessage(err));
			setMessages((prev) => prev.filter((m) => m.id !== optimistic.id));
		} finally {
			setSending(false);
		}
	}

	if (authLoading) {
		return <div className="flex h-full items-center justify-center text-sm text-slate-500">Loading…</div>;
	}

	if (!me) {
		if (!getAccessToken()) {
			return <Navigate to="/login" replace />;
		}
		return (
			<div className="flex h-full flex-col items-center justify-center gap-2 p-6 text-center text-sm text-red-600">
				<p>Could not load your profile.</p>
				<Link to="/login" className="font-medium text-sky-700 hover:underline">
					Sign in again
				</Link>
			</div>
		);
	}

	return (
		<div className="flex h-full min-h-0 flex-col overflow-hidden bg-slate-100">
			<div className="shrink-0 border-b border-slate-200 bg-white px-4 py-3">
				<div className="flex items-center justify-between gap-2">
					<div className="min-w-0">
						<h1 className="text-sm font-semibold text-slate-900">Messages</h1>
						{peerEmail ? (
							<p className="truncate text-xs text-slate-500" title={peerEmail}>
								With {peerEmail}
							</p>
						) : loading ? (
							<p className="text-xs text-slate-400">Loading…</p>
						) : null}
					</div>
					<Link to="/users" className="shrink-0 text-xs font-medium text-sky-700 hover:underline">
						Users
					</Link>
				</div>
			</div>

			{error ? (
				<p className="shrink-0 bg-red-50 px-4 py-2 text-sm text-red-700" role="alert">
					{error}
				</p>
			) : null}

			<div ref={scrollRef} onScroll={onScroll} className="min-h-0 flex-1 overflow-y-auto overscroll-contain">
				{loading ? (
					<p className="px-4 py-6 text-sm text-slate-500">Loading messages…</p>
				) : (
					<>
						<div className="min-h-[2rem] shrink-0" aria-hidden={!loadingOlder && !reachedStart}>
							{loadingOlder ? (
								<div className="flex justify-center py-2">
									<span className="text-xs text-slate-400">Loading earlier messages…</span>
								</div>
							) : reachedStart && messages.length > 0 ? (
								<div className="flex justify-center py-2">
									<span className="text-xs text-slate-400">Start of conversation</span>
								</div>
							) : null}
						</div>
						<MessageList messages={messages} />
					</>
				)}
			</div>

			<Composer
				value={input}
				onChange={setInput}
				onSend={handleSend}
				disabled={sending || loading || !conversationId}
				placeholder="Write a message…"
			/>
		</div>
	);
}
