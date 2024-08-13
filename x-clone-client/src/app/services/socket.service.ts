import { Injectable } from '@angular/core';
import { io, Socket } from 'socket.io-client';
import { environment } from '../../environments/environment';

@Injectable({
  providedIn: 'root'
})
export class SocketService {
  private socket: Socket;

  constructor() {
    // Establish a connection to the backend Socket.io server
    this.socket = io('http://localhost:3000');

    // Listen for connection errors or disconnections
    this.socket.on('connect_error', (error) => {
      console.error('Socket connection error:', error);
    });

    this.socket.on('disconnect', (reason) => {
      console.warn('Socket disconnected:', reason);
    });
  }

  // Emit an event to the backend
  emit(eventName: string, data?: any): void {
    this.socket.emit(eventName, data);
  }

  // Listen for an event from the backend
  on(eventName: string, callback: (data: any) => void): void {
    this.socket.on(eventName, callback);
  }

  // Disconnect the socket (if needed)
  disconnect(): void {
    this.socket.disconnect();
  }
}
