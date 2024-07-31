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

  constructor(private fb: FormBuilder, private authService: AuthService, private router: Router) {}

  ngOnInit(): void {
    this.registerForm = this.fb.group({
      name: ['', Validators.required],
      email: ['', [Validators.required, Validators.email]],
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
              this.router.navigate(['/']); // Navigate to home page or dashboard after login
            },
            loginError => {
              console.error('Error logging in:', loginError);
              // Handle login error
            }
          );
        },
        error => {
          console.error('Error registering user:', error);
          // Handle registration error
        }
      );
    }
  }
}
