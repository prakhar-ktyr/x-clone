import { Component, OnInit, AfterViewInit, ElementRef, QueryList, ViewChildren } from '@angular/core';
import { Router } from '@angular/router';
import { ProfileService } from 'src/app/services/profile.service';
import { TweetService } from 'src/app/services/tweet.service';

@Component({
  selector: 'app-profile-view',
  templateUrl: './profile-view.component.html',
  styleUrls: ['./profile-view.component.css']
})
export class ProfileViewComponent implements OnInit, AfterViewInit {
  profile: any = {};
  tweets: any[] = [];

  @ViewChildren('videoElement') videoElements!: QueryList<ElementRef>;

  constructor(
    private profileService: ProfileService,
    private tweetService: TweetService,
    private router: Router
  ) {}

  ngOnInit(): void {
    this.loadProfileAndTweets();
  }

  ngAfterViewInit(): void {
    this.setupIntersectionObserver();
  }

  loadProfileAndTweets(): void {
    const userId = this.router.url.split('/').pop(); // Extract userId from URL

    if (userId) {
      this.profileService.getUserProfile(userId).subscribe(
        data => {
          this.profile = data;
        },
        error => {
          console.error('Error fetching profile', error);
        }
      );

      this.tweetService.getTweetsByUserId(userId).subscribe(
        data => {
          this.tweets = this.sortTweetsByDate(data);
        },
        error => {
          console.error('Error fetching tweets', error);
        }
      );
    }
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

  startChat(userId: string): void {
    this.router.navigate(['/messages', { userId }]);
  }
}
