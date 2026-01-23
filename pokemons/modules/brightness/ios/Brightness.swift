//
//  NativeBrightnessModule.swift
//  pokemons
//
//  Created by szymosys on 22/01/2026.
//

import Foundation
import UIKit

@objcMembers
public class NativeBrightness: NSObject {
    
    public override init() {
        super.init()
    }
    
    public func getBrightness() -> Double {
        return roundToTwoDecimals(Double(UIScreen.main.brightness))
    }
    
    public func setBrightness(_ brightness: Double) -> Double {
        let clampedBrightness = min(max(brightness, 0.0), 1.0)
        let roundedBrightness = roundToTwoDecimals(clampedBrightness)

        DispatchQueue.main.async {
            UIScreen.main.brightness = CGFloat(roundedBrightness)
        }
        
        return roundedBrightness
    }
    
    public func hasWriteSettingsPermission() -> Bool {
        return true
    }
    
    public func requestWriteSettingsPermission() -> Bool {
        return true
    }
    
    public func addListener(_ eventName: String) {
        // Events not supported on iOS - handled on Android only
    }

    public func removeListeners(_ count: Int) {
        // Events not supported on iOS - handled on Android only
    }

    private func roundToTwoDecimals(_ value: Double) -> Double {
        return (value * 100.0).rounded() / 100.0
    }
}
