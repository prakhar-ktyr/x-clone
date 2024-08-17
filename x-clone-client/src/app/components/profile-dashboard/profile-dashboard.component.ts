import { Component, OnInit, AfterViewInit, ElementRef, QueryList, ViewChildren } from '@angular/core';
import { Router } from '@angular/router';
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
  retweets: any[] = [];
  selectedTab: string = 'tweets';

  @ViewChildren('videoElement') videoElements!: QueryList<ElementRef>;

  constructor(
    private profileService: ProfileService,
    private tweetService: TweetService,
    private router: Router
  ) {}

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

  loadUserRetweets(): void {
    this.tweetService.getRetweetsByUser().subscribe(
      data => {
        this.retweets = this.sortTweetsByDate(data);
      },
      error => {
        console.error('Error fetching retweets', error);
      }
    );
  }

  sortTweetsByDate(tweets: any[]): any[] {
    return tweets.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
  }

  selectTab(tab: string): void {
    this.selectedTab = tab;
    if (tab === 'retweets' && this.retweets.length === 0) {
      this.loadUserRetweets();
    }
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

  navigateToProfile(): void {
    this.router.navigate(['/profile/update']); // Navigate to the profile update page
  }
}
