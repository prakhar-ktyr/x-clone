import { Component, OnInit, AfterViewInit, ElementRef, QueryList, ViewChildren, HostListener } from '@angular/core';
import { TweetService } from 'src/app/services/tweet.service';
import { AuthService } from 'src/app/services/auth.service';
import { Router } from '@angular/router';
import { DomSanitizer, SafeHtml } from '@angular/platform-browser';

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
  page: number = 1; // Start from page 1
  limit: number = 15; // Load 15 tweets per page
  loading: boolean = false; // To prevent multiple simultaneous requests
  followingTweets: any[] = []; // To store tweets from followed users
  loadingFollowing: boolean = false; // To manage the loading state

  @ViewChildren('videoElement') videoElements!: QueryList<ElementRef>;

  constructor(
    private tweetService: TweetService,
    private authService: AuthService,
    private router: Router,
    private sanitizer: DomSanitizer
  ) {}

  ngOnInit(): void {
    this.fetchTweets();
    this.fetchFollowingTweets();
  }

  ngAfterViewInit(): void {
    this.setupIntersectionObserver();
  }

transformHashtags(content: string): SafeHtml {
  const hashtagRegex = /#(\w+)/g;
  const transformedContent = content.replace(hashtagRegex, (match) => {
    const hashtag = match.slice(1);
    return `<a href="/search?query=%23${hashtag}" style="color: #1DA1F2; text-decoration: none;">${match}</a>`;
  });
  return this.sanitizer.bypassSecurityTrustHtml(transformedContent);
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
          this.page = 1; // Reset to page 1
          this.tweets = []; // Clear tweets array
          this.fetchTweets(); // Reload tweets from the beginning
        },
        error => {
          console.error('Error creating tweet:', error);
        }
      );
    }
  }

  fetchTweets(): void {
    if (this.loading) return;
    this.loading = true;
  
    this.tweetService.getTweets(this.page, this.limit).subscribe(
      tweets => {
        // Append new tweets to the list
        console.log(tweets);
        this.tweets = this.tweets.concat(tweets);
        this.loading = false;
      },
      error => {
        console.error('Error fetching tweets:', error);
        this.loading = false;
      }
    );
  }  

  fetchFollowingTweets(): void {
    if (this.loadingFollowing) return;
    this.loadingFollowing = true;
  
    this.tweetService.getTweetsFromFollowing(this.page, this.limit).subscribe(
      (tweets) => {
        this.followingTweets = this.followingTweets.concat(tweets);
        this.loadingFollowing = false;
      },
      (error) => {
        console.error('Error fetching following tweets:', error);
        this.loadingFollowing = false;
      }
    );
  }
  

  // Load more tweets when scrolling to the bottom
  @HostListener('window:scroll', [])
  onScroll(): void {
    if (window.innerHeight + window.scrollY >= document.body.scrollHeight - 100 && !this.loading) {
      this.page++;
      this.fetchTweets();
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
    }, { threshold: 0.5 });

    this.videoElements.changes.subscribe((videos: QueryList<ElementRef>) => {
      videos.forEach(videoElement => {
        observer.observe(videoElement.nativeElement);
      });
    });
  }

  navigateToCommentView(tweetId: string): void {
    this.router.navigate(['/comment-view', tweetId]);
  }

  toggleFollow(userId: string, isFollowing: boolean): void {
    if (isFollowing) {
      this.tweetService.unfollowUser(userId).subscribe(
        () => {
          this.page = 1; // Reset to page 1
          this.tweets = []; // Clear tweets array
          this.fetchTweets(); // Reload tweets from the beginning
        },
        error => {
          console.error('Error unfollowing user:', error);
        }
      );
    } else {
      this.tweetService.followUser(userId).subscribe(
        () => {
          this.page = 1; // Reset to page 1
          this.tweets = []; // Clear tweets array
          this.fetchTweets(); // Reload tweets from the beginning
        },
        (error) => {
          console.error('Error following user:', error);
        }
      );
    }
  }

  toggleLike(tweet: any): void {
    if (tweet.isLiked) {
      this.tweetService.unlikeTweet(tweet._id).subscribe(
        (response: any) => {
          tweet.isLiked = false;
          tweet.likes = response.tweet.likes;  // Update the likes count from the response
        },
        (error) => {
          console.error('Error unliking tweet:', error);
        }
      );
    } else {
      this.tweetService.likeTweet(tweet._id).subscribe(
        (response: any) => {
          tweet.isLiked = true;
          tweet.likes = response.tweet.likes;  // Update the likes count from the response
        },
        error => {
          if (error.status === 400 && error.error.message === 'Tweet already liked') {
            tweet.isLiked = true; // Ensure the UI reflects the correct state
            console.warn('Tweet was already liked.');
          } else {
            console.error('Error liking tweet:', error);
          }
        }
      );
    }
  }

  toggleBookmark(tweet: any): void {
    if (tweet.isBookmarked) {
      this.tweetService.unbookmarkTweet(tweet._id).subscribe(
        (response: any) => {
          tweet.isBookmarked = false;
        },
        error => {
          console.error('Error unbookmarking tweet:', error);
        }
      );
    } else {
      this.tweetService.bookmarkTweet(tweet._id).subscribe(
        (response: any) => {
          tweet.isBookmarked = true;
        },
        error => {
          if (error.status === 400 && error.error.message === 'Tweet already bookmarked') {
            tweet.isBookmarked = true; // Ensure the UI reflects the correct state
            console.warn('Tweet was already bookmarked.');
          } else {
            console.error('Error bookmarking tweet:', error);
          }
        }
      );
    }
  }

  toggleRetweet(tweet: any): void {
    if (tweet.isRetweeted) {
      this.tweetService.unretweetTweet(tweet._id).subscribe(
        (response: any) => {
          tweet.isRetweeted = false;
          tweet.retweets = response.tweet.retweets;  // Update the retweets count from the response
        },
        error => {
          console.error('Error unretweeting tweet:', error);
        }
      );
    } else {
      this.tweetService.retweetTweet(tweet._id).subscribe(
        (response: any) => {
          tweet.isRetweeted = true;
          tweet.retweets = response.tweet.retweets;  // Update the retweets count from the response
        },
        error => {
          if (error.status === 400 && error.error.message === 'Tweet already retweeted') {
            tweet.isRetweeted = true; // Ensure the UI reflects the correct state
            console.warn('Tweet was already retweeted.');
          } else {
            console.error('Error retweeting tweet:', error);
          }
        }
      );
    }
  }

  navigateToUserProfile(userId: string): void {
    this.router.navigate(['/profile-view', userId]);
  }
}
