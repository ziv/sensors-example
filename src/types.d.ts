// Global type declarations for sensor APIs

declare global {
  interface DeviceOrientationEvent {
    webkitCompassHeading?: number;
    webkitCompassAccuracy?: number;
  }

  interface Window {
    DeviceOrientationEvent: {
      new (type: string, eventInitDict?: DeviceOrientationEventInit): DeviceOrientationEvent;
      requestPermission?(): Promise<'granted' | 'denied'>;
    };

    DeviceMotionEvent: {
      new (type: string, eventInitDict?: DeviceMotionEventInit): DeviceMotionEvent;
      requestPermission?(): Promise<'granted' | 'denied'>;
    };

    AmbientLightSensor?: {
      new (options?: { frequency?: number }): {
        illuminance: number;
        start(): void;
        stop(): void;
        addEventListener(type: string, listener: EventListener): void;
        removeEventListener(type: string, listener: EventListener): void;
      };
    };

    Magnetometer?: {
      new (options?: { frequency?: number }): {
        x: number;
        y: number;
        z: number;
        start(): void;
        stop(): void;
        addEventListener(type: string, listener: EventListener): void;
        removeEventListener(type: string, listener: EventListener): void;
      };
    };

    ProximitySensor?: {
      new (options?: { frequency?: number }): {
        distance: number;
        near: boolean;
        start(): void;
        stop(): void;
        addEventListener(type: string, listener: EventListener): void;
        removeEventListener(type: string, listener: EventListener): void;
      };
    };
  }

  interface Navigator {
    permissions: {
      query(options: { name: string }): Promise<{
        state: 'granted' | 'denied' | 'prompt';
      }>;
    };
  }
}

export {};
