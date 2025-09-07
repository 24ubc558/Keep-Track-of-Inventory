import { Component, EventEmitter, Output } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatToolbarModule } from '@angular/material/toolbar';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';
import { MatMenuModule } from '@angular/material/menu';
import { MatBadgeModule } from '@angular/material/badge';
import { MatDivider } from "@angular/material/divider";
import { MatSlideToggleModule } from '@angular/material/slide-toggle';
import { Router } from '@angular/router';

@Component({
  selector: 'app-header',
  standalone: true,
  imports: [
    CommonModule,
    MatToolbarModule,
    MatIconModule,
    MatButtonModule,
    MatMenuModule,
    MatBadgeModule,
    MatDivider,
     MatSlideToggleModule
],
  templateUrl: './header.html',
  styleUrls: ['./header.css']
})
export class Header {
 @Output() toggleSideNav = new EventEmitter<void>();
  notificationsCount = 5;
userProfile:any
 email:any

 constructor(private router:Router)
 {
     this.email=localStorage.getItem('Email')||'User name'
       if (!this.email || !this.email.includes('@')) {
    throw new Error('Invalid email format');
  }

  const namePart = localStorage.getItem('Id')
this.userProfile = {
    name: namePart,
    email: this.email,
    avatar: 'https://picsum.photos/200'
  };
  
 }


 logout()
 {
  localStorage.clear();
   this.router.navigate(['/login']);
 }

  
  

  onToggleSideNav() {
    this.toggleSideNav.emit();
  }

  clearNotifications() {
    this.notificationsCount = 0;
  }
}
