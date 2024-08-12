import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup } from '@angular/forms';
import { ProfileService } from 'src/app/services/profile.service';
import { AuthService } from 'src/app/services/auth.service';

@Component({
  selector: 'app-profile',
  templateUrl: './profile.component.html',
  styleUrls: ['./profile.component.css']
})
export class ProfileComponent implements OnInit {
  profileForm!: FormGroup;
  selectedProfilePicture: File | null = null;

  constructor(
    private fb: FormBuilder,
    private profileService: ProfileService,
    private authService: AuthService
  ) {}

  ngOnInit(): void {
    this.profileForm = this.fb.group({
      name: [''],
      bio: [''],
      website: [''],
      location: ['']
    });

    this.loadUserProfile();
  }

  loadUserProfile(): void {
    this.profileService.getProfile().subscribe(
      profile => {
        this.profileForm.patchValue(profile);
      },
      error => {
        console.error('Error loading profile:', error);
      }
    );
  }

  onFileChange(event: any): void {
    if (event.target.files && event.target.files.length) {
      this.selectedProfilePicture = event.target.files[0];
    }
  }

  onSubmit(): void {
    if (this.profileForm.valid) {
      // Update profile details
      this.profileService.updateProfile(this.profileForm.value).subscribe(
        response => {
          console.log('Profile updated successfully:', response);

          // If a new profile picture is selected, upload it
          if (this.selectedProfilePicture) {
            const formData = new FormData();
            formData.append('profilePicture', this.selectedProfilePicture);

            this.profileService.uploadProfilePicture(formData).subscribe(
              res => {
                console.log('Profile picture updated successfully:', res);
                this.selectedProfilePicture = null; // Clear the selected file
              },
              err => {
                console.error('Error uploading profile picture:', err);
              }
            );
          }
        },
        error => {
          console.error('Error updating profile:', error);
        }
      );
    }
  }
}
