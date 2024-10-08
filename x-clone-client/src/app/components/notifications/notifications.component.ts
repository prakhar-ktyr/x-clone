import { Component, OnInit } from '@angular/core';
import { NotificationService } from 'src/app/services/notification.service';
import { SocketService } from 'src/app/services/socket.service';

@Component({
  selector: 'app-notifications',
  templateUrl: './notifications.component.html',
  styleUrls: ['./notifications.component.css']
})
export class NotificationsComponent implements OnInit {
  notifications: any[] = [];

  constructor(
    private notificationService: NotificationService,
    private socketService: SocketService
  ) {}

  ngOnInit(): void {
    // Fetch historical notifications
    this.notificationService.fetchNotifications().subscribe(
      (data) => {
        this.notifications = this.formatNotifications(data);
      },
      (error) => {
        console.error('Error fetching notifications', error);
      }
    );

    // Subscribe to real-time notifications
    this.socketService.onNotification((notification) => {
      if (notification.sender && notification.sender.handle) {
        this.notifications.unshift(this.formatNotification(notification));
      } else {
        // Fetch the notification again if sender data is not populated
        this.notificationService.fetchNotifications().subscribe(
          (data) => {
            this.notifications = this.formatNotifications(data);
          },
          (error) => {
            console.error('Error fetching notifications', error);
          }
        );
      }

      if (this.notifications.length > 20) {
        this.notifications.pop();
      }
    });

  }

  formatNotifications(notifications: any[]): any[] {
    return notifications.map((notification) => this.formatNotification(notification));
  }

  formatNotification(notification: any): any {
    let message = '';
    switch (notification.type) {
      case 'like':
        message = ` liked your tweet.`;
        break;
      case 'retweet':
        message = ` retweeted your tweet.`;
        break;
      case 'follow':
        message = ` followed you.`;
        break;
      default:
        message = 'You have a new notification.';
    }
    return {
      ...notification,
      message: message,
    };
  }
}
