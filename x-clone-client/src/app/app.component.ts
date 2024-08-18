import { Component, OnInit } from '@angular/core';
import { AuthService } from './services/auth.service';
import { SocketService } from './services/socket.service';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.css']
})
export class AppComponent implements OnInit {
  title = 'x-clone-client';

  constructor(private authService: AuthService, private socketService: SocketService) {}

  ngOnInit(): void {
    const currentUser = this.authService.getUser();
    console.log("Current User", currentUser);
    if (currentUser) {
      // Connect to the user's notification room
      this.socketService.joinRoom(currentUser.id);
    }

    // Listen for incoming notifications
    this.socketService.onNotification((notification) => {
      this.handleNotification(notification);
    });
  }

  handleNotification(notification: any): void {
    // Handle the notification (e.g., show a toast notification, update UI)
    console.log('New notification:', notification);
    // You can implement further logic here to display notifications to the user
  }
}
