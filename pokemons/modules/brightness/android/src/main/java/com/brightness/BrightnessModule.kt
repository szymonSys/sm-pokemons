package com.brightness

import android.app.Activity
import android.content.Intent
import android.database.ContentObserver
import android.net.Uri
import android.os.Handler
import android.os.Looper
import android.provider.Settings
import com.facebook.react.bridge.ActivityEventListener
import com.facebook.react.bridge.Arguments
import com.facebook.react.bridge.BaseActivityEventListener
import com.facebook.react.bridge.Promise
import com.facebook.react.bridge.ReactApplicationContext
import com.facebook.react.modules.core.DeviceEventManagerModule
import com.facebook.fbreact.specs.NativeBrightnessSpec

class BrightnessModule(reactContext: ReactApplicationContext) :
    NativeBrightnessSpec(reactContext) {

    private var permissionPromise: Promise? = null
    private var listenerCount = 0
    private var brightnessObserver: ContentObserver? = null

    private val activityEventListener: ActivityEventListener = object : BaseActivityEventListener() {
        override fun onActivityResult(activity: Activity, requestCode: Int, resultCode: Int, data: Intent?) {
            if (requestCode == WRITE_SETTINGS_REQUEST_CODE) {
                permissionPromise?.let { promise ->
                    val hasPermission = Settings.System.canWrite(reactApplicationContext)
                    promise.resolve(hasPermission)
                    permissionPromise = null
                }
            }
        }
    }

    init {
        reactContext.addActivityEventListener(activityEventListener)
    }

    private fun createBrightnessObserver(): ContentObserver {
        return object : ContentObserver(Handler(Looper.getMainLooper())) {
            override fun onChange(selfChange: Boolean) {
                super.onChange(selfChange)
                emitBrightnessChange()
            }
        }
    }

    private fun emitBrightnessChange() {
        try {
            val brightness = Settings.System.getInt(
                reactApplicationContext.contentResolver,
                Settings.System.SCREEN_BRIGHTNESS
            )
            val normalizedBrightness = roundToTwoDecimals(brightness.toDouble() / 255.0)
            
            val params = Arguments.createMap().apply {
                putDouble("brightness", normalizedBrightness)
            }
            
            reactApplicationContext
                .getJSModule(DeviceEventManagerModule.RCTDeviceEventEmitter::class.java)
                .emit(BRIGHTNESS_CHANGE_EVENT, params)
        } catch (e: Exception) {
            
        }
    }

    private fun startObserving() {
        if (brightnessObserver == null) {
            brightnessObserver = createBrightnessObserver()
            reactApplicationContext.contentResolver.registerContentObserver(
                Settings.System.getUriFor(Settings.System.SCREEN_BRIGHTNESS),
                false,
                brightnessObserver!!
            )
        }
    }

    private fun stopObserving() {
        brightnessObserver?.let {
            reactApplicationContext.contentResolver.unregisterContentObserver(it)
            brightnessObserver = null
        }
    }

    override fun addListener(eventName: String?) {
        if (eventName == BRIGHTNESS_CHANGE_EVENT) {
            listenerCount++
            if (listenerCount == 1) {
                startObserving()
                emitBrightnessChange()
            }
        }
    }

    override fun removeListeners(count: Double) {
        listenerCount -= count.toInt()
        if (listenerCount <= 0) {
            listenerCount = 0
            stopObserving()
        }
    }

    private fun roundToTwoDecimals(value: Double): Double {
        return Math.round(value * 100.0) / 100.0
    }

    override fun getBrightness(promise: Promise) {
        try {
            val context = reactApplicationContext
            val brightness = Settings.System.getInt(
                context.contentResolver,
                Settings.System.SCREEN_BRIGHTNESS
            )
            // Convert from 0-255 to 0-1 range, rounded to 2 decimal places
            val normalizedBrightness = roundToTwoDecimals(brightness.toDouble() / 255.0)
            promise.resolve(normalizedBrightness)
        } catch (e: Exception) {
            promise.reject("ERROR", "Failed to get brightness: ${e.message}")
        }
    }

    override fun setBrightness(brightness: Double, promise: Promise) {
        try {
            val context = reactApplicationContext
            
            if (!Settings.System.canWrite(context)) {
                promise.reject("PERMISSION_DENIED", "WRITE_SETTINGS permission not granted")
                return
            }
            
            // Round input to 2 decimal places and clamp to 0-1 range
            val normalizedBrightness = roundToTwoDecimals(brightness.coerceIn(0.0, 1.0))
            
            // Convert from 0-1 range to 0-255
            val brightnessValue = (normalizedBrightness * 255.0).toInt()
            
            Settings.System.putInt(
                context.contentResolver,
                Settings.System.SCREEN_BRIGHTNESS,
                brightnessValue
            )
            
            // Return the actual brightness value that was set (in 0-1 range)
            val actualBrightness = roundToTwoDecimals(brightnessValue.toDouble() / 255.0)
            promise.resolve(actualBrightness)
        } catch (e: Exception) {
            promise.reject("ERROR", "Failed to set brightness: ${e.message}")
        }
    }

    override fun hasWriteSettingsPermission(promise: Promise) {
        try {
            val context = reactApplicationContext
            promise.resolve(Settings.System.canWrite(context))
        } catch (e: Exception) {
            promise.reject("ERROR", "Failed to check permission: ${e.message}")
        }
    }

    override fun requestWriteSettingsPermission(promise: Promise) {
        try {
            val context = reactApplicationContext
            
            if (Settings.System.canWrite(context)) {
                promise.resolve(true)
                return
            }

            val currentActivity = currentActivity
            if (currentActivity == null) {
                promise.reject("ERROR", "Activity is not available")
                return
            }

            // Store the promise to resolve it when we get the activity result
            permissionPromise = promise
            
            val intent = Intent(Settings.ACTION_MANAGE_WRITE_SETTINGS).apply {
                data = Uri.parse("package:${context.packageName}")
            }
            currentActivity.startActivityForResult(intent, WRITE_SETTINGS_REQUEST_CODE)
        } catch (e: Exception) {
            permissionPromise = null
            promise.reject("ERROR", "Failed to request permission: ${e.message}")
        }
    }

    override fun invalidate() {
        stopObserving()
        super.invalidate()
    }

    companion object {
        const val NAME =  NativeBrightnessSpec.NAME
        private const val WRITE_SETTINGS_REQUEST_CODE = 1001
        private const val BRIGHTNESS_CHANGE_EVENT = "onBrightnessChange"
    }
}
