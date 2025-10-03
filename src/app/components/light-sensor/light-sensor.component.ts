import { Component, signal, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-light-sensor',
  template: `
    <div class="light-sensor">
      <h1>💡 Ambient Light Sensor</h1>

      @if (!supported()) {
        <div class="error">
          <p>⚠️ Ambient Light Sensor is not supported on this device</p>
          <small>This sensor requires specific hardware and browser support</small>
        </div>
      } @else if (!hasPermission()) {
        <div class="permission-request">
          <p>This app needs permission to access the ambient light sensor.</p>
          <button (click)="requestPermission()" class="permission-btn">
            Grant Permission
          </button>
        </div>
      } @else {
        <div class="sensor-container">
          <div class="light-display" [style.background-color]="getLightColor()">
            <div class="light-bulb">💡</div>
            <div class="light-reading">
              <span class="lux-value">{{ lightLevel().toFixed(0) }}</span>
              <span class="lux-unit">lux</span>
            </div>
          </div>

          <div class="light-description">
            <h3>{{ getLightDescription().title }}</h3>
            <p>{{ getLightDescription().description }}</p>
          </div>

          <div class="readings">
            <div class="reading">
              <label>Current Level:</label>
              <span>{{ lightLevel().toFixed(1) }} lux</span>
            </div>
            <div class="reading">
              <label>Min Recorded:</label>
              <span>{{ minLevel().toFixed(1) }} lux</span>
            </div>
            <div class="reading">
              <label>Max Recorded:</label>
              <span>{{ maxLevel().toFixed(1) }} lux</span>
            </div>
            <div class="reading">
              <label>Environment:</label>
              <span>{{ getLightDescription().title }}</span>
            </div>
          </div>

          <div class="light-scale">
            <div class="scale-title">Light Levels Reference</div>
            <div class="scale-items">
              <div class="scale-item" [class.active]="lightLevel() < 1">
                <span class="scale-range">0-1</span>
                <span class="scale-label">Moonless Night</span>
              </div>
              <div class="scale-item" [class.active]="lightLevel() >= 1 && lightLevel() < 10">
                <span class="scale-range">1-10</span>
                <span class="scale-label">Dim Room</span>
              </div>
              <div class="scale-item" [class.active]="lightLevel() >= 10 && lightLevel() < 100">
                <span class="scale-range">10-100</span>
                <span class="scale-label">Living Room</span>
              </div>
              <div class="scale-item" [class.active]="lightLevel() >= 100 && lightLevel() < 1000">
                <span class="scale-range">100-1000</span>
                <span class="scale-label">Office/Classroom</span>
              </div>
              <div class="scale-item" [class.active]="lightLevel() >= 1000 && lightLevel() < 10000">
                <span class="scale-range">1k-10k</span>
                <span class="scale-label">Cloudy Day</span>
              </div>
              <div class="scale-item" [class.active]="lightLevel() >= 10000">
                <span class="scale-range">10k+</span>
                <span class="scale-label">Bright Sunlight</span>
              </div>
            </div>
          </div>

          <div class="controls">
            <button (click)="resetMinMax()" class="reset-btn">
              🔄 Reset Min/Max
            </button>
          </div>
        </div>
      }
    </div>
  `,
  styles: [`
    .light-sensor {
      max-width: 600px;
      margin: 0 auto;
      padding: 2rem;
      text-align: center;
    }

    h1 {
      color: #333;
      margin-bottom: 2rem;
    }

    .error, .permission-request {
      background: #f8d7da;
      color: #721c24;
      padding: 2rem;
      border-radius: 1rem;
      margin: 2rem 0;
    }

    .permission-btn {
      background: #007bff;
      color: white;
      border: none;
      padding: 1rem 2rem;
      border-radius: 0.5rem;
      font-size: 1rem;
      cursor: pointer;
      margin-top: 1rem;
    }

    .sensor-container {
      display: flex;
      flex-direction: column;
      gap: 2rem;
    }

    .light-display {
      padding: 3rem;
      border-radius: 1rem;
      border: 3px solid #333;
      transition: background-color 0.5s ease;
      position: relative;
      overflow: hidden;
    }

    .light-bulb {
      font-size: 4rem;
      margin-bottom: 1rem;
      filter: drop-shadow(0 0 20px rgba(255, 255, 0, 0.7));
    }

    .light-reading {
      display: flex;
      align-items: baseline;
      justify-content: center;
      gap: 0.5rem;
    }

    .lux-value {
      font-size: 3rem;
      font-weight: bold;
      color: #333;
      text-shadow: 2px 2px 4px rgba(0,0,0,0.1);
    }

    .lux-unit {
      font-size: 1.5rem;
      color: #666;
    }

    .light-description {
      background: white;
      padding: 2rem;
      border-radius: 1rem;
      box-shadow: 0 4px 20px rgba(0,0,0,0.1);
    }

    .light-description h3 {
      color: #333;
      margin-bottom: 1rem;
      font-size: 1.5rem;
    }

    .light-description p {
      color: #666;
      line-height: 1.6;
    }

    .readings {
      display: grid;
      grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
      gap: 1rem;
    }

    .reading {
      background: white;
      padding: 1rem;
      border-radius: 0.5rem;
      box-shadow: 0 2px 10px rgba(0,0,0,0.1);
      display: flex;
      justify-content: space-between;
      align-items: center;
    }

    .reading label {
      font-weight: bold;
      color: #333;
    }

    .reading span {
      font-size: 1.1rem;
      font-weight: bold;
      color: #333;
    }

    .light-scale {
      background: white;
      padding: 2rem;
      border-radius: 1rem;
      box-shadow: 0 4px 20px rgba(0,0,0,0.1);
    }

    .scale-title {
      font-size: 1.3rem;
      font-weight: bold;
      color: #333;
      margin-bottom: 1rem;
    }

    .scale-items {
      display: flex;
      flex-direction: column;
      gap: 0.5rem;
    }

    .scale-item {
      display: flex;
      justify-content: space-between;
      align-items: center;
      padding: 0.7rem;
      border-radius: 0.5rem;
      background: #f8f9fa;
      transition: all 0.3s ease;
    }

    .scale-item.active {
      background: linear-gradient(135deg, #ffd700 0%, #ffed4e 100%);
      color: #333;
      font-weight: bold;
      transform: scale(1.02);
    }

    .scale-range {
      font-weight: bold;
      min-width: 80px;
      text-align: left;
    }

    .scale-label {
      flex: 1;
      text-align: right;
    }

    .controls {
      display: flex;
      justify-content: center;
    }

    .reset-btn {
      background: #17a2b8;
      color: white;
      border: none;
      padding: 1rem 2rem;
      border-radius: 0.5rem;
      font-size: 1rem;
      cursor: pointer;
    }

    .reset-btn:hover {
      background: #138496;
    }

    @media (max-width: 768px) {
      .light-sensor {
        padding: 1rem;
      }

      .readings {
        grid-template-columns: 1fr;
      }

      .lux-value {
        font-size: 2.5rem;
      }

      .scale-items {
        gap: 0.3rem;
      }

      .scale-item {
        padding: 0.5rem;
        flex-direction: column;
        text-align: center;
      }

      .scale-range {
        min-width: auto;
        margin-bottom: 0.2rem;
      }
    }
  `]
})
export class LightSensorComponent implements OnInit, OnDestroy {
  supported = signal(false);
  hasPermission = signal(false);
  lightLevel = signal(100); // Default fallback value
  minLevel = signal(Number.MAX_VALUE);
  maxLevel = signal(0);

