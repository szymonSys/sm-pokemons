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

- (NSNumber *)getBrightness {
  return @([_brightness getBrightness]);
}

- (NSNumber *)setBrightness:(double)brightness {
  return @([_brightness setBrightness:brightness]);
}

- (NSNumber *)hasWriteSettingsPermission {
  return @([_brightness hasWriteSettingsPermission]);
}

- (NSNumber *)requestWriteSettingsPermission {
  return @([_brightness requestWriteSettingsPermission]);
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
