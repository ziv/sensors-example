import { Component, signal, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-proximity',
  imports: [CommonModule],
  template: `
    <div class="proximity">
      <h1>📏 Proximity Sensor</h1>

      @if (!supported()) {
        <div class="error">
          <p>⚠️ Proximity sensor is not supported on this device</p>
          <small>This sensor requires specific hardware and is mainly found on mobile devices</small>
        </div>
      } @else if (!hasPermission()) {
        <div class="permission-request">
          <p>This app needs permission to access the proximity sensor.</p>
          <button (click)="requestPermission()" class="permission-btn">
            Grant Permission
          </button>
        </div>
      } @else {
        <div class="sensor-container">
          <div class="proximity-display">
            <div class="sensor-visualization" [class.near]="isNear()">
              <div class="device-screen">
                📱
                <div class="proximity-waves">
                  @for (wave of [1, 2, 3]; track wave) {
                    <div
                      class="wave"
                      [style.animation-delay]="wave * 0.3 + 's'"
                      [class.active]="isNear()">
                    </div>
                  }
                </div>
              </div>

              <div class="object-indicator" [class.detected]="isNear()">
                @if (isNear()) {
                  <span class="object-icon">✋</span>
                  <span class="object-text">Object Detected</span>
                } @else {
                  <span class="object-icon">👁️</span>
                  <span class="object-text">Clear</span>
                }
              </div>
            </div>

            <div class="distance-meter">
              <div class="meter-label">Distance</div>
              <div class="meter-display">
                <div class="meter-bar">
                  <div
                    class="meter-fill"
                    [style.width.%]="getDistancePercentage()"
                    [class.near]="isNear()">
                  </div>
                </div>
                <div class="meter-value">
                  @if (distance() !== null) {
                    <span class="distance-number">{{ distance()!.toFixed(1) }}</span>
                    <span class="distance-unit">cm</span>
                  } @else {
                    <span class="distance-unknown">Unknown</span>
                  }
                </div>
              </div>
            </div>
          </div>

          <div class="readings">
            <div class="reading primary">
              <label>Proximity State:</label>
              <span [class.near]="isNear()">
                {{ isNear() ? '🔴 Near' : '🟢 Far' }}
              </span>
            </div>

            <div class="reading">
              <label>Distance:</label>
              <span>
                @if (distance() !== null) {
                  {{ distance()!.toFixed(1) }} cm
                } @else {
                  Unknown
                }
              </span>
            </div>

            <div class="reading">
              <label>Max Range:</label>
              <span>{{ maxDistance() }} cm</span>
            </div>

            <div class="reading">
              <label>Sensor Status:</label>
              <span [class.active]="isActive()">
                {{ isActive() ? '✅ Active' : '⏸️ Inactive' }}
              </span>
            </div>
          </div>

          <div class="proximity-events">
            <h3>Proximity Events</h3>
            <div class="events-list">
              @for (event of proximityEvents().slice(-5); track $index) {
                <div class="proximity-event" [class]="event.type">
                  <div class="event-time">{{ formatTime(event.timestamp) }}</div>
                  <div class="event-description">{{ event.description }}</div>
                  <div class="event-distance">
                    @if (event.distance !== null) {
                      {{ event.distance.toFixed(1) }}cm
                    } @else {
                      N/A
                    }
                  </div>
                </div>
              }

              @if (proximityEvents().length === 0) {
                <div class="no-events">
                  No proximity events detected yet. Move objects near the sensor.
                </div>
              }
            </div>
          </div>

          <div class="sensor-info">
            <h3>About Proximity Sensors</h3>
            <div class="info-content">
              <p>Proximity sensors detect nearby objects without physical contact. They are commonly used in smartphones to:</p>
              <ul>
                <li>📞 Turn off screen during phone calls</li>
                <li>💡 Adjust brightness automatically</li>
                <li>🔋 Save battery by disabling touch when covered</li>
                <li>📱 Prevent accidental touches in pocket</li>
              </ul>

              <div class="sensor-types">
                <h4>Common Types:</h4>
                <div class="type-grid">
                  <div class="type-item">
                    <strong>Infrared:</strong> Uses IR light reflection
                  </div>
                  <div class="type-item">
                    <strong>Ultrasonic:</strong> Uses sound waves
                  </div>
                  <div class="type-item">
                    <strong>Capacitive:</strong> Detects electrical fields
                  </div>
                  <div class="type-item">
                    <strong>Magnetic:</strong> Uses magnetic field changes
                  </div>
                </div>
              </div>
            </div>
          </div>

          <div class="controls">
            <button (click)="clearEvents()" class="clear-btn">
              🧹 Clear Events
            </button>
            <button (click)="testSensor()" class="test-btn">
              🧪 Test Sensor
            </button>
          </div>
        </div>
      }
    </div>
  `,
  styles: [`
    .proximity {
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

    .proximity-display {
      background: white;
      border-radius: 1rem;
      padding: 2rem;
      box-shadow: 0 4px 20px rgba(0,0,0,0.1);
    }

    .sensor-visualization {
      display: flex;
      justify-content: space-between;
      align-items: center;
      margin-bottom: 2rem;
      padding: 2rem;
      background: linear-gradient(135deg, #f8f9fa 0%, #e9ecef 100%);
      border-radius: 1rem;
      transition: background-color 0.3s ease;
    }

    .sensor-visualization.near {
      background: linear-gradient(135deg, #fee2e2 0%, #fecaca 100%);
    }

    .device-screen {
      position: relative;
      font-size: 4rem;
      color: #333;
      display: flex;
      align-items: center;
      justify-content: center;
    }

    .proximity-waves {
      position: absolute;
      top: -20px;
      left: -20px;
      right: -20px;
      bottom: -20px;
    }

    .wave {
      position: absolute;
      border: 2px solid transparent;
      border-radius: 50%;
      animation: pulse 2s infinite;
      opacity: 0;
    }

    .wave.active {
      border-color: #dc3545;
      opacity: 1;
    }

    .wave:nth-child(1) {
      top: 10px;
      left: 10px;
      right: 10px;
      bottom: 10px;
    }

    .wave:nth-child(2) {
      top: 0;
      left: 0;
      right: 0;
      bottom: 0;
    }

    .wave:nth-child(3) {
      top: -10px;
      left: -10px;
      right: -10px;
      bottom: -10px;
    }

    @keyframes pulse {
      0% {
        transform: scale(1);
        opacity: 1;
      }
      100% {
        transform: scale(1.3);
        opacity: 0;
      }
    }

    .object-indicator {
      text-align: center;
      padding: 1rem;
      border-radius: 1rem;
      background: white;
      box-shadow: 0 2px 10px rgba(0,0,0,0.1);
      transition: all 0.3s ease;
    }

    .object-indicator.detected {
      background: #dc3545;
      color: white;
      transform: scale(1.05);
    }

    .object-icon {
      display: block;
      font-size: 2rem;
      margin-bottom: 0.5rem;
    }

    .object-text {
      font-weight: bold;
      font-size: 1.1rem;
    }

    .distance-meter {
      margin-top: 2rem;
    }

    .meter-label {
      font-weight: bold;
      color: #333;
      margin-bottom: 1rem;
      text-align: center;
    }

    .meter-display {
      display: flex;
      align-items: center;
      gap: 1rem;
    }

    .meter-bar {
      flex: 1;
      height: 30px;
      background: #e9ecef;
      border-radius: 15px;
      overflow: hidden;
      position: relative;
    }

    .meter-fill {
      height: 100%;
      background: linear-gradient(90deg, #28a745, #ffc107, #dc3545);
      border-radius: 15px;
      transition: width 0.3s ease, background-color 0.3s ease;
    }

    .meter-fill.near {
      background: linear-gradient(90deg, #dc3545, #c82333);
    }

    .meter-value {
      min-width: 100px;
      text-align: center;
    }

    .distance-number {
      font-size: 1.8rem;
      font-weight: bold;
      color: #333;
    }

    .distance-unit {
      font-size: 1rem;
      color: #666;
    }

    .distance-unknown {
      font-size: 1.2rem;
      color: #666;
      font-style: italic;
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

    .reading span.near {
      color: #dc3545;
    }

    .reading.primary span.near {
      color: #fff;
      text-shadow: 0 0 10px rgba(255,255,255,0.5);
    }

    .reading span.active {
      color: #28a745;
    }

    .proximity-events, .sensor-info {
      background: white;
      border-radius: 1rem;
      padding: 2rem;
      box-shadow: 0 4px 20px rgba(0,0,0,0.1);
    }

    .proximity-events h3, .sensor-info h3 {
      color: #333;
      margin-bottom: 1rem;
    }

    .events-list {
      max-height: 300px;
      overflow-y: auto;
    }

    .proximity-event {
      display: grid;
      grid-template-columns: auto 1fr auto;
      gap: 1rem;
      padding: 1rem;
      border-radius: 0.5rem;
      margin-bottom: 0.5rem;
      background: #f8f9fa;
      border-left: 4px solid #dee2e6;
    }

    .proximity-event.near {
      border-left-color: #dc3545;
      background: #fff5f5;
    }

    .proximity-event.far {
      border-left-color: #28a745;
      background: #f0fff4;
    }

    .event-time {
      font-size: 0.8rem;
      color: #666;
      white-space: nowrap;
    }

    .event-description {
      color: #333;
    }

    .event-distance {
      font-weight: bold;
      color: #333;
      white-space: nowrap;
    }

    .no-events {
      text-align: center;
      color: #666;
      font-style: italic;
      padding: 2rem;
    }

    .sensor-info .info-content ul {
      margin: 1rem 0;
      padding-left: 1.5rem;
    }

    .sensor-info .info-content li {
      margin-bottom: 0.5rem;
      color: #666;
    }

    .sensor-types {
      margin-top: 2rem;
    }

    .sensor-types h4 {
      color: #333;
      margin-bottom: 1rem;
    }

    .type-grid {
      display: grid;
      grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
      gap: 1rem;
    }

    .type-item {
      background: #f8f9fa;
      padding: 1rem;
      border-radius: 0.5rem;
      color: #333;
    }

    .controls {
      display: flex;
      justify-content: center;
      gap: 1rem;
    }

    .clear-btn, .test-btn {
      padding: 1rem 2rem;
      border-radius: 0.5rem;
      font-size: 1rem;
      cursor: pointer;
      border: none;
    }

    .clear-btn {
      background: #6c757d;
      color: white;
    }

    .clear-btn:hover {
      background: #545b62;
    }

    .test-btn {
      background: #28a745;
      color: white;
    }

    .test-btn:hover {
      background: #1e7e34;
    }

    @media (max-width: 768px) {
      .proximity {
        padding: 1rem;
      }

      .sensor-visualization {
        flex-direction: column;
        gap: 2rem;
      }

      .device-screen {
        font-size: 3rem;
      }

      .readings {
        grid-template-columns: 1fr;
      }

      .type-grid {
        grid-template-columns: 1fr;
      }

      .controls {
        flex-direction: column;
        align-items: center;
      }

      .proximity-event {
        grid-template-columns: 1fr;
        gap: 0.5rem;
        text-align: center;
      }

      .meter-display {
        flex-direction: column;
        gap: 1rem;
      }
    }
  `]
})
export class ProximityComponent implements OnInit, OnDestroy {
  supported = signal(false);
  hasPermission = signal(false);
  isNear = signal(false);
  distance = signal<number | null>(null);
  maxDistance = signal(5);
  isActive = signal(false);
  proximityEvents = signal<Array<{
    timestamp: number;
    type: 'near' | 'far';
    description: string;
    distance: number | null;
  }>>([]);

