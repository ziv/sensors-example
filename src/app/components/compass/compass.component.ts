import { Component, signal, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-compass',
  template: `
    <div class="compass">
      <h1>🧭 Digital Compass</h1>

      @if (!supported()) {
        <div class="error">
          <p>⚠️ Device orientation is not supported on this device</p>
        </div>
      } @else if (!hasPermission()) {
        <div class="permission-request">
          <p>This app needs permission to access device orientation.</p>
          <button (click)="requestPermission()" class="permission-btn">
            Grant Permission
          </button>
        </div>
      } @else {
        <div class="compass-container">
          <div class="compass-face">
            <div
              class="compass-dial"
              [style.transform]="'rotate(' + (-heading()) + 'deg)'">

              <!-- Cardinal directions -->
              <div class="cardinal north">N</div>
              <div class="cardinal east">E</div>
              <div class="cardinal south">S</div>
              <div class="cardinal west">W</div>

              <!-- Degree markers -->
              @for (degree of degreeMarkers; track degree) {
                <div
                  class="degree-marker"
                  [style.transform]="'rotate(' + degree + 'deg)'">
                  <div class="marker-line" [class.major]="degree % 30 === 0"></div>
                  @if (degree % 30 === 0 && degree !== 0 && degree !== 90 && degree !== 180 && degree !== 270) {
                    <div class="degree-label">{{ degree }}</div>
                  }
                </div>
              }
            </div>

            <div class="compass-needle">
              <div class="needle-north"></div>
              <div class="needle-south"></div>
            </div>

            <div class="center-dot"></div>
          </div>

          <div class="readings">
            <div class="reading primary">
              <label>Heading:</label>
              <span class="heading-value">{{ heading().toFixed(1) }}°</span>
            </div>
            <div class="reading">
              <label>Direction:</label>
              <span>{{ getDirection() }}</span>
            </div>
            <div class="reading">
              <label>Accuracy:</label>
              <span [class.accurate]="accuracy() !== null && accuracy()! > -1">
                {{ accuracy() !== null ? (accuracy()! > -1 ? 'High' : 'Low') : 'Unknown' }}
              </span>
            </div>
          </div>

          <div class="calibration">
            <button (click)="calibrate()" class="calibrate-btn">
              🎯 Calibrate
            </button>
            <small>Move device in figure-8 pattern to calibrate</small>
          </div>
        </div>
      }
    </div>
  `,
  styles: [`
    .compass {
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

    .compass-container {
      display: flex;
      flex-direction: column;
      gap: 2rem;
    }

    .compass-face {
      position: relative;
      width: 300px;
      height: 300px;
      margin: 0 auto;
      background: radial-gradient(circle, #f0f8ff 0%, #e1f5fe 100%);
      border-radius: 50%;
      border: 8px solid #333;
      box-shadow: 0 4px 20px rgba(0,0,0,0.3);
    }

    .compass-dial {
      position: absolute;
      width: 100%;
      height: 100%;
      border-radius: 50%;
      transition: transform 0.3s ease-out;
    }

    .cardinal {
      position: absolute;
      font-size: 2rem;
      font-weight: bold;
      color: #333;
      transform: translate(-50%, -50%);
    }

    .cardinal.north {
      top: 15px;
      left: 50%;
      color: #dc3545;
      font-size: 2.5rem;
    }

    .cardinal.east {
      top: 50%;
      right: 15px;
      transform: translate(50%, -50%);
    }

    .cardinal.south {
      bottom: 15px;
      left: 50%;
      transform: translate(-50%, 50%);
    }

    .cardinal.west {
      top: 50%;
      left: 15px;
      transform: translate(-50%, -50%);
    }

    .degree-marker {
      position: absolute;
      width: 2px;
      height: 20px;
      top: 0;
      left: 50%;
      transform-origin: 50% 150px;
    }

    .marker-line {
      width: 100%;
      height: 10px;
      background: #666;
    }

    .marker-line.major {
      height: 15px;
      background: #333;
      width: 3px;
    }

    .degree-label {
      position: absolute;
      top: 20px;
      left: 50%;
      transform: translateX(-50%);
      font-size: 0.8rem;
      color: #333;
      font-weight: bold;
    }

    .compass-needle {
      position: absolute;
      top: 50%;
      left: 50%;
      transform: translate(-50%, -50%);
      width: 6px;
      height: 120px;
      z-index: 10;
    }

    .needle-north {
      width: 100%;
      height: 50%;
      background: linear-gradient(to top, #dc3545, #ff6b7a);
      clip-path: polygon(50% 0%, 0% 100%, 100% 100%);
    }

    .needle-south {
      width: 100%;
      height: 50%;
      background: linear-gradient(to bottom, #333, #666);
      clip-path: polygon(0% 0%, 100% 0%, 50% 100%);
    }

    .center-dot {
      position: absolute;
      top: 50%;
      left: 50%;
      transform: translate(-50%, -50%);
      width: 12px;
      height: 12px;
      background: #333;
      border-radius: 50%;
      z-index: 20;
    }

    .readings {
      display: grid;
      grid-template-columns: repeat(auto-fit, minmax(180px, 1fr));
      gap: 1rem;
      margin: 2rem 0;
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
    }

    .reading label {
      font-weight: bold;
      color: #333;
    }

    .reading span {
      font-size: 1.2rem;
      font-weight: bold;
      color: #333;
    }

    .heading-value {
      font-size: 1.8rem !important;
      color: #dc3545 !important;
    }

    .accurate {
      color: #28a745 !important;
    }

    .calibration {
      text-align: center;
    }

    .calibrate-btn {
      background: #17a2b8;
      color: white;
      border: none;
      padding: 1rem 2rem;
      border-radius: 0.5rem;
      font-size: 1rem;
      cursor: pointer;
    }

    .calibrate-btn:hover {
      background: #138496;
    }

    .calibration small {
      display: block;
      color: #666;
      margin-top: 0.5rem;
    }

    @media (max-width: 768px) {
      .compass {
        padding: 1rem;
      }

      .compass-face {
        width: 250px;
        height: 250px;
      }

      .compass-needle {
        height: 100px;
      }

      .degree-marker {
        transform-origin: 50% 125px;
      }

      .readings {
        grid-template-columns: 1fr;
      }
    }
  `]
})
export class CompassComponent implements OnInit, OnDestroy {
  supported = signal(false);
  hasPermission = signal(false);
  heading = signal(0);
  accuracy = signal<number | null>(null);

