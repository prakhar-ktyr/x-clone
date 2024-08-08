import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup } from '@angular/forms';
import { Router } from '@angular/router';
import { ProfileService } from 'src/app/services/profile.service';

@Component({
  selector: 'app-profile-setup',
  templateUrl: './profile-setup.component.html',
  styleUrls: ['./profile-setup.component.css']
})
export class ProfileSetupComponent implements OnInit {
  profileSetupForm!: FormGroup;

  constructor(
    private fb: FormBuilder,
    private profileService: ProfileService,
    private router: Router
  ) {}

  ngOnInit(): void {
    this.profileSetupForm = this.fb.group({
      bio: [''],
      website: [''],
      location: ['']
    });
  }

  onSubmit(): void {
    if (this.profileSetupForm.valid) {
      this.profileService.updateProfile(this.profileSetupForm.value).subscribe(
        response => {
          console.log('Profile updated successfully:', response);
          this.router.navigate(['/profile-picture-upload']); // Navigate to home page after profile setup
        },
        error => {
          console.error('Error updating profile:', error);
          // Handle profile update error
        }
      );
    }
  }
}
