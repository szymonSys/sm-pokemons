#import "Brightness.h"

#if __has_include("Brightness/Brightness-Swift.h")
#import "Brightness/Brightness-Swift.h"
#else
#import "Brightness-Swift.h"
#endif

@implementation Brightness {
    NativeBrightness *_brightness;
}

- (instancetype)init{
    self = [super init];
    if(self){
        _brightness = [[NativeBrightness alloc] init];
    }
    return self;
}

- (void)getBrightness:(RCTPromiseResolveBlock)resolve
               reject:(RCTPromiseRejectBlock)reject {
  double brightness = [_brightness getBrightness];
  resolve(@(brightness));
}

- (void)setBrightness:(double)brightness
              resolve:(RCTPromiseResolveBlock)resolve
               reject:(RCTPromiseRejectBlock)reject {
  double result = [_brightness setBrightness:brightness];
  resolve(@(result));
}

- (void)hasWriteSettingsPermission:(RCTPromiseResolveBlock)resolve
                            reject:(RCTPromiseRejectBlock)reject {
  BOOL hasPermission = [_brightness hasWriteSettingsPermission];
  resolve(@(hasPermission));
}

- (void)requestWriteSettingsPermission:(RCTPromiseResolveBlock)resolve
                                reject:(RCTPromiseRejectBlock)reject {
  BOOL granted = [_brightness requestWriteSettingsPermission];
  resolve(@(granted));
}

- (void)addListener:(NSString *)eventName {
  // Events not supported on iOS - handled on Android only
  [_brightness addListener:eventName];
}

- (void)removeListeners:(double)count {
  // Events not supported on iOS - handled on Android only
  [_brightness removeListeners:(int)count];
}

- (std::shared_ptr<facebook::react::TurboModule>)getTurboModule:
    (const facebook::react::ObjCTurboModule::InitParams &)params
{
    return std::make_shared<facebook::react::NativeBrightnessSpecJSI>(params);
}

+ (NSString *)moduleName
{
  return @"Brightness";
}

@end
