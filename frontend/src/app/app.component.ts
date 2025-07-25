import { Component, OnInit } from '@angular/core';
import { Observable } from 'rxjs';
import { ChatService } from './chat.service';
import { ChatMessage } from './models/chat-message';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.css']
})
export class AppComponent implements OnInit {
  prompt = '';
  messages$!: Observable<ChatMessage[]>;
  screenshot$!: Observable<string | null>;

  constructor(private chat: ChatService) {}

  ngOnInit(): void {
    this.messages$ = this.chat.messages$;
    this.screenshot$ = this.chat.screenshot$;
  }

  send(): void {
    if (!this.prompt.trim()) return;
    this.chat.sendPrompt(this.prompt).subscribe();
    this.prompt = '';
  }
}