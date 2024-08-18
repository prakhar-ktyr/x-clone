import { Component, OnInit } from '@angular/core';
import { AuthService } from 'src/app/services/auth.service';
import { Router } from '@angular/router';

@Component({
  selector: 'app-dashboard-layout',
  templateUrl: './dashboard-layout.component.html',
  styleUrls: ['./dashboard-layout.component.css']
})
export class DashboardLayoutComponent implements OnInit {
  searchQuery: string = ''; // Property to bind the search input

  constructor(private authService: AuthService, private router: Router) { }

  ngOnInit(): void {
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
}
