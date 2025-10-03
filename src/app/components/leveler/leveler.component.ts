import { Component, signal, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-leveler',
  template: `
    <div class="leveler">
      <h1>📐 Digital Leveler</h1>

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
        <div class="level-container">
          <div class="bubble-level">
            <div
              class="bubble"
              [style.transform]="'translate(' + bubbleX() + 'px, ' + bubbleY() + 'px)'">
            </div>
            <div class="crosshair-h"></div>
            <div class="crosshair-v"></div>
          </div>

          <div class="readings">
            <div class="reading">
              <label>Tilt X (Roll):</label>
              <span [class.level]="Math.abs(roll()) < 2">{{ roll().toFixed(1) }}°</span>
            </div>
            <div class="reading">
              <label>Tilt Y (Pitch):</label>
              <span [class.level]="Math.abs(pitch()) < 2">{{ pitch().toFixed(1) }}°</span>
            </div>
            <div class="reading">
              <label>Status:</label>
              <span [class.level]="isLevel()">{{ isLevel() ? '✅ Level' : '❌ Not Level' }}</span>
            </div>
          </div>

          <div class="calibration">
            <button (click)="calibrate()" class="calibrate-btn">
              🎯 Calibrate
            </button>
            <small>Place device on flat surface and calibrate for accuracy</small>
          </div>
        </div>
      }
    </div>
  `,
  styles: [`
    .leveler {
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

    .permission-btn:hover {
      background: #0056b3;
    }

    .level-container {
      display: flex;
      flex-direction: column;
      gap: 2rem;
    }

    .bubble-level {
      position: relative;
      width: 300px;
      height: 300px;
      background: linear-gradient(135deg, #e3f2fd 0%, #bbdefb 100%);
      border-radius: 50%;
      border: 8px solid #333;
      margin: 0 auto;
      overflow: hidden;
    }

    .bubble {
      position: absolute;
      width: 40px;
      height: 40px;
      background: radial-gradient(circle, #4caf50 0%, #388e3c 70%);
      border-radius: 50%;
      top: 50%;
      left: 50%;
      transform: translate(-50%, -50%);
      transition: transform 0.1s ease-out;
      box-shadow: 0 2px 10px rgba(0,0,0,0.3);
      border: 3px solid #2e7d32;
    }

    .crosshair-h, .crosshair-v {
      position: absolute;
      background: rgba(0,0,0,0.3);
    }

    .crosshair-h {
      width: 100%;
      height: 2px;
      top: 50%;
      left: 0;
      transform: translateY(-50%);
    }

    .crosshair-v {
      width: 2px;
      height: 100%;
      left: 50%;
      top: 0;
      transform: translateX(-50%);
    }

    .readings {
      display: grid;
      grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
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

    .reading label {
      font-weight: bold;
      color: #333;
    }

    .reading span {
      font-size: 1.2rem;
      font-weight: bold;
      color: #dc3545;
    }

    .reading span.level {
      color: #28a745;
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
      margin-bottom: 0.5rem;
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
      .leveler {
        padding: 1rem;
      }

      .bubble-level {
        width: 250px;
        height: 250px;
      }

      .readings {
        grid-template-columns: 1fr;
      }
    }
  `]
})
export class LevelerComponent implements OnInit, OnDestroy {
  supported = signal(false);
  hasPermission = signal(false);
  pitch = signal(0);
  roll = signal(0);

  protected readonly Math = Math;

  private calibrationOffset = { pitch: 0, roll: 0 };

  bubbleX = signal(0);
  bubbleY = signal(0);

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
    window.addEventListener('deviceorientation', this.handleOrientation.bind(this));
  }

  private stopListening() {
    window.removeEventListener('deviceorientation', this.handleOrientation.bind(this));
  }

  private handleOrientation(event: DeviceOrientationEvent) {
    if (event.beta !== null && event.gamma !== null) {
      const rawPitch = event.beta - this.calibrationOffset.pitch;
      const rawRoll = event.gamma - this.calibrationOffset.roll;

      this.pitch.set(Math.max(-90, Math.min(90, rawPitch)));
      this.roll.set(Math.max(-90, Math.min(90, rawRoll)));

      this.updateBubblePosition();
    }
  }

  private updateBubblePosition() {
    const maxOffset = 120;
    const pitchOffset = (this.pitch() / 90) * maxOffset;
    const rollOffset = (this.roll() / 90) * maxOffset;

    this.bubbleX.set(rollOffset);
    this.bubbleY.set(pitchOffset);
  }

  isLevel(): boolean {
    return Math.abs(this.pitch()) < 2 && Math.abs(this.roll()) < 2;
  }

  calibrate() {
    this.calibrationOffset.pitch = this.pitch() + this.calibrationOffset.pitch;
    this.calibrationOffset.roll = this.roll() + this.calibrationOffset.roll;

    this.pitch.set(0);
    this.roll.set(0);
    this.updateBubblePosition();
  }
}
