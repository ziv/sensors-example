import { Component, signal, OnInit, OnDestroy, ElementRef, ViewChild, AfterViewInit } from '@angular/core';

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

          <div class="graph-container">
            <h3>Real-time Data (60 second window)</h3>
            <canvas #graphCanvas></canvas>
            <div class="legend">
              <div class="legend-item">
                <span class="legend-color total"></span>
                <span>Total Force</span>
              </div>
              <div class="legend-item">
                <span class="legend-color x-axis"></span>
                <span>X-Axis</span>
              </div>
              <div class="legend-item">
                <span class="legend-color y-axis"></span>
                <span>Y-Axis</span>
              </div>
              <div class="legend-item">
                <span class="legend-color z-axis"></span>
                <span>Z-Axis</span>
              </div>
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

    .graph-container {
      background: white;
      border-radius: 1rem;
      padding: 2rem;
      box-shadow: 0 4px 20px rgba(0,0,0,0.1);
    }

    .graph-container h3 {
      color: #333;
      margin-bottom: 1rem;
      text-align: center;
    }

    canvas {
      width: 100%;
      height: 300px;
      display: block;
    }

    .legend {
      display: flex;
      justify-content: center;
      gap: 2rem;
      margin-top: 1rem;
      flex-wrap: wrap;
    }

    .legend-item {
      display: flex;
      align-items: center;
      gap: 0.5rem;
    }

    .legend-color {
      width: 20px;
      height: 3px;
      border-radius: 2px;
    }

    .legend-color.total {
      background: #764ba2;
    }

    .legend-color.x-axis {
      background: #28a745;
    }

    .legend-color.y-axis {
      background: #007bff;
    }

    .legend-color.z-axis {
      background: #fd7e14;
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

      .legend {
        gap: 1rem;
      }
    }
  `]
})
export class AccelerometerComponent implements OnInit, OnDestroy, AfterViewInit {
  @ViewChild('graphCanvas') graphCanvas!: ElementRef<HTMLCanvasElement>;

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

  private dataHistory: Array<{
    timestamp: number;
    totalForce: number;
    x: number;
    y: number;
    z: number;
  }> = [];
  private animationFrameId?: number;
  private ctx?: CanvasRenderingContext2D;
  private readonly WINDOW_MS = 60000; // 60 seconds

  protected readonly Math = Math;

  ngAfterViewInit() {
    if (this.graphCanvas) {
      const canvas = this.graphCanvas.nativeElement;
      this.ctx = canvas.getContext('2d') || undefined;

      // Set canvas size
      const resizeCanvas = () => {
        const rect = canvas.getBoundingClientRect();
        canvas.width = rect.width * window.devicePixelRatio;
        canvas.height = rect.height * window.devicePixelRatio;
        this.ctx?.scale(window.devicePixelRatio, window.devicePixelRatio);
      };

      resizeCanvas();
      window.addEventListener('resize', resizeCanvas);
    }
  }

  ngOnInit() {
    this.checkSupport();
  }

  ngOnDestroy() {
    this.stopListening();
    if (this.animationFrameId) {
      cancelAnimationFrame(this.animationFrameId);
    }
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
    this.startGraphRendering();
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
      this.addDataPoint(newAcceleration);
    }
  }

  private addDataPoint(acc: { x: number; y: number; z: number }) {
    const timestamp = Date.now();
    const totalForce = this.totalForce();

    this.dataHistory.push({
      timestamp,
      totalForce,
      x: acc.x,
      y: acc.y,
      z: acc.z
    });

    // Remove data older than window
    const cutoff = timestamp - this.WINDOW_MS;
    this.dataHistory = this.dataHistory.filter(d => d.timestamp >= cutoff);
  }

  private startGraphRendering() {
    const render = () => {
      this.drawGraph();
      this.animationFrameId = requestAnimationFrame(render);
    };
    render();
  }

  private drawGraph() {
    if (!this.ctx || !this.graphCanvas) return;

    const canvas = this.graphCanvas.nativeElement;
    const ctx = this.ctx;
    const rect = canvas.getBoundingClientRect();
    const width = rect.width;
    const height = rect.height;

    // Clear canvas
    ctx.clearRect(0, 0, width, height);

    if (this.dataHistory.length < 2) return;

    // Calculate bounds
    const now = Date.now();
    const startTime = now - this.WINDOW_MS;

    // Find min/max for scaling
    let maxValue = 15; // Default max
    let minValue = -15;
    this.dataHistory.forEach(d => {
      maxValue = Math.max(maxValue, d.totalForce, Math.abs(d.x), Math.abs(d.y), Math.abs(d.z));
      minValue = Math.min(minValue, -Math.abs(d.x), -Math.abs(d.y), -Math.abs(d.z));
    });

    const padding = 40;
    const graphWidth = width - padding * 2;
    const graphHeight = height - padding * 2;

    // Draw axes
    ctx.strokeStyle = '#e0e0e0';
    ctx.lineWidth = 1;
    ctx.beginPath();
    ctx.moveTo(padding, padding);
    ctx.lineTo(padding, height - padding);
    ctx.lineTo(width - padding, height - padding);
    ctx.stroke();

    // Draw grid lines
    ctx.strokeStyle = '#f5f5f5';
    for (let i = 0; i <= 5; i++) {
      const y = padding + (graphHeight / 5) * i;
      ctx.beginPath();
      ctx.moveTo(padding, y);
      ctx.lineTo(width - padding, y);
      ctx.stroke();
    }

    // Helper function to scale values
    const scaleX = (timestamp: number) => {
      const normalizedTime = (timestamp - startTime) / this.WINDOW_MS;
      return padding + normalizedTime * graphWidth;
    };

    const scaleY = (value: number) => {
      const normalizedValue = (value - minValue) / (maxValue - minValue);
      return height - padding - normalizedValue * graphHeight;
    };

    // Draw lines
    const drawLine = (getValue: (d: typeof this.dataHistory[0]) => number, color: string, lineWidth = 2) => {
      if (this.dataHistory.length < 2) return;

      ctx.strokeStyle = color;
      ctx.lineWidth = lineWidth;
      ctx.beginPath();

      let started = false;
      this.dataHistory.forEach(d => {
        const x = scaleX(d.timestamp);
        const y = scaleY(getValue(d));

        if (!started) {
          ctx.moveTo(x, y);
          started = true;
        } else {
          ctx.lineTo(x, y);
        }
      });

      ctx.stroke();
    };

    // Draw all lines
    drawLine(d => d.x, '#28a745', 2);
    drawLine(d => d.y, '#007bff', 2);
    drawLine(d => d.z, '#fd7e14', 2);
    drawLine(d => d.totalForce, '#764ba2', 3);

    // Draw axis labels
    ctx.fillStyle = '#666';
    ctx.font = '12px sans-serif';
    ctx.textAlign = 'right';

    // Y-axis labels
    for (let i = 0; i <= 5; i++) {
      const value = minValue + ((maxValue - minValue) / 5) * (5 - i);
      const y = padding + (graphHeight / 5) * i;
      ctx.fillText(value.toFixed(0), padding - 10, y + 4);
    }

    // X-axis labels (time)
    ctx.textAlign = 'center';
    ctx.fillText('60s', padding, height - padding + 20);
    ctx.fillText('0s', width - padding, height - padding + 20);
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
    this.dataHistory = [];
  }
}
