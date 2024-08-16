import { Component, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { TweetService } from 'src/app/services/tweet.service';
import { CommentService } from 'src/app/services/comment.service'; // You need to create this service
import { AuthService } from 'src/app/services/auth.service';

@Component({
  selector: 'app-comment-view',
  templateUrl: './comment-view.component.html',
  styleUrls: ['./comment-view.component.css']
})
export class CommentViewComponent implements OnInit {
  tweet: any;
  comments: any[] = [];
  commentContent: string = '';

  constructor(
    private route: ActivatedRoute,
    private tweetService: TweetService,
    private commentService: CommentService, // Inject the comment service
    private authService: AuthService
  ) {}

  ngOnInit(): void {
    this.route.params.subscribe(params => {
      const tweetId = params['id']; // Get the tweet ID from the route
      this.loadTweet(tweetId);
      this.loadComments(tweetId);
    });
  }

  loadTweet(tweetId: string): void {
    this.tweetService.getTweetById(tweetId).subscribe(
      tweet => {
        this.tweet = tweet;
      },
      error => {
        console.error('Error loading tweet:', error);
      }
    );
  }

  loadComments(tweetId: string): void {
    this.commentService.getCommentsByTweetId(tweetId).subscribe(
      comments => {
        this.comments = comments;
      },
      error => {
        console.error('Error loading comments:', error);
      }
    );
  }

  postComment(): void {
    if (this.commentContent.trim()) {
      const newComment = {
        content: this.commentContent,
        author: this.authService.getUser().id
      };
  
      this.commentService.createComment(this.tweet._id, newComment).subscribe(
        comment => {
          this.comments.push(comment);
          this.commentContent = ''; // Clear the comment input
        },
        error => {
          console.error('Error posting comment:', error);
        }
      );
    }
  }  
}
