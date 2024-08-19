import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { AuthService } from 'src/app/services/auth.service';

@Component({
  selector: 'app-login',
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.css']
})
export class LoginComponent implements OnInit {
  loginForm!: FormGroup;
  errorMessage: string | null = null;  // Add this property

  constructor(private fb: FormBuilder, private authService: AuthService, private router: Router) {}

  ngOnInit(): void {
    this.loginForm = this.fb.group({
      email: ['', [Validators.required, Validators.email]],
      password: ['', Validators.required]
    });
  }

  onSubmit(): void {
    if (this.loginForm.valid) {
      this.authService.login(this.loginForm.value).subscribe(
        response => {
          console.log('User logged in successfully:', response);
          this.router.navigate(['/home']); // Navigate to home page after login
        },
        error => {
          console.error('Error logging in:', error);
          // Set the error message to be displayed in the UI
          if (error.status === 400) {
            this.errorMessage = 'Invalid credentials';
          } else {
            this.errorMessage = 'An error occurred during login. Please try again.';
          }
        }
      );
    }
  }
}
