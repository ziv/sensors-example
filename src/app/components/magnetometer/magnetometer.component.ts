import { Component, signal, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-magnetometer',
  template: `
    <div class="magnetometer">
      <h1>🧲 Magnetometer</h1>

      @if (!supported()) {
        <div class="error">
          <p>⚠️ Magnetometer is not supported on this device</p>
          <small>This sensor requires specific hardware and browser support</small>
        </div>
      } @else if (!hasPermission()) {
        <div class="permission-request">
          <p>This app needs permission to access the magnetometer sensor.</p>
          <button (click)="requestPermission()" class="permission-btn">
            Grant Permission
          </button>
        </div>
      } @else {
        <div class="sensor-container">
          <div class="magnetic-field-display">
            <div class="field-visualization">
              <div class="field-center">
                <div class="magnet-icon">🧲</div>
                <div class="field-strength">
                  <span class="strength-value">{{ totalField().toFixed(0) }}</span>
                  <span class="strength-unit">µT</span>
                </div>
              </div>

              <div class="field-lines">
                @for (line of fieldLines; track $index) {
                  <div
                    class="field-line"
                    [style.transform]="'rotate(' + (line + magneticField().x * 0.1) + 'deg)'"
                    [style.opacity]="Math.min(1, totalField() / 100)">
                  </div>
                }
              </div>
            </div>

            <div class="field-compass">
              <div
                class="compass-needle"
                [style.transform]="'rotate(' + getCompassAngle() + 'deg)'">
                <div class="needle-tip"></div>
              </div>
            </div>
          </div>

          <div class="readings">
            <div class="reading primary">
              <label>Total Field:</label>
              <span class="field-value">{{ totalField().toFixed(1) }} µT</span>
            </div>

            <div class="reading">
              <label>X-Axis:</label>
              <span [class.strong]="Math.abs(magneticField().x) > 30">
                {{ magneticField().x.toFixed(1) }} µT
              </span>
            </div>

            <div class="reading">
              <label>Y-Axis:</label>
              <span [class.strong]="Math.abs(magneticField().y) > 30">
                {{ magneticField().y.toFixed(1) }} µT
              </span>
            </div>

            <div class="reading">
              <label>Z-Axis:</label>
              <span [class.strong]="Math.abs(magneticField().z) > 30">
                {{ magneticField().z.toFixed(1) }} µT
              </span>
            </div>

            <div class="reading">
              <label>Field Strength:</label>
              <span [class.strong]="getFieldStrength().level === 'strong'">
                {{ getFieldStrength().description }}
              </span>
            </div>
          </div>

          <div class="field-analysis">
            <h3>Magnetic Field Analysis</h3>
            <div class="analysis-grid">
              <div class="analysis-item">
                <div class="analysis-label">Horizontal Component</div>
                <div class="analysis-value">{{ getHorizontalComponent().toFixed(1) }} µT</div>
              </div>

              <div class="analysis-item">
                <div class="analysis-label">Vertical Component</div>
                <div class="analysis-value">{{ magneticField().z.toFixed(1) }} µT</div>
              </div>

              <div class="analysis-item">
                <div class="analysis-label">Magnetic Inclination</div>
                <div class="analysis-value">{{ getMagneticInclination().toFixed(1) }}°</div>
              </div>

              <div class="analysis-item">
                <div class="analysis-label">Declination Estimate</div>
                <div class="analysis-value">{{ getMagneticDeclination().toFixed(1) }}°</div>
              </div>
            </div>
          </div>

          <div class="interference-detector">
            <h3>Interference Detection</h3>
            <div class="interference-status" [class]="getInterferenceLevel().level">
              <div class="status-indicator"></div>
              <div class="status-text">
                <strong>{{ getInterferenceLevel().title }}</strong>
                <p>{{ getInterferenceLevel().description }}</p>
              </div>
            </div>

            <div class="interference-history">
              <h4>Recent Changes</h4>
              @for (change of fieldHistory().slice(-3); track $index) {
                <div class="field-change">
                  <span class="change-time">{{ formatTime(change.timestamp) }}</span>
                  <span class="change-value">{{ change.change > 0 ? '+' : '' }}{{ change.change.toFixed(1) }}µT</span>
                </div>
              }
            </div>
          </div>

          <div class="magnetic-info">
            <h3>About Earth's Magnetic Field</h3>
            <div class="info-content">
              <p>Earth's magnetic field typically ranges from 25-65 µT (microtesla).
                 The field strength varies by location and is affected by:</p>
              <ul>
                <li>🌍 Geographic location (stronger near poles)</li>
                <li>⚡ Electronic devices and metal objects</li>
                <li>🏢 Building materials and structures</li>
                <li>🌞 Solar activity and space weather</li>
              </ul>
            </div>
          </div>

          <div class="controls">
            <button (click)="calibrate()" class="calibrate-btn">
              🎯 Calibrate
            </button>
            <button (click)="clearHistory()" class="clear-btn">
              🧹 Clear History
            </button>
          </div>
        </div>
      }
    </div>
  `,
  styles: [`
    .magnetometer {
      max-width: 800px;
      margin: 0 auto;
      padding: 2rem;
    }

    h1 {
      color: #333;
      margin-bottom: 2rem;
      text-align: center;
    }

    .error, .permission-request {
      background: #f8d7da;
      color: #721c24;
      padding: 2rem;
      border-radius: 1rem;
      margin: 2rem 0;
      text-align: center;
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

    .magnetic-field-display {
      background: white;
      border-radius: 1rem;
      padding: 2rem;
      box-shadow: 0 4px 20px rgba(0,0,0,0.1);
      display: grid;
      grid-template-columns: 1fr 1fr;
      gap: 2rem;
    }

    .field-visualization {
      position: relative;
      height: 250px;
      background: radial-gradient(circle, #e3f2fd 0%, #bbdefb 100%);
      border-radius: 1rem;
      overflow: hidden;
    }

    .field-center {
      position: absolute;
      top: 50%;
      left: 50%;
      transform: translate(-50%, -50%);
      text-align: center;
      z-index: 10;
    }

    .magnet-icon {
      font-size: 3rem;
      margin-bottom: 0.5rem;
      filter: drop-shadow(0 0 10px rgba(220, 53, 69, 0.5));
    }

    .field-strength {
      background: white;
      padding: 0.5rem;
      border-radius: 0.5rem;
      box-shadow: 0 2px 10px rgba(0,0,0,0.1);
    }

    .strength-value {
      font-size: 1.5rem;
      font-weight: bold;
      color: #dc3545;
    }

    .strength-unit {
      font-size: 0.9rem;
      color: #666;
    }

    .field-lines {
      position: absolute;
      top: 0;
      left: 0;
      right: 0;
      bottom: 0;
    }

    .field-line {
      position: absolute;
      width: 2px;
      height: 100px;
      background: linear-gradient(to bottom, #dc3545, transparent);
      top: 50%;
      left: 50%;
      transform-origin: 50% 0%;
      transition: transform 0.3s ease, opacity 0.3s ease;
    }

    .field-compass {
      position: relative;
      height: 250px;
      background: #f8f9fa;
      border-radius: 1rem;
      border: 3px solid #333;
    }

    .compass-needle {
      position: absolute;
      top: 50%;
      left: 50%;
      width: 4px;
      height: 80px;
      background: linear-gradient(to top, #333, #dc3545);
      transform-origin: 50% 100%;
      transition: transform 0.3s ease;
      margin-left: -2px;
      margin-top: -80px;
    }

    .needle-tip {
      position: absolute;
      top: 0;
      left: 50%;
      transform: translateX(-50%);
      width: 0;
      height: 0;
      border-left: 6px solid transparent;
      border-right: 6px solid transparent;
      border-bottom: 20px solid #dc3545;
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

    .reading.primary {
      grid-column: 1 / -1;
      background: linear-gradient(135deg, #dc3545 0%, #c82333 100%);
      color: white;
    }

    .reading label {
      font-weight: bold;
    }

    .reading span {
      font-size: 1.1rem;
      font-weight: bold;
    }

    .field-value {
      font-size: 1.5rem !important;
    }

    .reading span.strong {
      color: #dc3545;
    }

    .reading.primary span.strong {
      color: #fff;
      text-shadow: 0 0 10px rgba(255,255,255,0.5);
    }

    .field-analysis, .interference-detector, .magnetic-info {
      background: white;
      border-radius: 1rem;
      padding: 2rem;
      box-shadow: 0 4px 20px rgba(0,0,0,0.1);
    }

    .field-analysis h3, .interference-detector h3, .magnetic-info h3 {
      color: #333;
      margin-bottom: 1rem;
    }

    .analysis-grid {
      display: grid;
      grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
      gap: 1rem;
    }

    .analysis-item {
      background: #f8f9fa;
      padding: 1rem;
      border-radius: 0.5rem;
      text-align: center;
    }

    .analysis-label {
      font-size: 0.9rem;
      color: #666;
      margin-bottom: 0.5rem;
    }

    .analysis-value {
      font-size: 1.2rem;
      font-weight: bold;
      color: #333;
    }

    .interference-status {
      display: flex;
      align-items: center;
      gap: 1rem;
      padding: 1rem;
      border-radius: 0.5rem;
      margin-bottom: 1rem;
    }

    .interference-status.low {
      background: #d4edda;
      border-left: 4px solid #28a745;
    }

    .interference-status.medium {
      background: #fff3cd;
      border-left: 4px solid #ffc107;
    }

    .interference-status.high {
      background: #f8d7da;
      border-left: 4px solid #dc3545;
    }

    .status-indicator {
      width: 20px;
      height: 20px;
      border-radius: 50%;
    }

    .interference-status.low .status-indicator {
      background: #28a745;
    }

    .interference-status.medium .status-indicator {
      background: #ffc107;
    }

    .interference-status.high .status-indicator {
      background: #dc3545;
    }

    .status-text strong {
      display: block;
      margin-bottom: 0.25rem;
    }

    .status-text p {
      margin: 0;
      font-size: 0.9rem;
    }

    .interference-history h4 {
      color: #333;
      margin-bottom: 0.5rem;
      font-size: 1rem;
    }

    .field-change {
      display: flex;
      justify-content: space-between;
      padding: 0.5rem;
      background: #f8f9fa;
      border-radius: 0.25rem;
      margin-bottom: 0.25rem;
    }

    .change-time {
      font-size: 0.8rem;
      color: #666;
    }

    .change-value {
      font-weight: bold;
      color: #333;
    }

    .magnetic-info .info-content ul {
      margin: 1rem 0;
      padding-left: 1.5rem;
    }

    .magnetic-info .info-content li {
      margin-bottom: 0.5rem;
      color: #666;
    }

    .controls {
      display: flex;
      justify-content: center;
      gap: 1rem;
    }

    .calibrate-btn, .clear-btn {
      padding: 1rem 2rem;
      border-radius: 0.5rem;
      font-size: 1rem;
      cursor: pointer;
      border: none;
    }

    .calibrate-btn {
      background: #17a2b8;
      color: white;
    }

    .calibrate-btn:hover {
      background: #138496;
    }

    .clear-btn {
      background: #6c757d;
      color: white;
    }

    .clear-btn:hover {
      background: #545b62;
    }

    @media (max-width: 768px) {
      .magnetometer {
        padding: 1rem;
      }

      .magnetic-field-display {
        grid-template-columns: 1fr;
        gap: 1rem;
      }

      .field-visualization, .field-compass {
        height: 200px;
      }

      .readings {
        grid-template-columns: 1fr;
      }

      .analysis-grid {
        grid-template-columns: repeat(2, 1fr);
      }

      .controls {
        flex-direction: column;
        align-items: center;
      }
    }
  `]
})
export class MagnetometerComponent implements OnInit, OnDestroy {
  supported = signal(false);
  hasPermission = signal(false);
  magneticField = signal({ x: 0, y: 0, z: 0 });
  fieldHistory = signal<Array<{
    timestamp: number;
    field: number;
    change: number;
  }>>([]);

