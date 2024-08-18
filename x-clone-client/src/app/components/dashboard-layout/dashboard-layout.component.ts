import { Component, OnInit } from '@angular/core';
import { AuthService } from 'src/app/services/auth.service';
import { Router } from '@angular/router';
import { HashtagService } from 'src/app/services/hashtag.service';  // Import the HashtagService

@Component({
  selector: 'app-dashboard-layout',
  templateUrl: './dashboard-layout.component.html',
  styleUrls: ['./dashboard-layout.component.css']
})
export class DashboardLayoutComponent implements OnInit {
  searchQuery: string = ''; // Property to bind the search input
  trendingHashtags: any[] = []; // Array to store trending hashtags

  constructor(
    private authService: AuthService,
    private router: Router,
    private hashtagService: HashtagService // Inject HashtagService
  ) {}

  ngOnInit(): void {
    this.fetchTrendingHashtags(); // Fetch trending hashtags on initialization
  }

  onLogout(): void {
    this.authService.logout(); // Log the user out
    this.router.navigate(['']); // Redirect to the landing page
  }

  onSearch(): void {
    if (this.searchQuery.trim()) {
      // Navigate to the search results page with the search query
      this.router.navigate(['/search'], { queryParams: { query: this.searchQuery } });
    }
  }

  fetchTrendingHashtags(): void {
    this.hashtagService.getTrendingHashtags().subscribe(
      (data) => {
        this.trendingHashtags = data;
      },
      (error) => {
        console.error('Error fetching trending hashtags', error);
      }
    );
  }
}
