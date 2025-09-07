import { Router } from '@angular/router';
import { Component } from '@angular/core';
import { FormBuilder, Validators } from '@angular/forms';
import { AuthService } from '../../services/auth.service';
import { ReactiveFormsModule } from '@angular/forms';
@Component({
  selector: 'app-login',
  imports: [ReactiveFormsModule],
  templateUrl: './login.html',
  styleUrls: ['./login.css']
})
export class Login {
loginForm:any;

constructor(private fb: FormBuilder, private authService: AuthService, private router: Router) {

   this.loginForm = this.fb.group({
    email: ['', Validators.required],
    password: ['', Validators.required],
  });
}


navigateToForgotPassword() {
  this.router.navigate(['/forgotpassword']);
}

navigateToSignup() {
  this.router.navigate(['/signup']);
}



  onSubmit() {
  // Mark all fields as touched to trigger validation messages
  this.loginForm.markAllAsTouched();

  if (this.loginForm.valid) {
    // this.isLoading = true; // Show loading state
    
    this.authService.login(this.loginForm.value).subscribe({
      next: (res: any) => {
        localStorage.setItem('token', res.token);
         localStorage.setItem('role', res.role);
         const email = this.loginForm.get('email')?.value;
         localStorage.setItem('Email',email)
         localStorage.setItem('Id',res.name)


        
          if(res.role =="ADMIN")
         {
          this.router.navigate(['/admin-dashboard']);
         }
          else if(res.role =="CUSTOMER")
         {
        this.router.navigate(['/dashboard']);
         }
      },
      error: (error) => {

        console.log("___---->",error)
        // this.isLoading = false;
        // Specific error messages based on status code
        if (error.status === 401) {
          this.loginForm.setErrors({ invalidCredentials: true });
          alert('Invalid email or password');
        } else if (error.status === 0) {
          alert('Network error - please check your connection');
        } else {
          alert('Login failed. Please try again later.');
        }
      },
      complete: () => {
        // this.isLoading = false;
      }
    });
  } else {
    // Handle specific field errors
    if (this.loginForm.get('email')?.errors?.['required']) {
      alert('Email is required');
    } else if (this.loginForm.get('email')?.errors?.['email']) {
      alert('Please enter a valid email address');
    } else if (this.loginForm.get('password')?.errors?.['required']) {
      alert('Password is required');
    }
  }
}
}