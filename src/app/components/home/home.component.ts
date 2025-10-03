import {Component} from '@angular/core';
import {RouterLink} from '@angular/router';

@Component({
  selector: 'app-home',
  imports: [RouterLink],
  template: `
    <div class="home">
      <header class="hero">
        <h1>📱 Mobile Sensor Demo</h1>
        <p>Explore your device's capabilities with these sensor mini-apps</p>
      </header>

      <div class="sensor-grid">
        @for (sensor of sensors; track sensor.path) {
          <a [routerLink]="sensor.path" class="sensor-card">
            <div class="sensor-icon">{{ sensor.icon }}</div>
            <h3>{{ sensor.name }}</h3>
            <p>{{ sensor.description }}</p>
          </a>
        }
      </div>

      <div class="info-section">
        <h2>About This Demo</h2>
        <p>This application demonstrates various mobile device sensors using web APIs.
           Some sensors may require HTTPS and user permission to function properly.</p>

        <div class="requirements">
          <h3>Requirements:</h3>
          <ul>
            <li>🔒 HTTPS connection (for most sensors)</li>
            <li>📱 Mobile device or laptop with sensors</li>
            <li>✅ Browser permission for sensor access</li>
            <li>🌐 Modern browser with sensor API support</li>
          </ul>
        </div>
      </div>
    </div>
  `,
  styles: [`
    .home {
      max-width: 1200px;
      margin: 0 auto;
      padding: 2rem;
    }

    .hero {
      text-align: center;
      margin-bottom: 3rem;
    }

    .hero h1 {
      font-size: 2.5rem;
      margin-bottom: 1rem;
      background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
      -webkit-background-clip: text;
      -webkit-text-fill-color: transparent;
      background-clip: text;
    }

    .hero p {
      font-size: 1.2rem;
      color: #666;
      max-width: 600px;
      margin: 0 auto;
    }

    .sensor-grid {
      display: grid;
      grid-template-columns: repeat(auto-fit, minmax(280px, 1fr));
      gap: 2rem;
      margin-bottom: 3rem;
    }

    .sensor-card {
      background: white;
      border-radius: 1rem;
      padding: 2rem;
      text-decoration: none;
      color: inherit;
      box-shadow: 0 4px 20px rgba(0,0,0,0.1);
      transition: all 0.3s ease;
      border: 2px solid transparent;
    }

    .sensor-card:hover {
      transform: translateY(-5px);
      box-shadow: 0 8px 30px rgba(0,0,0,0.15);
      border-color: #667eea;
    }

    .sensor-icon {
      font-size: 3rem;
      text-align: center;
      margin-bottom: 1rem;
    }

    .sensor-card h3 {
      font-size: 1.5rem;
      margin-bottom: 1rem;
      text-align: center;
      color: #333;
    }

    .sensor-card p {
      color: #666;
      text-align: center;
      line-height: 1.5;
    }

    .info-section {
      background: #f8f9fa;
      border-radius: 1rem;
      padding: 2rem;
      margin-top: 2rem;
    }

    .info-section h2 {
      color: #333;
      margin-bottom: 1rem;
    }

    .requirements {
      margin-top: 1.5rem;
    }

    .requirements h3 {
      color: #333;
      margin-bottom: 0.5rem;
    }

    .requirements ul {
      list-style: none;
      padding: 0;
    }

    .requirements li {
      padding: 0.5rem 0;
      color: #666;
    }

    @media (max-width: 768px) {
      .home {
        padding: 1rem;
      }

      .hero h1 {
        font-size: 2rem;
      }

      .sensor-grid {
        grid-template-columns: 1fr;
        gap: 1.5rem;
      }

      .sensor-card {
        padding: 1.5rem;
      }
    }
  `]
})
export class HomeComponent {
  sensors = [
    {
      name: 'Leveler',
      path: '/leveler',
      icon: '📐',
      description: 'Digital bubble level using device orientation to measure tilt angles'
    },
    {
      name: 'Compass',
      path: '/compass',
      icon: '🧭',
      description: 'Magnetic compass showing direction and heading using magnetometer'
    },
    {
      name: 'Light Sensor',
      path: '/light-sensor',
      icon: '💡',
      description: 'Measure ambient light levels using the light sensor'
    },
    {
      name: 'Accelerometer',
      path: '/accelerometer',
      icon: '📳',
      description: 'Detect motion and acceleration in 3D space'
    },
    {
      name: 'Gyroscope',
      path: '/gyroscope',
      icon: '🔄',
      description: 'Measure rotation and angular velocity around each axis'
    },
    {
      name: 'Magnetometer',
      path: '/magnetometer',
      icon: '🧲',
      description: 'Detect magnetic field strength and direction'
    },
    {
      name: 'Proximity',
      path: '/proximity',
      icon: '📏',
      description: 'Detect nearby objects using proximity sensor'
    }
  ];
}
