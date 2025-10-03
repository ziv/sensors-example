import { Component, signal, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-accelerometer',
  template: `
    <div class="accelerometer">
      <h1>📳 Accelerometer</h1>

      @if (!supported()) {
        <div class="error">
          <p>⚠️ Accelerometer is not supported on this device</p>
        </div>
      } @else if (!hasPermission()) {
        <div class="permission-request">
          <p>This app needs permission to access device motion.</p>
          <button (click)="requestPermission()" class="permission-btn">
            Grant Permission
          </button>
        </div>
      } @else {
        <div class="sensor-container">
          <div class="motion-visualization">
            <div class="device-representation">
              <div
                class="device-box"
                [style.transform]="getDeviceTransform()">
                📱
              </div>
            </div>

            <div class="acceleration-bars">
              <div class="axis-bar x-axis">
                <label>X</label>
                <div class="bar-container">
                  <div
                    class="bar"
                    [style.width.%]="Math.abs(acceleration().x / maxAcceleration * 100)"
                    [class.positive]="acceleration().x > 0"
                    [class.negative]="acceleration().x < 0">
                  </div>
                </div>
                <span>{{ acceleration().x.toFixed(1) }}</span>
              </div>

              <div class="axis-bar y-axis">
                <label>Y</label>
                <div class="bar-container">
                  <div
                    class="bar"
                    [style.width.%]="Math.abs(acceleration().y / maxAcceleration * 100)"
                    [class.positive]="acceleration().y > 0"
                    [class.negative]="acceleration().y < 0">
                  </div>
                </div>
                <span>{{ acceleration().y.toFixed(1) }}</span>
              </div>

              <div class="axis-bar z-axis">
                <label>Z</label>
                <div class="bar-container">
                  <div
                    class="bar"
                    [style.width.%]="Math.abs(acceleration().z / maxAcceleration * 100)"
                    [class.positive]="acceleration().z > 0"
                    [class.negative]="acceleration().z < 0">
                  </div>
                </div>
                <span>{{ acceleration().z.toFixed(1) }}</span>
              </div>
            </div>
          </div>

          <div class="readings">
            <div class="reading primary">
              <label>Total Force:</label>
              <span class="force-value">{{ totalForce().toFixed(2) }} m/s²</span>
            </div>

            <div class="reading">
              <label>X-Axis:</label>
              <span [class.active]="Math.abs(acceleration().x) > 2">
                {{ acceleration().x.toFixed(2) }} m/s²
              </span>
            </div>

            <div class="reading">
              <label>Y-Axis:</label>
              <span [class.active]="Math.abs(acceleration().y) > 2">
                {{ acceleration().y.toFixed(2) }} m/s²
              </span>
            </div>

            <div class="reading">
              <label>Z-Axis:</label>
              <span [class.active]="Math.abs(acceleration().z) > 2">
                {{ acceleration().z.toFixed(2) }} m/s²
              </span>
            </div>

            <div class="reading">
              <label>Motion State:</label>
              <span [class.active]="isMoving()">
                {{ getMotionState() }}
              </span>
            </div>
          </div>

          <div class="motion-history">
            <h3>Motion Activity</h3>
            <div class="activity-log">
              @for (event of motionEvents().slice(-5); track $index) {
                <div class="motion-event" [class]="event.type">
                  <span class="event-time">{{ formatTime(event.timestamp) }}</span>
                  <span class="event-text">{{ event.text }}</span>
                  <span class="event-force">{{ event.force.toFixed(1) }}g</span>
                </div>
              }
            </div>
          </div>

          <div class="motion-info">
            <h3>Understanding Acceleration</h3>
            <div class="info-grid">
              <div class="info-item">
                <strong>X-Axis:</strong> Left/Right movement
              </div>
              <div class="info-item">
                <strong>Y-Axis:</strong> Forward/Backward movement
              </div>
              <div class="info-item">
                <strong>Z-Axis:</strong> Up/Down movement
              </div>
              <div class="info-item">
                <strong>1g ≈ 9.8 m/s²:</strong> Earth's gravity
              </div>
            </div>
          </div>

          <div class="controls">
            <button (click)="clearHistory()" class="clear-btn">
              🧹 Clear History
            </button>
          </div>
        </div>
      }
    </div>
  `,
  styles: [`
    .accelerometer {
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

    .motion-visualization {
      background: white;
      border-radius: 1rem;
      padding: 2rem;
      box-shadow: 0 4px 20px rgba(0,0,0,0.1);
    }

    .device-representation {
      text-align: center;
      margin-bottom: 2rem;
      perspective: 1000px;
    }

    .device-box {
      display: inline-block;
      font-size: 4rem;
      padding: 2rem;
      border-radius: 1rem;
      background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
      color: white;
      transition: transform 0.1s ease-out;
      transform-style: preserve-3d;
    }

    .acceleration-bars {
      display: flex;
      flex-direction: column;
      gap: 1rem;
    }

    .axis-bar {
      display: flex;
      align-items: center;
      gap: 1rem;
    }

    .axis-bar label {
      font-weight: bold;
      min-width: 30px;
      color: #333;
    }

    .bar-container {
      flex: 1;
      height: 30px;
      background: #e9ecef;
      border-radius: 15px;
      position: relative;
      overflow: hidden;
    }

    .bar {
      height: 100%;
      border-radius: 15px;
      transition: width 0.1s ease-out;
      min-width: 2px;
    }

    .x-axis .bar.positive { background: linear-gradient(90deg, #28a745, #34ce57); }
    .x-axis .bar.negative { background: linear-gradient(90deg, #dc3545, #e74c3c); }
    .y-axis .bar.positive { background: linear-gradient(90deg, #007bff, #3498db); }
    .y-axis .bar.negative { background: linear-gradient(90deg, #6f42c1, #9b59b6); }
    .z-axis .bar.positive { background: linear-gradient(90deg, #fd7e14, #f39c12); }
    .z-axis .bar.negative { background: linear-gradient(90deg, #20c997, #1abc9c); }

    .axis-bar span {
      font-weight: bold;
      min-width: 80px;
      text-align: right;
      color: #333;
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
      background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
      color: white;
    }

    .reading label {
      font-weight: bold;
    }

    .reading span {
      font-size: 1.1rem;
      font-weight: bold;
    }

    .force-value {
      font-size: 1.5rem !important;
    }

    .reading span.active {
      color: #28a745;
    }

    .reading.primary span.active {
      color: #fff;
      text-shadow: 0 0 10px rgba(255,255,255,0.5);
    }

    .motion-history {
      background: white;
      border-radius: 1rem;
      padding: 2rem;
      box-shadow: 0 4px 20px rgba(0,0,0,0.1);
    }

    .motion-history h3 {
      color: #333;
      margin-bottom: 1rem;
    }

    .activity-log {
      display: flex;
      flex-direction: column;
      gap: 0.5rem;
      max-height: 200px;
      overflow-y: auto;
    }

    .motion-event {
      display: flex;
      justify-content: space-between;
      align-items: center;
      padding: 0.7rem;
      border-radius: 0.5rem;
      background: #f8f9fa;
      border-left: 4px solid #dee2e6;
    }

    .motion-event.shake {
      border-left-color: #dc3545;
      background: #fff5f5;
    }

    .motion-event.tilt {
      border-left-color: #007bff;
      background: #f8f9ff;
    }

    .motion-event.sudden {
      border-left-color: #ffc107;
      background: #fffbf0;
    }

    .event-time {
      font-size: 0.8rem;
      color: #666;
      min-width: 60px;
    }

    .event-text {
      flex: 1;
      margin: 0 1rem;
    }

    .event-force {
      font-weight: bold;
      color: #333;
      min-width: 50px;
      text-align: right;
    }

    .motion-info {
      background: #e3f2fd;
      border-radius: 1rem;
      padding: 2rem;
    }

    .motion-info h3 {
      color: #333;
      margin-bottom: 1rem;
    }

    .info-grid {
      display: grid;
      grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
      gap: 1rem;
    }

    .info-item {
      background: white;
      padding: 1rem;
      border-radius: 0.5rem;
      color: #333;
    }

    .controls {
      text-align: center;
    }

    .clear-btn {
      background: #6c757d;
      color: white;
      border: none;
      padding: 1rem 2rem;
      border-radius: 0.5rem;
      font-size: 1rem;
      cursor: pointer;
    }

    .clear-btn:hover {
      background: #545b62;
    }

    @media (max-width: 768px) {
      .accelerometer {
        padding: 1rem;
      }

      .readings {
        grid-template-columns: 1fr;
      }

      .info-grid {
        grid-template-columns: 1fr;
      }

      .device-box {
        font-size: 3rem;
        padding: 1.5rem;
      }

      .axis-bar {
        flex-direction: column;
        align-items: stretch;
        gap: 0.5rem;
      }

      .axis-bar label {
        min-width: auto;
      }

      .axis-bar span {
        text-align: center;
        min-width: auto;
      }
    }
  `]
})
export class AccelerometerComponent implements OnInit, OnDestroy {
  supported = signal(false);
  hasPermission = signal(false);
  acceleration = signal({ x: 0, y: 0, z: 0 });
  maxAcceleration = 20;
  motionEvents = signal<Array<{
    timestamp: number;
    text: string;
    force: number;
    type: string;
  }>>([]);