  private sensor: any = null;

  ngOnInit() {
    this.checkSupport();
  }

  ngOnDestroy() {
    this.stopSensor();
  }

  private checkSupport() {
    // Check for Ambient Light Sensor API
    if ('AmbientLightSensor' in window) {
      this.supported.set(true);
      this.requestPermission();
    } else {
      // Fallback: simulate light sensor with camera API or random values for demo
      this.simulateLightSensor();
    }
  }

  async requestPermission() {
    try {
      const result = await navigator.permissions.query({ name: 'ambient-light-sensor' as any });
      if (result.state === 'granted' || result.state === 'prompt') {
        this.hasPermission.set(true);
        this.startSensor();
      }
    } catch (error) {
      console.error('Permission error:', error);
      this.simulateLightSensor();
    }
  }

  private startSensor() {
    try {
      this.sensor = new (window as any).AmbientLightSensor({ frequency: 5 });

      this.sensor.addEventListener('reading', () => {
        const illuminance = this.sensor.illuminance;
        this.updateLightLevel(illuminance);
      });

      this.sensor.addEventListener('error', (error: any) => {
        console.error('Sensor error:', error);
        this.simulateLightSensor();
      });

      this.sensor.start();
    } catch (error) {
      console.error('Failed to start sensor:', error);
      this.simulateLightSensor();
    }
  }

