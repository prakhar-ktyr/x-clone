import { Component, OnInit } from '@angular/core';
import { ProfileService } from 'src/app/services/profile.service';
import { TweetService } from 'src/app/services/tweet.service';

@Component({
  selector: 'app-profile-dashboard',
  templateUrl: './profile-dashboard.component.html',
  styleUrls: ['./profile-dashboard.component.css']
})
export class ProfileDashboardComponent implements OnInit {
  profile: any = {};
  tweets: any[] = [];

  constructor(private profileService: ProfileService, private tweetService: TweetService) {}

  ngOnInit(): void {
    this.loadProfile();
    this.loadUserTweets();
  }

  loadProfile(): void {
    this.profileService.getProfile().subscribe(
      data => {
        this.profile = data;
      },
      error => {
        console.error('Error fetching profile', error);
      }
    );
  }

  loadUserTweets(): void {
    this.tweetService.getTweetsByUser().subscribe(
      data => {
        this.tweets = data;
      },
      error => {
        console.error('Error fetching tweets', error);
      }
    );
  }

  onUpdateProfile(): void {
    // Logic to update profile
  }
}
