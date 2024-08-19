import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { AuthService } from 'src/app/services/auth.service';

@Component({
  selector: 'app-register',
  templateUrl: './register.component.html',
  styleUrls: ['./register.component.css']
})
export class RegisterComponent implements OnInit {
  registerForm!: FormGroup;
  errorMessage: string | null = null;

  constructor(private fb: FormBuilder, private authService: AuthService, private router: Router) {}

  ngOnInit(): void {
    this.registerForm = this.fb.group({
      name: ['', Validators.required],
      email: ['', [Validators.required, Validators.email]],
      handle: ['', Validators.required],
      password: ['', Validators.required]
    });
  }

  onSubmit(): void {
    if (this.registerForm.valid) {
      this.authService.register(this.registerForm.value).subscribe(
        response => {
          console.log('User registered successfully:', response);
          this.authService.login(this.registerForm.value).subscribe(
            loginResponse => {
              console.log('User logged in successfully:', loginResponse);
              this.router.navigate(['/profile-setup']); // Navigate to profile setup page after login
            },
            loginError => {
              console.error('Error logging in:', loginError);
              // Handle login error
              this.errorMessage = 'An error occurred during login. Please try again.';
            }
          );
        },
        error => {
          console.error('Error registering user:', error);
          // Display the error message from the backend if email or handle already exists
          if (error.status === 400) {
            this.errorMessage = error.error.message;
          } else {
            this.errorMessage = 'An error occurred during registration. Please try again.';
          }
        }
      );
    }
  }  
}
