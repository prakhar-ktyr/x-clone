import { Component, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { SearchService } from 'src/app/services/search.service';

@Component({
  selector: 'app-search-results',
  templateUrl: './search-results.component.html',
  styleUrls: ['./search-results.component.css']
})
export class SearchResultsComponent implements OnInit {
  searchQuery: string = '';
  tweets: any[] = [];

  constructor(private route: ActivatedRoute, private searchService: SearchService) { }

  ngOnInit(): void {
    this.route.queryParams.subscribe(params => {
      this.searchQuery = params['query'] || '';
      if (this.searchQuery) {
        this.searchTweets();
      }
    });
  }

  searchTweets(): void {
    this.searchService.searchTweets(this.searchQuery).subscribe(
      data => {
        this.tweets = data;
      },
      error => {
        console.error('Error searching tweets:', error);
      }
    );
  }
}
