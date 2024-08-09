import { Component } from '@angular/core';
import { Router } from '@angular/router';
import { ProfileService } from 'src/app/services/profile.service';
import { AuthService } from 'src/app/services/auth.service';

@Component({
  selector: 'app-profile-picture-upload',
  templateUrl: './profile-picture-upload.component.html',
  styleUrls: ['./profile-picture-upload.component.css']
})
export class ProfilePictureUploadComponent {
  selectedFile: File | null = null;

  constructor(
    private profileService: ProfileService,
    private authService: AuthService,
    private router: Router
  ) {}

  onFileSelected(event: any): void {
    this.selectedFile = event.target.files[0];
    if (this.selectedFile) {
      const formData = new FormData();
      formData.append('profilePicture', this.selectedFile);

      this.profileService.uploadProfilePicture(formData).subscribe(
        response => {
          console.log('Profile picture uploaded successfully:', response);
          this.router.navigate(['/home']);
        },
        error => {
          console.error('Error uploading profile picture:', error);
        }
      );
    }
  }

  onSkip(): void {
    const user = this.authService.getUser();
    if (user) {
      this.router.navigate(['/home']);
    }
  }
}
