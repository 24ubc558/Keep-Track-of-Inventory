import { Component } from '@angular/core';
import { FormGroup, FormBuilder, Validators, ReactiveFormsModule } from '@angular/forms';
import { AuthService } from '../../services/auth.service';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';

@Component({
  selector: 'app-forgotpassword',
  imports: [ReactiveFormsModule,CommonModule,RouterModule],
  templateUrl: './forgotpassword.html',
  styleUrl: './forgotpassword.css'
})
export class Forgotpassword {
 resetEmailSent = false;
  forgotForm: FormGroup;
  btndisable=false;

  constructor(
    private fb: FormBuilder,
    private authService: AuthService
  ) {
    this.forgotForm = this.fb.group({
      email: ['', [Validators.required, Validators.email]]
    });
  }

 onSubmit() {
  // Mark all fields as touched to show validation errors
  this.forgotForm.markAllAsTouched();

  if (this.forgotForm.invalid) {
    // Optionally focus on the email field
    document.getElementById('email')?.focus();
    return;
  }

  this.btndisable = true; // Disable button immediately
  
  // In real implementation, uncomment the service call
  this.authService.sendPasswordResetEmail(this.forgotForm.value.email).subscribe({
      next: (res) => {
        console.log('Success:', res);
        alert('Password reset email sent successfully!');
      },
      error: (err) => {
        console.error('Error:', err);
        if (err.status === 400) {
          alert('Bad Request: Please enter a valid email');
        } else if (err.status === 401) {
          alert('Unauthorized: Please check your access permissions');
        } else {
          alert('Something went wrong, please try again later');
        }
      }
    });


}
}