  protected readonly Math = Math;

  ngOnInit() {
    this.checkSupport();
  }

  ngOnDestroy() {
    this.stopListening();
  }

  private checkSupport() {
    this.supported.set('DeviceMotionEvent' in window);

    if (this.supported()) {
      this.requestPermission();
    }
  }

  async requestPermission() {
    try {
      let permission = 'granted';

      if (typeof (DeviceMotionEvent as any).requestPermission === 'function') {
        permission = await (DeviceMotionEvent as any).requestPermission();
      }

      if (permission === 'granted') {
        this.hasPermission.set(true);
        this.startListening();
      }
    } catch (error) {
      console.error('Permission denied:', error);
    }
  }

  private startListening() {
    window.addEventListener('devicemotion', this.handleMotion.bind(this));
  }

  private stopListening() {
    window.removeEventListener('devicemotion', this.handleMotion.bind(this));
  }

  private handleMotion(event: DeviceMotionEvent) {
    if (event.accelerationIncludingGravity) {
      const acc = event.accelerationIncludingGravity;
      const newAcceleration = {
        x: acc.x || 0,
        y: acc.y || 0,
        z: acc.z || 0
      };

      this.acceleration.set(newAcceleration);
      this.detectMotionEvents(newAcceleration);
    }
  }

  private detectMotionEvents(acc: { x: number; y: number; z: number }) {
    const force = Math.sqrt(acc.x * acc.x + acc.y * acc.y + acc.z * acc.z);
    const timestamp = Date.now();

    let eventType = '';
    let eventText = '';

    if (force > 15) {
      eventType = 'shake';
      eventText = 'Strong shake detected!';
    } else if (force > 12) {
      eventType = 'sudden';
      eventText = 'Sudden movement';
    } else if (Math.abs(acc.x) > 8 || Math.abs(acc.y) > 8) {
      eventType = 'tilt';
      eventText = 'Device tilted';
    } else {
      return; // No significant motion
    }

    // Avoid duplicate events within 500ms
    const events = this.motionEvents();
    if (events.length === 0 || timestamp - events[events.length - 1].timestamp > 500) {
      this.motionEvents.set([
        ...events,
        { timestamp, text: eventText, force, type: eventType }
      ]);
    }
  }

  totalForce(): number {
    const acc = this.acceleration();
    return Math.sqrt(acc.x * acc.x + acc.y * acc.y + acc.z * acc.z);
  }

  isMoving(): boolean {
    return this.totalForce() > 11; // Above normal gravity
  }

  getMotionState(): string {
    const force = this.totalForce();

    if (force > 15) return '🌪️ Shaking';
    if (force > 12) return '📳 High Motion';
    if (force > 11) return '🚶 Moving';
    return '😴 Still';
  }

  getDeviceTransform(): string {
    const acc = this.acceleration();
    const rotateX = Math.max(-30, Math.min(30, acc.y * 3));
    const rotateY = Math.max(-30, Math.min(30, -acc.x * 3));
    const rotateZ = Math.max(-15, Math.min(15, acc.z * 1.5));

    return `rotateX(${rotateX}deg) rotateY(${rotateY}deg) rotateZ(${rotateZ}deg)`;
  }

  formatTime(timestamp: number): string {
    const date = new Date(timestamp);
    return date.toLocaleTimeString().split(' ')[0];
  }

  clearHistory() {
    this.motionEvents.set([]);
  }
}
