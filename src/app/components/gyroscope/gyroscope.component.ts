import { Component, signal, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-gyroscope',
  template: `
    <div class="gyroscope">
      <h1>🔄 Gyroscope</h1>

      @if (!supported()) {
        <div class="error">
          <p>⚠️ Gyroscope is not supported on this device</p>
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
          <div class="rotation-visualization">
            <div class="gyro-display">
              <div class="rotation-sphere">
                <div
                  class="sphere-inner"
                  [style.transform]="getSphereTransform()">
                  🔄
                </div>
              </div>

              <div class="rotation-rings">
                <div
                  class="ring ring-x"
                  [style.transform]="'rotateY(' + (rotation().alpha || 0) + 'deg)'">
                </div>
                <div
                  class="ring ring-y"
                  [style.transform]="'rotateX(' + (rotation().beta || 0) + 'deg)'">
                </div>
                <div
                  class="ring ring-z"
                  [style.transform]="'rotateZ(' + (rotation().gamma || 0) + 'deg)'">
                </div>
              </div>
            </div>

            <div class="rotation-bars">
              <div class="rotation-bar">
                <label>Alpha (Z):</label>
                <div class="bar-container">
                  <div
                    class="bar alpha-bar"
                    [style.width.%]="Math.abs((rotation().alpha || 0) / 360 * 100)">
                  </div>
                </div>
                <span>{{ (rotation().alpha || 0).toFixed(1) }}°</span>
              </div>

              <div class="rotation-bar">
                <label>Beta (X):</label>
                <div class="bar-container">
                  <div
                    class="bar beta-bar"
                    [style.width.%]="Math.abs((rotation().beta || 0) / 180 * 100)">
                  </div>
                </div>
                <span>{{ (rotation().beta || 0).toFixed(1) }}°</span>
              </div>

              <div class="rotation-bar">
                <label>Gamma (Y):</label>
                <div class="bar-container">
                  <div
                    class="bar gamma-bar"
                    [style.width.%]="Math.abs((rotation().gamma || 0) / 90 * 100)">
                  </div>
                </div>
                <span>{{ (rotation().gamma || 0).toFixed(1) }}°</span>
              </div>
            </div>
          </div>

          <div class="readings">
            <div class="reading primary">
              <label>Angular Velocity:</label>
              <span class="velocity-value">{{ totalVelocity().toFixed(1) }} °/s</span>
            </div>

            <div class="reading">
              <label>Alpha (Z-axis):</label>
              <span [class.active]="Math.abs(rotation().alpha || 0) > 30">
                {{ (rotation().alpha || 0).toFixed(1) }}°
              </span>
            </div>

            <div class="reading">
              <label>Beta (X-axis):</label>
              <span [class.active]="Math.abs(rotation().beta || 0) > 30">
                {{ (rotation().beta || 0).toFixed(1) }}°
              </span>
            </div>

            <div class="reading">
              <label>Gamma (Y-axis):</label>
              <span [class.active]="Math.abs(rotation().gamma || 0) > 30">
                {{ (rotation().gamma || 0).toFixed(1) }}°
              </span>
            </div>

            <div class="reading">
              <label>Rotation State:</label>
              <span [class.active]="isRotating()">
                {{ getRotationState() }}
              </span>
            </div>
          </div>

          @if (rotationRate().alpha !== null) {
            <div class="rate-section">
              <h3>Rotation Rate</h3>
              <div class="rate-readings">
                <div class="rate-reading">
                  <label>Alpha Rate:</label>
                  <span>{{ (rotationRate().alpha || 0).toFixed(1) }} °/s</span>
                  <div class="rate-indicator" [class.active]="Math.abs(rotationRate().alpha || 0) > 10"></div>
                </div>

                <div class="rate-reading">
                  <label>Beta Rate:</label>
                  <span>{{ (rotationRate().beta || 0).toFixed(1) }} °/s</span>
                  <div class="rate-indicator" [class.active]="Math.abs(rotationRate().beta || 0) > 10"></div>
                </div>

                <div class="rate-reading">
                  <label>Gamma Rate:</label>
                  <span>{{ (rotationRate().gamma || 0).toFixed(1) }} °/s</span>
                  <div class="rate-indicator" [class.active]="Math.abs(rotationRate().gamma || 0) > 10"></div>
                </div>
              </div>
            </div>
          }

          <div class="gyro-info">
            <h3>Understanding Gyroscope</h3>
            <div class="info-grid">
              <div class="info-item">
                <strong>Alpha (Z-axis):</strong> Rotation around vertical axis (0° to 360°)
              </div>
              <div class="info-item">
                <strong>Beta (X-axis):</strong> Front-to-back tilt (-180° to 180°)
              </div>
              <div class="info-item">
                <strong>Gamma (Y-axis):</strong> Left-to-right tilt (-90° to 90°)
              </div>
              <div class="info-item">
                <strong>Rotation Rate:</strong> Speed of rotation in degrees per second
              </div>
            </div>
          </div>

          <div class="controls">
            <button (click)="resetCalibration()" class="reset-btn">
              🎯 Reset Orientation
            </button>
          </div>
        </div>
      }
    </div>
  `,
  styles: [`
    .gyroscope {
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

    .rotation-visualization {
      background: white;
      border-radius: 1rem;
      padding: 2rem;
      box-shadow: 0 4px 20px rgba(0,0,0,0.1);
    }

    .gyro-display {
      position: relative;
      height: 300px;
      display: flex;
      justify-content: center;
      align-items: center;
      margin-bottom: 2rem;
      perspective: 1000px;
    }

    .rotation-sphere {
      position: relative;
      width: 120px;
      height: 120px;
      border-radius: 50%;
      background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
      display: flex;
      align-items: center;
      justify-content: center;
      z-index: 10;
    }

    .sphere-inner {
      font-size: 3rem;
      color: white;
      transition: transform 0.1s ease-out;
      transform-style: preserve-3d;
    }

    .rotation-rings {
      position: absolute;
      width: 100%;
      height: 100%;
    }

    .ring {
      position: absolute;
      border: 3px solid;
      border-radius: 50%;
      top: 50%;
      left: 50%;
    }

    .ring-x {
      width: 200px;
      height: 200px;
      border-color: #dc3545;
      transform: translate(-50%, -50%) rotateY(90deg);
      margin-top: -100px;
      margin-left: -100px;
    }

    .ring-y {
      width: 160px;
      height: 160px;
      border-color: #28a745;
      transform: translate(-50%, -50%);
      margin-top: -80px;
      margin-left: -80px;
    }

    .ring-z {
      width: 240px;
      height: 240px;
      border-color: #007bff;
      transform: translate(-50%, -50%) rotateX(90deg);
      margin-top: -120px;
      margin-left: -120px;
    }

    .rotation-bars {
      display: flex;
      flex-direction: column;
      gap: 1rem;
    }

    .rotation-bar {
      display: flex;
      align-items: center;
      gap: 1rem;
    }

    .rotation-bar label {
      font-weight: bold;
      min-width: 100px;
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

    .alpha-bar {
      background: linear-gradient(90deg, #007bff, #3498db);
    }

    .beta-bar {
      background: linear-gradient(90deg, #dc3545, #e74c3c);
    }

    .gamma-bar {
      background: linear-gradient(90deg, #28a745, #34ce57);
    }

    .rotation-bar span {
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

    .velocity-value {
      font-size: 1.5rem !important;
    }

    .reading span.active {
      color: #28a745;
    }

    .reading.primary span.active {
      color: #fff;
      text-shadow: 0 0 10px rgba(255,255,255,0.5);
    }

    .rate-section {
      background: white;
      border-radius: 1rem;
      padding: 2rem;
      box-shadow: 0 4px 20px rgba(0,0,0,0.1);
    }

    .rate-section h3 {
      color: #333;
      margin-bottom: 1rem;
    }

    .rate-readings {
      display: flex;
      flex-direction: column;
      gap: 1rem;
    }

    .rate-reading {
      display: flex;
      align-items: center;
      gap: 1rem;
      padding: 1rem;
      background: #f8f9fa;
      border-radius: 0.5rem;
    }

    .rate-reading label {
      font-weight: bold;
      min-width: 100px;
    }

    .rate-reading span {
      flex: 1;
      font-weight: bold;
    }

    .rate-indicator {
      width: 20px;
      height: 20px;
      border-radius: 50%;
      background: #dee2e6;
      transition: background-color 0.3s ease;
    }

    .rate-indicator.active {
      background: #28a745;
      box-shadow: 0 0 10px rgba(40, 167, 69, 0.5);
    }

    .gyro-info {
      background: #e8f4fd;
      border-radius: 1rem;
      padding: 2rem;
    }

    .gyro-info h3 {
      color: #333;
      margin-bottom: 1rem;
    }

    .info-grid {
      display: grid;
      grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
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
      .gyroscope {
        padding: 1rem;
      }

      .readings {
        grid-template-columns: 1fr;
      }

      .info-grid {
        grid-template-columns: 1fr;
      }

      .gyro-display {
        height: 250px;
      }

      .rotation-sphere {
        width: 100px;
        height: 100px;
      }

      .sphere-inner {
        font-size: 2.5rem;
      }

      .ring-x {
        width: 160px;
        height: 160px;
        margin-top: -80px;
        margin-left: -80px;
      }

      .ring-y {
        width: 120px;
        height: 120px;
        margin-top: -60px;
        margin-left: -60px;
      }

      .ring-z {
        width: 200px;
        height: 200px;
        margin-top: -100px;
        margin-left: -100px;
      }

      .rotation-bar {
        flex-direction: column;
        align-items: stretch;
        gap: 0.5rem;
      }

      .rotation-bar label {
        min-width: auto;
      }

      .rotation-bar span {
        text-align: center;
        min-width: auto;
      }
    }
  `]
})
export class GyroscopeComponent implements OnInit, OnDestroy {
  supported = signal(false);
  hasPermission = signal(false);
  rotation = signal({ alpha: 0, beta: 0, gamma: 0 });
  rotationRate = signal<{ alpha: number | null; beta: number | null; gamma: number | null }>({
    alpha: null,
    beta: null,
    gamma: null
  });

