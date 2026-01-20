package com.brightnessmodule

import com.facebook.react.TurboReactPackage
import com.facebook.react.bridge.NativeModule
import com.facebook.react.bridge.ReactApplicationContext
import com.facebook.react.module.model.ReactModuleInfo
import com.facebook.react.module.model.ReactModuleInfoProvider

class BrightnessModulePackage : TurboReactPackage() {

    override fun getModule(name: String, reactContext: ReactApplicationContext): NativeModule? {
        return if (name == NativeBrightnessModule.NAME) {
            NativeBrightnessModule(reactContext)
        } else {
            null
        }
    }

    override fun getReactModuleInfoProvider(): ReactModuleInfoProvider {
        return ReactModuleInfoProvider {
            mapOf(
                NativeBrightnessModule.NAME to ReactModuleInfo(
                    NativeBrightnessModule.NAME,
                    NativeBrightnessModule.NAME,
                    false,  // canOverrideExistingModule
                    false,  // needsEagerInit
                    false,  // isCxxModule
                    true    // isTurboModule
                )
            )
        }
    }
}
