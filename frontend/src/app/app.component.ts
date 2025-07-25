import { Component, OnInit } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { io, Socket } from 'socket.io-client';
interface ChatMessage { sender:'user'|'agent'; text?:string; screenshot?:string; }
@Component({selector:'app-root',templateUrl:'./app.component.html',styleUrls:['./app.component.css']})
export class AppComponent implements OnInit {
  prompt=''; messages:ChatMessage[]=[]; screenshot:string|null=null;
  private socket:Socket;
  constructor(private http:HttpClient){ this.socket=io('http://localhost:3000'); }
  ngOnInit(){
    this.socket.on('chat-message',msg=>this.messages.push(msg));
    this.socket.on('screenshot',img=>this.screenshot=img);
  }
  send(){
    if(!this.prompt.trim())return;
    this.messages.push({sender:'user',text:this.prompt});
    this.http.post('http://localhost:3000/api/execute',{prompt:this.prompt}).subscribe();
    this.prompt='';
  }
}