  degreeMarkers = Array.from({ length: 72 }, (_, i) => i * 5);

  private calibrationOffset = 0;

  ngOnInit() {
    this.checkSupport();
  }

  ngOnDestroy() {
    this.stopListening();
  }

  private checkSupport() {
    this.supported.set(
      'DeviceOrientationEvent' in window &&
      typeof (DeviceOrientationEvent as any).requestPermission === 'function' ||
      'ondeviceorientationabsolute' in window ||
      'ondeviceorientation' in window
    );

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
    const handler = (event: DeviceOrientationEvent) => this.handleOrientation(event);

    if ('ondeviceorientationabsolute' in window) {
      (window as any).addEventListener('deviceorientationabsolute', handler);
    } else {
      (window as any).addEventListener('deviceorientation', handler);
    }
  }

  private stopListening() {
    // Note: In a real application, you'd store the handler reference to properly remove it
    // For this demo, we'll keep it simple
  }

  private handleOrientation(event: DeviceOrientationEvent) {
    if (event.alpha !== null) {
      let compass = event.alpha;

      if (event.webkitCompassHeading) {
        compass = event.webkitCompassHeading;
      }

      const adjustedHeading = (360 - (compass - this.calibrationOffset)) % 360;
      this.heading.set(adjustedHeading);

      if (event.webkitCompassAccuracy !== undefined) {
        this.accuracy.set(event.webkitCompassAccuracy);
      }
    }
  }

  getDirection(): string {
    const directions = [
      'N', 'NNE', 'NE', 'ENE',
      'E', 'ESE', 'SE', 'SSE',
      'S', 'SSW', 'SW', 'WSW',
      'W', 'WNW', 'NW', 'NNW'
    ];

    const index = Math.round(this.heading() / 22.5) % 16;
    return directions[index];
  }

  calibrate() {
    this.calibrationOffset = this.heading();
    this.heading.set(0);
  }
}
