import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { io, Socket } from 'socket.io-client';
import { BehaviorSubject, Observable } from 'rxjs';
import { ChatMessage } from './models/chat-message';

@Injectable({ providedIn: 'root' })
export class ChatService {
  private socket: Socket;
  private messages = new BehaviorSubject<ChatMessage[]>([]);
  private screenshot = new BehaviorSubject<string | null>(null);

  messages$ = this.messages.asObservable();
  screenshot$ = this.screenshot.asObservable();

  constructor(private http: HttpClient) {
    this.socket = io('http://localhost:3000');
    this.socket.on('chat-message', msg => {
      this.messages.next([...this.messages.getValue(), msg]);
    });
    this.socket.on('screenshot', img => this.screenshot.next(img));
  }

  sendPrompt(prompt: string): Observable<any> {
    this.messages.next([...this.messages.getValue(), { sender: 'user', text: prompt }]);
    return this.http.post('http://localhost:3000/api/execute', { prompt });
  }
}
