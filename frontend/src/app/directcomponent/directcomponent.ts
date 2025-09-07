import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';

@Component({
  selector: 'app-directcomponent',
  templateUrl: './directcomponent.html',
  styleUrls: ['./directcomponent.css']
})
export class Directcomponent implements OnInit {
  constructor(private router: Router) {}

  ngOnInit(): void {
    if (typeof window !== 'undefined') {
      const role = localStorage.getItem('role');

      if (role === 'CUSTOMER') {
        this.router.navigate(['/dashboard']);
      } else if (role === 'OWNER') {
        this.router.navigate(['/owner-dashboard']);
      } else {
        this.router.navigate(['/login']);
      }
    }
  }
}
