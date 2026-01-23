package com.brightness

import android.content.Intent
import android.database.ContentObserver
import android.net.Uri
import android.os.Handler
import android.os.Looper
import android.provider.Settings
import com.facebook.react.bridge.Arguments
import com.facebook.react.bridge.ReactApplicationContext
import com.facebook.react.modules.core.DeviceEventManagerModule
import com.facebook.fbreact.specs.NativeBrightnessSpec

class BrightnessModule(reactContext: ReactApplicationContext) :
    NativeBrightnessSpec(reactContext) {

    private var listenerCount = 0
    private var brightnessObserver: ContentObserver? = null

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

    override fun getBrightness(): Double {
        return try {
            val context = reactApplicationContext
            val brightness = Settings.System.getInt(
                context.contentResolver,
                Settings.System.SCREEN_BRIGHTNESS
            )
            // Convert from 0-255 to 0-1 range, rounded to 2 decimal places
            roundToTwoDecimals(brightness.toDouble() / 255.0)
        } catch (e: Exception) {
            -1.0
        }
    }

    override fun setBrightness(brightness: Double): Double {
        return try {
            val context = reactApplicationContext
            
            if (!Settings.System.canWrite(context)) {
                return -1.0 // Indicates permission denied
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
            roundToTwoDecimals(brightnessValue.toDouble() / 255.0)
        } catch (e: Exception) {
            -1.0
        }
    }

    override fun hasWriteSettingsPermission(): Boolean {
        return try {
            val context = reactApplicationContext
            Settings.System.canWrite(context)
        } catch (e: Exception) {
            false
        }
    }

    override fun requestWriteSettingsPermission(): Boolean {
        return try {
            val context = reactApplicationContext
            
            if (Settings.System.canWrite(context)) {
                return true
            }

            val currentActivity = currentActivity
            if (currentActivity == null) {
                return false
            }

            val intent = Intent(Settings.ACTION_MANAGE_WRITE_SETTINGS).apply {
                data = Uri.parse("package:${context.packageName}")
            }
            currentActivity.startActivity(intent)
            
            // Return current permission state (will be false, user needs to check again after granting)
            Settings.System.canWrite(context)
        } catch (e: Exception) {
            false
        }
    }

    override fun invalidate() {
        stopObserving()
        super.invalidate()
    }

    companion object {
        const val NAME = NativeBrightnessSpec.NAME
        private const val BRIGHTNESS_CHANGE_EVENT = "onBrightnessChange"
    }
}
