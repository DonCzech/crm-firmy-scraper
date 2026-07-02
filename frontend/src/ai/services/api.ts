// AI routes live at the backend root (no /api prefix)
const envApiUrl = (import.meta.env.VITE_API_URL as string | undefined)?.trim();
const BACKEND_ROOT = (envApiUrl && envApiUrl.length > 0 ? envApiUrl : 'http://localhost:3001')
  .replace(/\/api\/?$/, '')  // strip trailing /api if present
  .replace(/\/+$/, '');
const API_BASE = BACKEND_ROOT;

export interface AiMessage {
  role: 'user' | 'assistant';
  content: string;
}

export interface Conversation {
  id: string;
  title: string;
  model: string;
  isPinned: boolean;
  createdAt: string;
  updatedAt: string;
  _count?: { messages: number };
}

export interface ConversationDetail extends Conversation {
  messages: Array<{
    id: string;
    role: 'user' | 'assistant';
    content: string;
    createdAt: string;
  }>;
}

/**
 * Stream a chat message from Claude via backend SSE.
 * Calls onChunk for each text token, returns full response text.
 */
export async function streamChat(
  message: string,
  options: {
    conversationId?: string;
    model?: string;
    history?: AiMessage[];
    onChunk: (text: string) => void;
    onError?: (err: string) => void;
  }
): Promise<string> {
  const { conversationId, model, history, onChunk, onError } = options;

  const response = await fetch(`${API_BASE}/ai/chat`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ message, conversationId, model, history }),
  });

  if (!response.ok) {
    const err = `AI API error: ${response.status}`;
    onError?.(err);
    throw new Error(err);
  }

  const reader = response.body?.getReader();
  const decoder = new TextDecoder();
  let fullText = '';

  if (!reader) throw new Error('No response body');

  let buffer = '';

  while (true) {
    const { done, value } = await reader.read();
    if (done) break;

    buffer += decoder.decode(value, { stream: true });
    const lines = buffer.split('\n');
    buffer = lines.pop() ?? '';

    for (const line of lines) {
      if (!line.startsWith('data: ')) continue;
      const json = line.slice(6).trim();
      if (!json) continue;

      try {
        const event = JSON.parse(json);
        if (event.type === 'text') {
          fullText += event.text;
          onChunk(event.text);
        } else if (event.type === 'error') {
          onError?.(event.message);
        }
      } catch {
        // incomplete chunk, ignore
      }
    }
  }

  return fullText;
}

// Conversations API
export async function getConversations(): Promise<Conversation[]> {
  const r = await fetch(`${API_BASE}/ai/conversations`);
  if (!r.ok) return [];
  return r.json();
}

export async function createConversation(title?: string, model?: string): Promise<Conversation> {
  const r = await fetch(`${API_BASE}/ai/conversations`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ title, model }),
  });
  return r.json();
}

export async function getConversation(id: string): Promise<ConversationDetail | null> {
  const r = await fetch(`${API_BASE}/ai/conversations/${id}`);
  if (!r.ok) return null;
  return r.json();
}

export async function updateConversation(id: string, data: { title?: string; model?: string; isPinned?: boolean }): Promise<Conversation> {
  const r = await fetch(`${API_BASE}/ai/conversations/${id}`, {
    method: 'PATCH',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data),
  });
  return r.json();
}

export async function deleteConversationApi(id: string): Promise<void> {
  await fetch(`${API_BASE}/ai/conversations/${id}`, { method: 'DELETE' });
}
