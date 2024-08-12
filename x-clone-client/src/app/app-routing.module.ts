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

const routes: Routes = [
  { path: '', component: LandingPageComponent, pathMatch: 'full' },
  { path: 'login', component: LoginComponent },
  { path: 'register', component: RegisterComponent },
  { path: 'profile-setup', component: ProfileSetupComponent, canActivate: [AuthGuard] },
  { path: 'profile-picture-upload', component: ProfilePictureUploadComponent, canActivate: [AuthGuard] },
  {
    path: '',
    component: DashboardLayoutComponent, // Layout with left/right panels
    children: [
      { path: 'home', component: HomeComponent }, // Home Page
      { path: 'profile', component: ProfileDashboardComponent }
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