  fieldLines = Array.from({ length: 8 }, (_, i) => i * 45);

  protected readonly Math = Math;

  private sensor: any = null;
  private calibrationOffset = { x: 0, y: 0, z: 0 };
  private lastFieldReading = 0;

  ngOnInit() {
    this.checkSupport();
  }

  ngOnDestroy() {
    this.stopSensor();
  }

  private checkSupport() {
    if ('Magnetometer' in window) {
      this.supported.set(true);
      this.requestPermission();
    } else {
      // Fallback: simulate magnetometer with realistic Earth field values
      this.simulateMagnetometer();
    }
  }

  async requestPermission() {
    try {
      const result = await navigator.permissions.query({ name: 'magnetometer' as any });
      if (result.state === 'granted' || result.state === 'prompt') {
        this.hasPermission.set(true);
        this.startSensor();
      }
    } catch (error) {
      console.error('Permission error:', error);
      this.simulateMagnetometer();
    }
  }

  private startSensor() {
    try {
      this.sensor = new (window as any).Magnetometer({ frequency: 10 });

      this.sensor.addEventListener('reading', () => {
        const field = {
          x: this.sensor.x - this.calibrationOffset.x,
          y: this.sensor.y - this.calibrationOffset.y,
          z: this.sensor.z - this.calibrationOffset.z
        };
        this.updateMagneticField(field);
      });

      this.sensor.addEventListener('error', (error: any) => {
        console.error('Magnetometer error:', error);
        this.simulateMagnetometer();
      });

      this.sensor.start();
    } catch (error) {
      console.error('Failed to start magnetometer:', error);
      this.simulateMagnetometer();
    }
  }

