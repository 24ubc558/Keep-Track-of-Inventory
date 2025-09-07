import { CommonModule } from '@angular/common';
import { Component, EventEmitter, Input, Output } from '@angular/core';
import { RouterLink, RouterLinkActive } from '@angular/router';
import { MatSidenavModule } from '@angular/material/sidenav';
import { MatListModule } from '@angular/material/list';
import { MatIconModule } from '@angular/material/icon';

interface NavItem {
  path: string;
  icon: string;
  label: string;
  notification?: number; // ✅ Add this
}



@Component({
  selector: 'app-side-nav',
  imports: [
     CommonModule,
    MatSidenavModule,
    MatListModule,
    MatIconModule,
    RouterLink,
    RouterLinkActive
  ],
  templateUrl: './side-nav.html',
  styleUrl: './side-nav.css'
})
export class SideNav {



 @Input() isOpen = true;

  get sidenavWidth() {
    return this.isOpen ? '200px' : '77px';
  }

  navItems: NavItem[] = [
    { path: '/admin-dashboard/home', icon: 'point_of_sale', label: 'Point of Sale' },
    // { path: '/owner-dashboard/addtruck', icon: 'local_shipping', label: 'Vechicle', notification: 3 },
     { path: '/admin-dashboard/Inventory', icon: 'inventory', label: 'Inventory' },
      // { path: '/owner-dashboard/sales', icon: 'people', label: 'Customers' },
      { path: '/admin-dashboard/sales', icon: 'bar_chart', label: 'Reports' },
      // { path: '/owner-dashboard/home', icon: 'settings', label: 'Settings' }
  ];
}