  private stopSensor() {
    if (this.sensor) {
      this.sensor.stop();
      this.sensor = null;
    }
  }

  private simulateLightSensor() {
    this.supported.set(true);
    this.hasPermission.set(true);

    // Simulate light sensor with varying values
    setInterval(() => {
      const baseLevel = 300;
      const variation = Math.random() * 200 - 100;
      const timeVariation = Math.sin(Date.now() / 10000) * 100;
      const level = Math.max(1, baseLevel + variation + timeVariation);
      this.updateLightLevel(level);
    }, 1000);
  }

  private updateLightLevel(level: number) {
    this.lightLevel.set(level);

    if (level < this.minLevel()) {
      this.minLevel.set(level);
    }

    if (level > this.maxLevel()) {
      this.maxLevel.set(level);
    }
  }

  getLightColor(): string {
    const level = this.lightLevel();

    if (level < 1) {
      return '#1a1a2e'; // Very dark
    } else if (level < 10) {
      return '#16213e'; // Dark blue
    } else if (level < 100) {
      return '#0f3460'; // Dark
    } else if (level < 1000) {
      return '#e94560'; // Medium
    } else if (level < 10000) {
      return '#f39c12'; // Bright
    } else {
      return '#f1c40f'; // Very bright
    }
  }

  getLightDescription(): { title: string; description: string } {
    const level = this.lightLevel();

    if (level < 1) {
      return {
        title: 'Moonless Night',
        description: 'Extremely dark conditions with minimal light sources. Typical of outdoor areas on a moonless, cloudy night.'
      };
    } else if (level < 10) {
      return {
        title: 'Dim Indoor Lighting',
        description: 'Very low light conditions, similar to a dimly lit room with minimal artificial lighting or candlelight.'
      };
    } else if (level < 100) {
      return {
        title: 'Comfortable Indoor',
        description: 'Typical residential indoor lighting. Good for relaxing but may be insufficient for detailed tasks.'
      };
    } else if (level < 1000) {
      return {
        title: 'Well-Lit Indoor',
        description: 'Bright indoor conditions suitable for reading, working, or studying. Common in offices and well-lit homes.'
      };
    } else if (level < 10000) {
      return {
        title: 'Overcast Daylight',
        description: 'Outdoor daylight on a cloudy day, or very bright indoor lighting. Good for most visual tasks.'
      };
    } else {
      return {
        title: 'Bright Sunlight',
        description: 'Direct sunlight or very bright outdoor conditions. Excellent visibility but may cause glare.'
      };
    }
  }

  resetMinMax() {
    this.minLevel.set(this.lightLevel());
    this.maxLevel.set(this.lightLevel());
  }
}
