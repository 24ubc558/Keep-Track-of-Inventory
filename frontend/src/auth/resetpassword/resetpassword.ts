import { HttpClient } from '@angular/common/http';
import { Component } from '@angular/core';
import { FormGroup, FormBuilder, Validators, AbstractControl, ReactiveFormsModule } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { CommonModule } from '@angular/common';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatCardModule } from '@angular/material/card';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatTooltipModule } from '@angular/material/tooltip';
import { AuthService } from '../../services/auth.service';

interface ResetFormErrors {
  mismatch?: boolean;
}

@Component({
  selector: 'app-resetpassword',
  standalone: true,
  imports: [
    CommonModule,
    MatFormFieldModule,
    MatInputModule,
    MatButtonModule,
    MatIconModule,
    MatCardModule,
    MatSnackBarModule,
    MatProgressSpinnerModule,
    MatTooltipModule,
    ReactiveFormsModule,
  ],
  templateUrl: './resetpassword.html',
  styleUrl: './resetpassword.css'
})
export class Resetpassword {
  resetForm: FormGroup;
  isLoading = false;
  hidePassword = true;
  hideConfirmPassword = true;
  passwordStrength = 0;
  showRegisterLink = true; // Set based on your application requirements
  parsedEmail=''

  constructor(
    private fb: FormBuilder,
    private http: HttpClient,
    private snackBar: MatSnackBar,
    private router: Router,
    private route: ActivatedRoute,
    private authservice:AuthService
  ) {


    this.resetForm = this.fb.group({
      email: ['', [Validators.required, Validators.email]],
      newPassword: ['', [Validators.required, Validators.minLength(8)]],
      confirmPassword: ['', Validators.required]
    }, { validators: this.passwordMatchValidator });
  }

  ngOninit()
  {
    this.route.queryParams.subscribe(params => {
    this.parsedEmail = params['email'];
  });
  }

  passwordMatchValidator(form: AbstractControl): ResetFormErrors | null {
    const password = form.get('newPassword')?.value;
    const confirmPassword = form.get('confirmPassword')?.value;
    return password === confirmPassword ? null : { mismatch: true };
  }

  checkPasswordStrength(): void {
    const password = this.resetForm.get('newPassword')?.value;
    if (!password) {
      this.passwordStrength = 0;
      return;
    }

    let strength = 0;
    
    // Length check
    if (password.length >= 8) strength++;
    if (password.length >= 12) strength++;
    
    // Complexity checks
    if (/[A-Z]/.test(password)) strength++; // Uppercase letter
    if (/[0-9]/.test(password)) strength++; // Number
    if (/[^A-Za-z0-9]/.test(password)) strength++; // Special char
    
    // Cap at 4 for our meter
    this.passwordStrength = Math.min(strength, 4);
  }

  getPasswordStrengthText(): string {
    switch (this.passwordStrength) {
      case 0: return 'Very Weak';
      case 1: return 'Weak';
      case 2: return 'Moderate';
      case 3: return 'Strong';
      case 4: return 'Very Strong';
      default: return '';
    }
  }

 onSubmit() {
  if (this.resetForm.invalid) {
    return;
  }

  this.isLoading = true;
  const payload = {
    email: this.resetForm.value.email,
    newPassword: this.resetForm.value.newPassword
  };

  
   this.authservice.Resetpassword(payload).subscribe({
      next: (res:any) => {
        this.isLoading = false;

        alert(res.message || 'Password reset successfully! Redirecting to login...')


        

        this.resetForm.reset();

        setTimeout(() => this.router.navigate(['/login']), 3000);
      },
      error: (err:any) => {
        this.isLoading = false;
        alert(err.error?.message ||'Failed to reset password. Please try again.');

      
      }
    });
}
}