  private stopSensor() {
    if (this.sensor) {
      this.sensor.stop();
      this.sensor = null;
    }
  }

  private simulateMagnetometer() {
    this.supported.set(true);
    this.hasPermission.set(true);

    // Simulate realistic Earth magnetic field values
    let baseX = 20; // Typical horizontal component
    let baseY = 5;  // Typical horizontal component
    let baseZ = 45; // Typical vertical component

    setInterval(() => {
      // Add some realistic variation
      const timeVariation = Math.sin(Date.now() / 5000) * 2;
      const randomVariation = (Math.random() - 0.5) * 3;

      const field = {
        x: baseX + timeVariation + randomVariation,
        y: baseY + (Math.random() - 0.5) * 2,
        z: baseZ + (Math.random() - 0.5) * 5
      };

      this.updateMagneticField(field);
    }, 100);
  }

  private updateMagneticField(field: { x: number; y: number; z: number }) {
    this.magneticField.set(field);

    const totalField = this.calculateTotalField(field);
    const change = totalField - this.lastFieldReading;

    if (Math.abs(change) > 1) {
      const history = this.fieldHistory();
      this.fieldHistory.set([
        ...history,
        {
          timestamp: Date.now(),
          field: totalField,
          change: change
        }
      ].slice(-10)); // Keep last 10 readings
    }

    this.lastFieldReading = totalField;
  }

