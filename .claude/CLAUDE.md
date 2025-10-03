# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

This is an Angular 20 application that demonstrates mobile device sensor APIs (accelerometer, gyroscope, magnetometer, light sensor, proximity, compass, and leveler). The app showcases various sensor capabilities using modern web APIs and is designed for mobile devices.

## Key Commands

### Development
```bash
npm start              # Start dev server (ng serve)
npm run watch          # Build with watch mode
npm run build          # Production build (outputs to docs/)
npm test               # Run Karma tests
```

### Build Output
- Production builds output to `docs/` directory (configured for GitHub Pages)
- Base href is set to `/sensors-example/`

## Architecture

### Component Structure
All sensor components follow a consistent pattern:
- Located in `src/app/components/`
- Use inline templates and inline styles (configured in angular.json)
- Implement OnInit/OnDestroy lifecycle hooks for sensor management
- Use signals for reactive state management
- Request permissions before accessing sensors (iOS Safari requirement)

### Routing
- Lazy-loaded components using `loadComponent` pattern
- Routes defined in `src/app/routes.ts`
- All routes redirect unknown paths to `/home`

### Sensor Permission Pattern
Components follow this pattern:
1. Check if sensor API is supported (`supported` signal)
2. Request permission if needed (iOS Safari requires explicit permission)
3. Start/stop sensor listeners in lifecycle hooks
4. Display permission UI if needed

### Type Definitions
Custom sensor API types are defined in `src/types.d.ts`:
- Extended DeviceOrientationEvent with webkit properties
- Window interfaces for AmbientLightSensor, Magnetometer, ProximitySensor
- Permission API types

### Styling
- Global styles in `src/styles.css`
- Component styles are inline (configured in angular.json schematics)
- Responsive design with mobile-first approach

## TypeScript Configuration
- Strict mode enabled with comprehensive type checking
- Target: ES2022
- Module system: preserve
- Strict template checking enabled in Angular compiler options

## Prettier Configuration
- Print width: 100
- Single quotes enabled
- Angular parser for HTML files

## Important Notes
- The app requires HTTPS for most sensor APIs to work
- iOS Safari requires explicit permission via `requestPermission()` methods
- Components use the modern Angular standalone component pattern
- All routes use lazy loading for optimal performance
- The home component displays a grid of available sensor demos with descriptions

## Testing
- Uses Karma + Jasmine
- Test files: `*.spec.ts`
- Configuration in `tsconfig.spec.json`
