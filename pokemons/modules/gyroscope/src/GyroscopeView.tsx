import { requireNativeView } from 'expo';
import * as React from 'react';

import { GyroscopeViewProps } from './Gyroscope.types';

const NativeView: React.ComponentType<GyroscopeViewProps> =
  requireNativeView('Gyroscope');

export default function GyroscopeView(props: GyroscopeViewProps) {
  return <NativeView {...props} />;
}
