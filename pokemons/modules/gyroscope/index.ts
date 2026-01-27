// Reexport the native module. On web, it will be resolved to GyroscopeModule.web.ts
// and on native platforms to GyroscopeModule.ts
export { default } from './src/GyroscopeModule';
export { default as GyroscopeView } from './src/GyroscopeView';
export * from  './src/Gyroscope.types';
