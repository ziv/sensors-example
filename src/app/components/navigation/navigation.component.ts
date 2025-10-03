import { Component } from '@angular/core';
import { RouterLink, RouterLinkActive } from '@angular/router';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-navigation',
  imports: [RouterLink, RouterLinkActive, CommonModule],
  template: `
    <nav class="navbar">
      <div class="nav-brand">
        <a routerLink="/home" class="brand-link">
          📱 Sensor Demo
        </a>
      </div>

      <button
        class="nav-toggle"
        (click)="toggleMenu()"
        [class.active]="isMenuOpen"
        type="button">
        <span></span>
        <span></span>
        <span></span>
      </button>

      <div class="nav-menu" [class.active]="isMenuOpen">
        @for (sensor of sensors; track sensor.path) {
          <a
            [routerLink]="sensor.path"
            routerLinkActive="active"
            class="nav-link"
            (click)="closeMenu()">
            <span class="nav-icon">{{ sensor.icon }}</span>
            <span class="nav-text">{{ sensor.name }}</span>
          </a>
        }
      </div>
    </nav>
  `,
  styles: [`
    .navbar {
      background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
      color: white;
      padding: 1rem;
      display: flex;
      justify-content: space-between;
      align-items: center;
      box-shadow: 0 2px 10px rgba(0,0,0,0.1);
      position: relative;
      z-index: 1000;
    }

    .nav-brand .brand-link {
      color: white;
      text-decoration: none;
      font-size: 1.5rem;
      font-weight: bold;
    }

    .nav-toggle {
      display: none;
      flex-direction: column;
      background: transparent;
      border: none;
      cursor: pointer;
      padding: 0.5rem;
    }

    .nav-toggle span {
      width: 25px;
      height: 3px;
      background: white;
      margin: 3px 0;
      transition: 0.3s;
    }

    .nav-toggle.active span:nth-child(1) {
      transform: rotate(-45deg) translate(-5px, 6px);
    }

    .nav-toggle.active span:nth-child(2) {
      opacity: 0;
    }

    .nav-toggle.active span:nth-child(3) {
      transform: rotate(45deg) translate(-5px, -6px);
    }

    .nav-menu {
      display: flex;
      gap: 1rem;
      align-items: center;
    }

    .nav-link {
      color: white;
      text-decoration: none;
      padding: 0.5rem 1rem;
      border-radius: 0.5rem;
      transition: all 0.3s ease;
      display: flex;
      align-items: center;
      gap: 0.5rem;
      white-space: nowrap;
    }

    .nav-link:hover {
      background: rgba(255,255,255,0.1);
      transform: translateY(-2px);
    }

    .nav-link.active {
      background: rgba(255,255,255,0.2);
    }

    .nav-icon {
      font-size: 1.2rem;
    }

    @media (max-width: 768px) {
      .nav-toggle {
        display: flex;
      }

      .nav-menu {
        position: absolute;
        top: 100%;
        left: 0;
        right: 0;
        background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
        flex-direction: column;
        padding: 1rem;
        box-shadow: 0 2px 10px rgba(0,0,0,0.1);
        transform: translateY(-100%);
        opacity: 0;
        pointer-events: none;
        transition: all 0.3s ease;
      }

      .nav-menu.active {
        transform: translateY(0);
        opacity: 1;
        pointer-events: all;
      }

      .nav-link {
        width: 100%;
        justify-content: flex-start;
        padding: 1rem;
        border-radius: 0.5rem;
        margin: 0.25rem 0;
      }
    }
  `]
})
export class NavigationComponent {
  isMenuOpen = false;

  sensors = [
    { name: 'Home', path: '/home', icon: '🏠' },
    { name: 'Leveler', path: '/leveler', icon: '📐' },
    { name: 'Compass', path: '/compass', icon: '🧭' },
    { name: 'Light', path: '/light-sensor', icon: '💡' },
    { name: 'Motion', path: '/accelerometer', icon: '📳' },
    { name: 'Gyro', path: '/gyroscope', icon: '🔄' },
    { name: 'Magnet', path: '/magnetometer', icon: '🧲' },
    { name: 'Proximity', path: '/proximity', icon: '📏' }
  ];

  toggleMenu() {
    this.isMenuOpen = !this.isMenuOpen;
  }

  closeMenu() {
    this.isMenuOpen = false;
  }
}
