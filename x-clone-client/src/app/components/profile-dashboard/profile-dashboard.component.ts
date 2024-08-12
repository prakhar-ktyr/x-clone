import { Component, OnInit, AfterViewInit, ElementRef, QueryList, ViewChildren } from '@angular/core';
import { ProfileService } from 'src/app/services/profile.service';
import { TweetService } from 'src/app/services/tweet.service';

@Component({
  selector: 'app-profile-dashboard',
  templateUrl: './profile-dashboard.component.html',
  styleUrls: ['./profile-dashboard.component.css']
})
export class ProfileDashboardComponent implements OnInit, AfterViewInit {
  profile: any = {};
  tweets: any[] = [];

  @ViewChildren('videoElement') videoElements!: QueryList<ElementRef>;

  constructor(private profileService: ProfileService, private tweetService: TweetService) {}

  ngOnInit(): void {
    this.loadProfile();
    this.loadUserTweets();
  }

  ngAfterViewInit(): void {
    this.setupIntersectionObserver();
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
        this.tweets = this.sortTweetsByDate(data);
      },
      error => {
        console.error('Error fetching tweets', error);
      }
    );
  }

  sortTweetsByDate(tweets: any[]): any[] {
    return tweets.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
  }

  setupIntersectionObserver(): void {
    const observer = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        const video: HTMLVideoElement = entry.target as HTMLVideoElement;
        if (entry.isIntersecting) {
          video.play();
        } else {
          video.pause();
        }
      });
    }, {
      threshold: 0.5
    });

    this.videoElements.changes.subscribe((videos: QueryList<ElementRef>) => {
      videos.forEach(videoElement => {
        observer.observe(videoElement.nativeElement);
      });
    });
  }

  toggleFollow(userId: string, isFollowing: boolean): void {
    if (isFollowing) {
      this.tweetService.unfollowUser(userId).subscribe(
        () => {
          this.loadUserTweets(); // Refresh the tweets list
        },
        error => {
          console.error('Error unfollowing user:', error);
        }
      );
    } else {
      this.tweetService.followUser(userId).subscribe(
        () => {
          this.loadUserTweets(); // Refresh the tweets list
        },
        error => {
          console.error('Error following user:', error);
        }
      );
    }
  }
}