  protected readonly Math = Math;

  private calibrationOffset = { alpha: 0, beta: 0, gamma: 0 };

  ngOnInit() {
    this.checkSupport();
  }

  ngOnDestroy() {
    this.stopListening();
  }

  private checkSupport() {
    this.supported.set('DeviceOrientationEvent' in window || 'DeviceMotionEvent' in window);

    if (this.supported()) {
      this.requestPermission();
    }
  }

  async requestPermission() {
    try {
      let permission = 'granted';

      if (typeof (DeviceOrientationEvent as any).requestPermission === 'function') {
        permission = await (DeviceOrientationEvent as any).requestPermission();
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
    window.addEventListener('deviceorientation', this.handleOrientation.bind(this));
    window.addEventListener('devicemotion', this.handleMotion.bind(this));
  }

  private stopListening() {
    window.removeEventListener('deviceorientation', this.handleOrientation.bind(this));
    window.removeEventListener('devicemotion', this.handleMotion.bind(this));
  }

  private handleOrientation(event: DeviceOrientationEvent) {
    if (event.alpha !== null && event.beta !== null && event.gamma !== null) {
      this.rotation.set({
        alpha: this.normalizeAngle(event.alpha - this.calibrationOffset.alpha),
        beta: this.normalizeAngle(event.beta - this.calibrationOffset.beta, 180),
        gamma: this.normalizeAngle(event.gamma - this.calibrationOffset.gamma, 90)
      });
    }
  }

  private handleMotion(event: DeviceMotionEvent) {
    if (event.rotationRate) {
      this.rotationRate.set({
        alpha: event.rotationRate.alpha,
        beta: event.rotationRate.beta,
        gamma: event.rotationRate.gamma
      });
    }
  }

  private normalizeAngle(angle: number, max = 360): number {
    if (max === 360) {
      return ((angle % 360) + 360) % 360;
    } else {
      return Math.max(-max, Math.min(max, angle));
    }
  }

  totalVelocity(): number {
    const rate = this.rotationRate();
    if (rate.alpha === null || rate.beta === null || rate.gamma === null) {
      return 0;
    }

    return Math.sqrt(
      (rate.alpha || 0) ** 2 +
      (rate.beta || 0) ** 2 +
      (rate.gamma || 0) ** 2
    );
  }

  isRotating(): boolean {
    return this.totalVelocity() > 5;
  }

  getRotationState(): string {
    const velocity = this.totalVelocity();

    if (velocity > 50) return '🌪️ Spinning Fast';
    if (velocity > 20) return '🔄 Rotating';
    if (velocity > 5) return '↻ Slow Turn';
    return '😴 Still';
  }

  getSphereTransform(): string {
    const rot = this.rotation();
    return `rotateZ(${rot.alpha}deg) rotateX(${rot.beta}deg) rotateY(${rot.gamma}deg)`;
  }

  resetCalibration() {
    const current = this.rotation();
    this.calibrationOffset = {
      alpha: current.alpha + this.calibrationOffset.alpha,
      beta: current.beta + this.calibrationOffset.beta,
      gamma: current.gamma + this.calibrationOffset.gamma
    };

    this.rotation.set({ alpha: 0, beta: 0, gamma: 0 });
  }
}
