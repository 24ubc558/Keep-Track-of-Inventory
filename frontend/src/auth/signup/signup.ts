import { ChangeDetectionStrategy, ChangeDetectorRef, Component } from '@angular/core';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { AuthService } from '../../services/auth.service';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-signup',
  standalone:true,
   imports: [ReactiveFormsModule,CommonModule],
  templateUrl: './signup.html',
  styleUrls: ['./signup.css'],
   changeDetection: ChangeDetectionStrategy.Default
})
export class Signup {
 signupForm: FormGroup;
  isLoading = false;
  errorMessage = '';
  showPassword = false;

  constructor(
    private fb: FormBuilder,
    private authService: AuthService,
    private router: Router,
     private cd: ChangeDetectorRef
  ) {
    this.signupForm = this.fb.group({
      name: ['', [Validators.required, Validators.minLength(3)]],
      email: ['', [Validators.required, Validators.email]],
      password: ['', [Validators.required, Validators.minLength(6)]],
      role: ['CUSTOMER', Validators.required]
    });
  }

  onSubmit() {
    if (this.signupForm.invalid) {
      this.signupForm.markAllAsTouched();
      return;
    }

    // this.isLoading = true;

    console.log("Values",this.signupForm.value)

        this.authService.signup(this.signupForm.value).subscribe({
  next: (response: any) => {
    localStorage.setItem('token', response.token);
    this.isLoading = false;
    this.router.navigate([
      this.signupForm.value.role === 'OWNER' ? '/admin-dashboard' : '/dashboard'
    ]);
  },
 error: (error) => {
  this.isLoading = false;

console.log('Before setting:', this.errorMessage);
this.errorMessage = error.error?.message || 'Signup failed. Please try again.';
console.log('After setting:', this.errorMessage);


  this.cd.detectChanges();  // ✅ this will update HTML too!
},
  complete: () => {
    this.isLoading = false;
  }
});


  }


  login()
  {
    this.router.navigate(["/login"]);
  }

  togglePasswordVisibility() {
    this.showPassword = !this.showPassword;
  }
}