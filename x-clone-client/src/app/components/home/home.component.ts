import { Component, OnInit } from '@angular/core';
import { TweetService } from 'src/app/services/tweet.service'; // Assuming you have a Tweet service
import { AuthService } from 'src/app/services/auth.service'; // Assuming you have an Auth service

@Component({
  selector: 'app-home',
  templateUrl: './home.component.html',
  styleUrls: ['./home.component.css']
})
export class HomeComponent implements OnInit {
  tweetContent: string = '';
  maxCharacters: number = 280;
  charactersRemaining: number = this.maxCharacters;

  constructor(private tweetService: TweetService, private authService: AuthService) { }

  ngOnInit(): void {
    // Fetch tweets to display here
  }

  updateCharacterCount(): void {
    this.charactersRemaining = this.maxCharacters - this.tweetContent.length;
  }

  onTweet(): void {
    if (this.tweetContent.trim() && this.charactersRemaining >= 0) {
      this.tweetService.createTweet({ content: this.tweetContent }).subscribe(
        response => {
          console.log('Tweet created:', response);
          this.tweetContent = ''; // Clear the textarea after posting
          this.updateCharacterCount(); // Reset the character count
          // Optionally, you can refresh the tweets list or add the new tweet to the list
        },
        error => {
          console.error('Error creating tweet:', error);
        }
      );
    }
  }
}
