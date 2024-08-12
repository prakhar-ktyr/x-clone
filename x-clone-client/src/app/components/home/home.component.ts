import { Component, OnInit, AfterViewInit, ElementRef, QueryList, ViewChildren } from '@angular/core';
import { TweetService } from 'src/app/services/tweet.service';
import { AuthService } from 'src/app/services/auth.service';
import { Router } from '@angular/router';

@Component({
  selector: 'app-home',
  templateUrl: './home.component.html',
  styleUrls: ['./home.component.css']
})
export class HomeComponent implements OnInit, AfterViewInit {
  tweetContent: string = '';
  maxCharacters: number = 280;
  charactersRemaining: number = this.maxCharacters;
  selectedImages: File[] = [];
  selectedVideo: File | null = null;
  tweets: any[] = [];

  @ViewChildren('videoElement') videoElements!: QueryList<ElementRef>;

  constructor(private tweetService: TweetService, private authService: AuthService, private router: Router,) {}

  ngOnInit(): void {
    this.fetchTweets();
  }

  ngAfterViewInit(): void {
    this.setupIntersectionObserver();
  }

  updateCharacterCount(): void {
    this.charactersRemaining = this.maxCharacters - this.tweetContent.length;
  }

  onFileChange(event: any, fileType: string): void {
    if (fileType === 'images') {
      this.selectedImages = Array.from(event.target.files);
    } else if (fileType === 'video') {
      this.selectedVideo = event.target.files[0];
    }
  }

  onTweet(): void {
    if (this.tweetContent.trim() && this.charactersRemaining >= 0) {
      const formData = new FormData();
      formData.append('content', this.tweetContent);

      this.selectedImages.forEach((image) => {
        formData.append('images', image, image.name);
      });

      if (this.selectedVideo) {
        formData.append('video', this.selectedVideo, this.selectedVideo.name);
      }

      this.tweetService.createTweet(formData).subscribe(
        response => {
          this.tweetContent = '';
          this.selectedImages = [];
          this.selectedVideo = null;
          this.updateCharacterCount();
          this.fetchTweets();
        },
        error => {
          console.error('Error creating tweet:', error);
        }
      );
    }
  }

  fetchTweets(): void {
    this.tweetService.getTweets().subscribe(
      tweets => {
        this.tweets = this.sortTweets(tweets);
      },
      error => {
        console.error('Error fetching tweets:', error);
      }
    );
  }

  sortTweets(tweets: any[]): any[] {
    return tweets.sort((a, b) => this.calculateTweetScore(b) - this.calculateTweetScore(a));
  }

  calculateTweetScore(tweet: any): number {
    const likesScore = tweet.likes.length * 5;
    const commentsScore = tweet.comments.length * 10;
    const timeSinceCreated = (Date.now() - new Date(tweet.createdAt).getTime()) / (1000 * 60);
    const recencyScore = timeSinceCreated < 1440 ? 1000 - timeSinceCreated : 0;

    return likesScore + commentsScore + recencyScore;
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
          this.fetchTweets(); // Refresh the tweets list
        },
        error => {
          console.error('Error unfollowing user:', error);
        }
      );
    } else {
      this.tweetService.followUser(userId).subscribe(
        () => {
          this.fetchTweets(); // Refresh the tweets list
        },
        error => {
          console.error('Error following user:', error);
        }
      );
    }
  }
  navigateToUserProfile(userId: string): void {
    this.router.navigate(['/profile-view', userId]);
  }
}