  private calculateTotalField(field: { x: number; y: number; z: number }): number {
    return Math.sqrt(field.x * field.x + field.y * field.y + field.z * field.z);
  }

  totalField(): number {
    const field = this.magneticField();
    return this.calculateTotalField(field);
  }

  getHorizontalComponent(): number {
    const field = this.magneticField();
    return Math.sqrt(field.x * field.x + field.y * field.y);
  }

  getMagneticInclination(): number {
    const horizontal = this.getHorizontalComponent();
    const vertical = this.magneticField().z;
    return Math.atan2(vertical, horizontal) * (180 / Math.PI);
  }

  getMagneticDeclination(): number {
    const field = this.magneticField();
    return Math.atan2(field.y, field.x) * (180 / Math.PI);
  }

  getCompassAngle(): number {
    return this.getMagneticDeclination();
  }

  getFieldStrength(): { level: string; description: string } {
    const total = this.totalField();

    if (total < 20) {
      return { level: 'weak', description: 'Weak Field' };
    } else if (total < 40) {
      return { level: 'normal', description: 'Normal Field' };
    } else if (total < 70) {
      return { level: 'strong', description: 'Strong Field' };
    } else {
      return { level: 'very-strong', description: 'Very Strong' };
    }
  }

  getInterferenceLevel(): { level: string; title: string; description: string } {
    const total = this.totalField();
    const history = this.fieldHistory();

    // Check for recent rapid changes
    const recentChanges = history.slice(-3);
    const maxChange = Math.max(...recentChanges.map(h => Math.abs(h.change)), 0);

    if (maxChange > 10 || total > 80 || total < 10) {
      return {
        level: 'high',
        title: 'High Interference',
        description: 'Magnetic field is significantly distorted. Move away from metal objects or electronics.'
      };
    } else if (maxChange > 5 || total > 60 || total < 25) {
      return {
        level: 'medium',
        title: 'Moderate Interference',
        description: 'Some magnetic interference detected. Results may be less accurate.'
      };
    } else {
      return {
        level: 'low',
        title: 'Low Interference',
        description: 'Magnetic field readings appear normal and stable.'
      };
    }
  }

  formatTime(timestamp: number): string {
    const date = new Date(timestamp);
    return date.toLocaleTimeString().split(' ')[0];
  }

  calibrate() {
    const current = this.magneticField();
    this.calibrationOffset = { ...current };
    this.magneticField.set({ x: 0, y: 0, z: 0 });
  }

  clearHistory() {
    this.fieldHistory.set([]);
  }
}
