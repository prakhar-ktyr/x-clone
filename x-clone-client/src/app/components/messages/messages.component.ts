import { Component, OnInit } from '@angular/core';
import { SocketService } from 'src/app/services/socket.service';
import { AuthService } from 'src/app/services/auth.service';
import { ActivatedRoute, Router } from '@angular/router';
import { MessageService } from 'src/app/services/message.service';

@Component({
  selector: 'app-messages',
  templateUrl: './messages.component.html',
  styleUrls: ['./messages.component.css']
})
export class MessagesComponent implements OnInit {
  userId!: string; // The selected user's ID
  loggedInUserId!: string; // The logged-in user's ID
  messages: any[] = [];
  messageContent: string = '';
  chatHistory: any[] = []; // Stores previous chat users
  selectedChatUser: any; // Stores the selected chat user's details

  constructor(
    private socketService: SocketService,
    private authService: AuthService,
    private route: ActivatedRoute,
    private messageService: MessageService,
    private router: Router
  ) { }

  ngOnInit(): void {
    this.loggedInUserId = this.authService.getUser().id;

    // Join the room for real-time communication
    this.socketService.emit('joinRoom', this.loggedInUserId);

    // Extract userId from route parameters
    this.route.params.subscribe(params => {
      this.userId = params['userId'];
      this.loadMessages();
      this.setSelectedChatUser();
    });

    // Listen for incoming messages
    this.socketService.on('receiveMessage', (message: any) => {
      if ((message.sender === this.userId && message.receiver === this.loggedInUserId) || 
          (message.sender === this.loggedInUserId && message.receiver === this.userId)) {
        this.messages.push(message);
      }
    });

    this.loadChatHistory();
  }

  loadMessages(): void {
    this.messageService.getChatHistory(this.userId).subscribe(
      messages => {
        this.messages = messages;
      },
      error => {
        console.error('Error loading messages:', error);
      }
    );
  }

  sendMessage(): void {
    if (this.messageContent.trim()) {
      const message = {
        sender: this.loggedInUserId,
        receiver: this.userId,
        content: this.messageContent
      };

      // Save the message to the database
      this.messageService.sendMessage(this.userId, this.messageContent).subscribe(
        savedMessage => {
          // Emit the saved message to the socket server
          this.socketService.emit('sendMessage', savedMessage);

          // Add the message to the local list (optimistic UI update)
          this.messages.push(savedMessage);

          // Clear the input field
          this.messageContent = '';
        },
        error => {
          console.error('Error sending message:', error);
        }
      );
    }
  }

  loadChatHistory(): void {
    this.messageService.getChatUsers().subscribe(
      chatHistory => {
        this.chatHistory = chatHistory;
        this.setSelectedChatUser();
      },
      error => {
        console.error('Error loading chat history:', error);
      }
    );
  }

  setSelectedChatUser(): void {
    this.selectedChatUser = this.chatHistory.find(chat => chat.userId === this.userId);
  }

  selectChat(userId: string): void {
    this.router.navigate(['/messages', { userId }]).then(() => {
      this.userId = userId;
      this.setSelectedChatUser();
      this.loadMessages(); // Load messages for the selected user
    });
  }
}
