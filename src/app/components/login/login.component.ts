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

  // 👁️ Password visibility
  hidePassword = true;

  constructor(
    private fb: FormBuilder,
    private authService: AuthService,
    private router: Router,
    private snackBar: MatSnackBar
  ) {
    this.loginForm = this.fb.group({
      username: ['', []],
      email: ['', []],
      password: ['', [Validators.required, Validators.minLength(6)]]
    });
  }

  // 👁️ Toggle password visibility
  togglePasswordVisibility(): void {
    this.hidePassword = !this.hidePassword;
  }

  toggleMode(): void {
  this.isRegistering = !this.isRegistering;

  // ✅ RESET FORM when switching modes
  this.loginForm.reset();

  const usernameControl = this.loginForm.get('username');
  const emailControl = this.loginForm.get('email');

  if (this.isRegistering) {
    // Registration mode
    usernameControl?.setValidators([Validators.required]);
    emailControl?.setValidators([Validators.required, Validators.email]);
  } else {
    // Login mode
    usernameControl?.setValidators([Validators.required]);
    emailControl?.clearValidators();
  }

  usernameControl?.updateValueAndValidity();
  emailControl?.updateValueAndValidity();
}


  onSubmit(): void {
    if (this.loginForm.invalid) {
      this.loginForm.markAllAsTouched();
      return;
    }

    this.isLoading = true;

    const { username, email, password } = this.loginForm.value;

    const authObservable = this.isRegistering
      ? this.authService.register(username, email, password)   // REGISTER
      : this.authService.login(username, password);            // LOGIN (USERNAME!)

    authObservable.subscribe({
      next: () => {
        if (this.isRegistering) {
          this.snackBar.open(
            'Registration successful! Please login.',
            'Close',
            { duration: 3000 }
          );
          this.toggleMode();
          this.loginForm.reset();
        } else {
          this.snackBar.open(
            'Login successful!',
            'Close',
            { duration: 3000 }
          );
        }
        this.isLoading = false;
      },
      error: (error) => {
        const backendError = error?.error;
        const errorMessage =
          backendError?.message ||
          backendError?.error ||
          'Invalid username or password';

        this.snackBar.open(errorMessage, 'Close', { duration: 5000 });
        this.isLoading = false;
      }
    });
  }
}
