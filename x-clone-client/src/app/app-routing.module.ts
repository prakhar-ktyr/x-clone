import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { LoginComponent } from './components/auth/login/login.component';
import { RegisterComponent } from './components/auth/register/register.component';
import { AuthGuard } from './guards/auth.guard';
import { LandingPageComponent } from './components/landing-page/landing-page.component';
import { HomeComponent } from './components/home/home.component';
import { ProfileSetupComponent } from './components/profile-setup/profile-setup.component';
import { ProfilePictureUploadComponent } from './components/profile-picture-upload/profile-picture-upload.component';
import { DashboardLayoutComponent } from './components/dashboard-layout/dashboard-layout.component';
import { ProfileDashboardComponent } from './components/profile-dashboard/profile-dashboard.component';
import { ProfileComponent } from './components/profile/profile.component';  // Import ProfileComponent
import { ProfileViewComponent } from './components/profile-view/profile-view.component';
import { MessagesComponent } from './components/messages/messages.component';
import { CommentViewComponent } from './components/comment-view/comment-view.component';
import { BookmarksComponent } from './components/bookmarks/bookmarks.component';
import { NotificationsComponent } from './components/notifications/notifications.component';
import { SearchResultsComponent } from './components/search-results/search-results.component';

const routes: Routes = [
  { path: '', component: LandingPageComponent, pathMatch: 'full' },
  { path: 'login', component: LoginComponent },
  { path: 'register', component: RegisterComponent },
  { path: 'profile-setup', component: ProfileSetupComponent, canActivate: [AuthGuard] },
  { path: 'profile-picture-upload', component: ProfilePictureUploadComponent, canActivate: [AuthGuard] },
  {
    path: '',
    component: DashboardLayoutComponent, // Layout with left/right panels
    canActivate: [AuthGuard], // Protecting dashboard routes with AuthGuard
    children: [
      { path: 'home', component: HomeComponent }, // Home Page
      { path: 'profile', component: ProfileDashboardComponent },
      { path: 'bookmarks', component: BookmarksComponent },
      { path: 'profile/update', component: ProfileComponent }, // Profile Update
      { path: 'profile-view/:id', component: ProfileViewComponent },
      { path: 'messages', component: MessagesComponent },
      { path: 'comment-view/:id', component: CommentViewComponent },
      { path: 'notifications', component: NotificationsComponent },
      { path: 'search', component: SearchResultsComponent }
      // Add more routes as needed
    ],
  },
  { path: '**', redirectTo: '' }, // Redirect for unmatched routes
];

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule]
})
export class AppRoutingModule { }
