package expo.modules.gyroscope

import android.content.Context
import android.hardware.Sensor

import android.hardware.SensorEvent
import android.hardware.SensorEventListener
import android.hardware.SensorManager
import expo.modules.kotlin.modules.Module
import expo.modules.kotlin.modules.ModuleDefinition
import expo.modules.kotlin.Promise
import java.net.URL

class GyroscopeModule : Module(), SensorEventListener {
  private var sensorManager: SensorManager? = null
  private var gyroscopeSensor: Sensor? = null
  private var rotationVectorSensor: Sensor? = null
  
  private var updateInterval: Int = 100000 // Default 100ms in microseconds
  private var isRunning = false
  
  // Current sensor values
  private var quaternion = FloatArray(4)        // x, y, z, w
  private var rotationMatrix = FloatArray(9)    // 3x3 rotation matrix
  private var orientationAngles = FloatArray(3) // yaw, pitch, roll
  
  // Timestamps for throttling
  private var lastUpdateTime: Long = 0
  
  private val context: Context
    get() = requireNotNull(appContext.reactContext)
  
  // Each module class must implement the definition function. The definition consists of components
  // that describes the module's functionality and behavior.
  // See https://docs.expo.dev/modules/module-api for more details about available components.
  override fun definition() = ModuleDefinition {
    // Sets the name of the module that JavaScript code will use to refer to the module. Takes a string as an argument.
    // Can be inferred from module's class name, but it's recommended to set it explicitly for clarity.
    // The module will be accessible from `requireNativeModule('Gyroscope')` in JavaScript.
    Name("Gyroscope")


    // Defines event names that the module can send to JavaScript.
    Events("onGyroscopeUpdate")
    
    // Check if gyroscope sensors are available
    Function("isGyroscopeAvailable") {
      initSensorManager()
      gyroscopeSensor != null || rotationVectorSensor != null
    }
    
    // Set update interval in milliseconds
    Function("setUpdateInterval") { intervalMs: Double ->
      updateInterval = (intervalMs * 1000).toInt() // Convert ms to microseconds
    }
    
    // Start gyroscope updates
    AsyncFunction("startGyroscopeUpdates") { promise: Promise ->
      try {
        initSensorManager()
        
        val manager = sensorManager
        if (manager == null) {
          promise.reject("SENSOR_ERROR", "Could not access sensor manager", null)
          return@AsyncFunction
        }
        
        if (gyroscopeSensor == null && rotationVectorSensor == null) {
          promise.reject("GYROSCOPE_UNAVAILABLE", "Gyroscope sensors are not available on this device", null)
          return@AsyncFunction
        }
        
        // Register listeners for available sensors
        gyroscopeSensor?.let {
          manager.registerListener(this@GyroscopeModule, it, updateInterval)
        }
        rotationVectorSensor?.let {
          manager.registerListener(this@GyroscopeModule, it, updateInterval)
        }
        
        isRunning = true
        promise.resolve(true)
      } catch (e: Exception) {
        promise.reject("GYROSCOPE_ERROR", e.message ?: "Unknown error starting gyroscope", e)
      }
    }
    
    // Stop gyroscope updates
    Function("stopGyroscopeUpdates") {
      sensorManager?.unregisterListener(this@GyroscopeModule)
      isRunning = false
    }

    // Enables the module to be used as a native view. Definition components that are accepted as part of
    // the view definition: Prop, Events.
    View(GyroscopeView::class) {
      // Defines a setter for the `url` prop.
      Prop("url") { view: GyroscopeView, url: URL ->
        view.webView.loadUrl(url.toString())
      }
      // Defines an event that the view can send to JavaScript.
      Events("onLoad")
    }
  }
  
  private fun initSensorManager() {
    if (sensorManager == null) {
      sensorManager = context.getSystemService(Context.SENSOR_SERVICE) as SensorManager
      gyroscopeSensor = sensorManager?.getDefaultSensor(Sensor.TYPE_GYROSCOPE)
      rotationVectorSensor = sensorManager?.getDefaultSensor(Sensor.TYPE_ROTATION_VECTOR)
    }
  }
  
  override fun onSensorChanged(event: SensorEvent?) {
    if (event == null || !isRunning) return
    
    when (event.sensor.type) {
      Sensor.TYPE_ROTATION_VECTOR -> {
        // Store quaternion values directly from rotation vector
        // event.values: [x*sin(θ/2), y*sin(θ/2), z*sin(θ/2), cos(θ/2), accuracy]
        quaternion[0] = event.values[0] // x
        quaternion[1] = event.values[1] // y
        quaternion[2] = event.values[2] // z
        quaternion[3] = if (event.values.size > 3) event.values[3] else {
          // Calculate w if not provided: w = sqrt(1 - x² - y² - z²)
          val x = event.values[0]
          val y = event.values[1]
          val z = event.values[2]
          // Clamp before sqrt to avoid NaN from floating-point errors
          kotlin.math.sqrt((1f - x*x - y*y - z*z).coerceAtLeast(0f))
        }
        
        // Also compute Euler angles via rotation matrix
        SensorManager.getRotationMatrixFromVector(rotationMatrix, event.values)
        SensorManager.getOrientation(rotationMatrix, orientationAngles)
      }
    }
    
    // Throttle updates based on update interval
    val currentTime = System.currentTimeMillis()
    if (currentTime - lastUpdateTime >= updateInterval / 1000) {
      lastUpdateTime = currentTime
      sendGyroscopeUpdate(event.timestamp)
    }
  }
  
  override fun onAccuracyChanged(sensor: Sensor?, accuracy: Int) {
    // Not needed for this implementation
  }
  
  private fun sendGyroscopeUpdate(timestamp: Long) {
    sendEvent("onGyroscopeUpdate", mapOf(
      "quaternion" to mapOf(
        "x" to quaternion[0].toDouble(),
        "y" to quaternion[1].toDouble(),
        "z" to quaternion[2].toDouble(),
        "w" to quaternion[3].toDouble()
      ),
      "attitude" to mapOf(
        "roll" to orientationAngles[2].toDouble(),
        "pitch" to orientationAngles[1].toDouble(),
        "yaw" to orientationAngles[0].toDouble()
      ),
      "timestamp" to (timestamp / 1000000.0) // Convert nanoseconds to seconds
    ))
  }
}
