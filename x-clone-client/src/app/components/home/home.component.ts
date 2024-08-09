import { Component, OnInit } from '@angular/core';

@Component({
  selector: 'app-home',
  templateUrl: './home.component.html',
  styleUrls: ['./home.component.css']
})
export class HomeComponent implements OnInit {
  tweetContent: string = '';
  maxCharacters: number = 280;
  charactersRemaining: number = this.maxCharacters;

  constructor() { }

  ngOnInit(): void {
    // Fetch tweets to display here
  }

  updateCharacterCount(): void {
    this.charactersRemaining = this.maxCharacters - this.tweetContent.length;
  }
}
