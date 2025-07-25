export interface ChatMessage {
  sender: 'user' | 'agent';
  text?: string;
  screenshot?: string;
}
