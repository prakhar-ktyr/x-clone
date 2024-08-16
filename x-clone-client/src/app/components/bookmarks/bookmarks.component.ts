import { Component, OnInit } from '@angular/core';
import { TweetService } from 'src/app/services/tweet.service';
import { AuthService } from 'src/app/services/auth.service';
import { Router } from '@angular/router';

@Component({
  selector: 'app-bookmarks',
  templateUrl: './bookmarks.component.html',
  styleUrls: ['./bookmarks.component.css']
})
export class BookmarksComponent implements OnInit {
  bookmarkedTweets: any[] = [];

  constructor(
    private tweetService: TweetService,
    private authService: AuthService,
    private router: Router
  ) {}

  ngOnInit(): void {
    this.fetchBookmarkedTweets();
  }

  fetchBookmarkedTweets(): void {
    this.tweetService.getBookmarkedTweets().subscribe(
      tweets => {
        this.bookmarkedTweets = tweets;
      },
      error => {
        console.error('Error fetching bookmarked tweets:', error);
      }
    );
  }

  navigateToCommentView(tweetId: string): void {
    this.router.navigate(['/comment-view', tweetId]);
  }

  toggleFollow(userId: string, isFollowing: boolean): void {
    if (isFollowing) {
      this.tweetService.unfollowUser(userId).subscribe(
        () => {
          this.fetchBookmarkedTweets(); // Refresh the list after following/unfollowing
        },
        error => {
          console.error('Error unfollowing user:', error);
        }
      );
    } else {
      this.tweetService.followUser(userId).subscribe(
        () => {
          this.fetchBookmarkedTweets(); // Refresh the list after following/unfollowing
        },
        error => {
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
          tweet.likes = response.tweet.likes;
        },
        error => {
          console.error('Error unliking tweet:', error);
        }
      );
    } else {
      this.tweetService.likeTweet(tweet._id).subscribe(
        (response: any) => {
          tweet.isLiked = true;
          tweet.likes = response.tweet.likes;
        },
        error => {
          if (error.status === 400 && error.error.message === 'Tweet already liked') {
            tweet.isLiked = true;
            console.warn('Tweet was already liked.');
          } else {
            console.error('Error liking tweet:', error);
          }
        }
      );
    }
  }

  navigateToUserProfile(userId: string): void {
    this.router.navigate(['/profile-view', userId]);
  }
}
