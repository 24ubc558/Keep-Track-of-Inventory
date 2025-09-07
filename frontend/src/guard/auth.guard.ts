import { Injectable } from '@angular/core';
import { CanActivate, Router } from '@angular/router';
import { AuthService } from '../services/auth.service';

@Injectable({ providedIn: 'root' })
export class AuthGuard implements CanActivate {
  constructor(private auth: AuthService, private router: Router) {}

  canActivate(): boolean {
  console.log("🔒 AuthGuard called");

  const loggedIn = this.auth.isLoggedIn();
  console.log("🔐 isLoggedIn:", loggedIn);

  if (!loggedIn) {
    this.router.navigate(['/login']);
    return false;
  }
  return true;
} 

}
