import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup } from '@angular/forms';
import { ProfileService } from 'src/app/services/profile.service';
import { AuthService } from 'src/app/services/auth.service';

@Component({
  selector: 'app-profile-update',
  templateUrl: './profile.component.html',
  styleUrls: ['./profile.component.css']
})
export class ProfileComponent implements OnInit {
  profileForm!: FormGroup;

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

  onSubmit(): void {
    if (this.profileForm.valid) {
      this.profileService.updateProfile(this.profileForm.value).subscribe(
        response => {
          console.log('Profile updated successfully:', response);
        },
        error => {
          console.error('Error updating profile:', error);
        }
      );
    }
  }
}
