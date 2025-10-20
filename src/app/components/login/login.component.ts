import { Component } from '@angular/core';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { AuthService } from '../../services/auth.service';
import { MatSnackBar } from '@angular/material/snack-bar';

// Angular Material imports
import { MatCardModule } from '@angular/material/card';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    MatCardModule,
    MatFormFieldModule,
    MatInputModule,
    MatButtonModule,
    MatIconModule
  ],
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.css']
})
export class LoginComponent {
  loginForm: FormGroup;
  isLoading = false;
  isRegistering = false;

  constructor(
    private fb: FormBuilder,
    private authService: AuthService,
    private router: Router, // ← MAKE SURE THIS IS INJECTED
    private snackBar: MatSnackBar
  ) {
    this.loginForm = this.fb.group({
      email: ['', [Validators.required, Validators.email]],
      password: ['', [Validators.required, Validators.minLength(6)]],
      username: ['']
    });
  }

  toggleMode(): void {
    this.isRegistering = !this.isRegistering;
    const usernameControl = this.loginForm.get('username');
    if (this.isRegistering) {
      usernameControl?.setValidators([Validators.required]);
    } else {
      usernameControl?.clearValidators();
    }
    usernameControl?.updateValueAndValidity();
  }

  onSubmit(): void {
    if (this.loginForm.valid) {
      this.isLoading = true;
      const { email, password, username } = this.loginForm.value;

      const authObservable = this.isRegistering 
        ? this.authService.register(username, email, password)
        : this.authService.login(email, password);

       authObservable.subscribe({
       next: (admin) => {
      if (this.isRegistering) {
      this.snackBar.open('Registration successful! Please login.', 'Close', { duration: 3000 });
      this.toggleMode();
    } else {
      this.snackBar.open('Login successful!', 'Close', { duration: 3000 });
    }
    this.isLoading = false;
  },
error: (error) => {
  console.log('Full error object:', error);
  console.log('Error status:', error.status);
  console.log('Error response:', error.error);
  
  // ADD THIS - Extract the actual backend error message
  const backendError = error.error;
  console.log('Backend error details:', backendError);
  
  // Show the specific backend error message
  const errorMessage = backendError?.message || backendError?.error || 'Invalid credentials or request format';
  this.snackBar.open(errorMessage, 'Close', { duration: 5000 });
  this.isLoading = false;
}
});
    }
  }
}