import ExpoModulesCore
import CoreMotion

public class GyroscopeModule: Module {
  private let motionManager = CMMotionManager()
  private var updateInterval: Double = 0.1 // Default 100ms
  
  // Each module class must implement the definition function. The definition consists of components
  // that describes the module's functionality and behavior.
  // See https://docs.expo.dev/modules/module-api for more details about available components.
  public func definition() -> ModuleDefinition {
    // Sets the name of the module that JavaScript code will use to refer to the module. Takes a string as an argument.
    // Can be inferred from module's class name, but it's recommended to set it explicitly for clarity.
    // The module will be accessible from `requireNativeModule('Gyroscope')` in JavaScript.
    Name("Gyroscope")

    // Defines event names that the module can send to JavaScript.
    Events("onGyroscopeUpdate")

    // Check if device motion is available
    Function("isGyroscopeAvailable") {
      return self.motionManager.isDeviceMotionAvailable
    }
    
    // Set update interval in milliseconds
    Function("setUpdateInterval") { (intervalMs: Double) in
      self.updateInterval = intervalMs / 1000.0 // Convert ms to seconds
      self.motionManager.deviceMotionUpdateInterval = self.updateInterval
    }
    
    // Start gyroscope updates using device motion
    AsyncFunction("startGyroscopeUpdates") { (promise: Promise) in
      guard self.motionManager.isDeviceMotionAvailable else {
        promise.reject("GYROSCOPE_UNAVAILABLE", "Device motion is not available on this device")
        return
      }
      
      self.motionManager.deviceMotionUpdateInterval = self.updateInterval
      
      self.motionManager.startDeviceMotionUpdates(using: .xMagneticNorthZVertical, to: .main) { [weak self] (motion, error) in
        guard let self = self else { return }
        
        if let error = error {
          self.sendEvent("onGyroscopeUpdate", [
            "error": error.localizedDescription
          ])
          return
        }
        
        guard let motion = motion else { return }
        
        let attitude = motion.attitude
        let q = attitude.quaternion
        
        self.sendEvent("onGyroscopeUpdate", [
          "quaternion": [
            "x": q.x,
            "y": q.y,
            "z": q.z,
            "w": q.w,
          ],
          "attitude": [
            "roll": attitude.roll,
            "pitch": attitude.pitch,
            "yaw": attitude.yaw,
          ],
          "timestamp": motion.timestamp
        ])
      }
      
      promise.resolve(true)
    }
    
    // Stop gyroscope updates
    Function("stopGyroscopeUpdates") {
      self.motionManager.stopDeviceMotionUpdates()
    }

    // Enables the module to be used as a native view. Definition components that are accepted as part of the
    // view definition: Prop, Events.
    View(GyroscopeView.self) {
      // Defines a setter for the `url` prop.
      Prop("url") { (view: GyroscopeView, url: URL) in
        if view.webView.url != url {
          view.webView.load(URLRequest(url: url))
        }
      }

      Events("onLoad")
    }
  }
}
