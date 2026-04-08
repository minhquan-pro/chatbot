/**
 * Map payload real-time (có senderId) → cùng shape với tin từ API view model.
 * @param {{ id: string, text: string, senderId: string, senderName?: string, createdAt: string|number }} payload
 * @param {string} myId
 */
export function mapRealtimePayloadToMessage(payload, myId) {
	return {
		id: payload.id,
		text: payload.text,
		senderName: payload.senderName ?? 'Unknown',
		role: payload.senderId === myId ? 'user' : 'assistant',
		createdAt:
			typeof payload.createdAt === 'number'
				? payload.createdAt
				: new Date(payload.createdAt).getTime(),
	}
}

/**
 * Chuẩn hóa tin từ API: view model (POST/GET) hoặc legacy Prisma shape.
 * @param {object} data
 * @param {string} myId
 */
export function normalizeMessagePayload(data, myId) {
	if (
		data &&
		typeof data.text === 'string' &&
		(data.role === 'user' || data.role === 'assistant')
	) {
		return {
			id: data.id,
			text: data.text,
			senderName: data.senderName ?? 'Unknown',
			role: data.role,
			createdAt:
				typeof data.createdAt === 'number'
					? data.createdAt
					: new Date(data.createdAt).getTime(),
		}
	}
	if (data && typeof data.content === 'string' && data.senderId != null) {
		return {
			id: data.id,
			role: data.senderId === myId ? 'user' : 'assistant',
			text: data.content,
			senderName: data.sender?.email ?? 'Unknown',
			createdAt: new Date(data.createdAt).getTime(),
		}
	}
	return {
		id: String(data?.id ?? ''),
		role: 'assistant',
		text: '',
		senderName: 'Unknown',
		createdAt: Date.now(),
	}
}