  private sensor: any = null;

  ngOnInit() {
    this.checkSupport();
  }

  ngOnDestroy() {
    this.stopSensor();
  }

  private checkSupport() {
    // Check for Proximity Sensor API
    if ('ProximitySensor' in window) {
      this.supported.set(true);
      this.requestPermission();
    } else if ('onuserproximity' in window) {
      // Firefox implementation
      this.supported.set(true);
      this.requestPermission();
    } else {
      // Fallback: simulate proximity sensor
      this.simulateProximitySensor();
    }
  }

  async requestPermission() {
    try {
      const result = await navigator.permissions.query({ name: 'proximity' as any });
      if (result.state === 'granted' || result.state === 'prompt') {
        this.hasPermission.set(true);
        this.startSensor();
      }
    } catch (error) {
      console.error('Permission error:', error);
      this.simulateProximitySensor();
    }
  }

  private startSensor() {
    try {
      if ('ProximitySensor' in window) {
        this.sensor = new (window as any).ProximitySensor({ frequency: 10 });

        this.sensor.addEventListener('reading', () => {
          const distance = this.sensor.distance;
          const near = this.sensor.near;
          this.updateProximity(near, distance);
        });

        this.sensor.start();
        this.isActive.set(true);
      } else if ('onuserproximity' in window) {
        // Firefox implementation
        window.addEventListener('userproximity', (event: any) => {
          this.updateProximity(event.near, null);
        });

        this.isActive.set(true);
      }
    } catch (error) {
      console.error('Failed to start proximity sensor:', error);
      this.simulateProximitySensor();
    }
  }

