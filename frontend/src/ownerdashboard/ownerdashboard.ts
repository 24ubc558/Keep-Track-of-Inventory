import { Component } from '@angular/core';
import { Header } from './component/header/header';
import { SideNav } from './component/side-nav/side-nav';
import { RouterModule, RouterOutlet } from '@angular/router';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-ownerdashboard',
  imports: [CommonModule, RouterOutlet, SideNav,Header ],
  templateUrl: './ownerdashboard.html',
  styleUrl: './ownerdashboard.css'
})
export class Ownerdashboard {
 isCollapsed = false;

  onToggleCollapse() {
    this.isCollapsed = !this.isCollapsed;
  }
}