  private stopSensor() {
    if (this.sensor) {
      this.sensor.stop();
      this.sensor = null;
    }

    window.removeEventListener('userproximity', this.handleProximityEvent);
    this.isActive.set(false);
  }

  private handleProximityEvent = (event: any) => {
    this.updateProximity(event.near, null);
  };

  private simulateProximitySensor() {
    this.supported.set(true);
    this.hasPermission.set(true);
    this.isActive.set(true);

    let currentState = false;
    let stateChangeTime = Date.now();

    // Simulate proximity changes
    setInterval(() => {
      const now = Date.now();

      // Change state every 5-15 seconds randomly
      if (now - stateChangeTime > (5000 + Math.random() * 10000)) {
        currentState = !currentState;
        stateChangeTime = now;

        const simulatedDistance = currentState ?
          Math.random() * 3 : // Near: 0-3cm
          3 + Math.random() * 7; // Far: 3-10cm

        this.updateProximity(currentState, simulatedDistance);
      }
    }, 1000);
  }

  private updateProximity(near: boolean, distance: number | null) {
    const previousState = this.isNear();

    this.isNear.set(near);
    this.distance.set(distance);

    // Log state changes
    if (previousState !== near) {
      const events = this.proximityEvents();
      this.proximityEvents.set([
        ...events,
        {
          timestamp: Date.now(),
          type: near ? 'near' : 'far' as 'near' | 'far',
          description: near ? 'Object detected nearby' : 'Object moved away',
          distance: distance
        }
      ].slice(-20)); // Keep last 20 events
    }
  }

  getDistancePercentage(): number {
    if (this.distance() === null) {
      return this.isNear() ? 100 : 0;
    }

    const dist = this.distance()!;
    const max = this.maxDistance();
    return Math.min(100, (max - dist) / max * 100);
  }

  formatTime(timestamp: number): string {
    const date = new Date(timestamp);
    return date.toLocaleTimeString();
  }

  clearEvents() {
    this.proximityEvents.set([]);
  }

  testSensor() {
    // Simulate a test sequence
    const testSequence = [
      { near: false, distance: 8, delay: 0 },
      { near: true, distance: 2, delay: 1000 },
      { near: false, distance: 6, delay: 2000 },
      { near: true, distance: 1, delay: 3000 },
      { near: false, distance: 10, delay: 4000 }
    ];

    testSequence.forEach(test => {
      setTimeout(() => {
        this.updateProximity(test.near, test.distance);
      }, test.delay);
    });
  }
}
