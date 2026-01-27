import * as React from 'react';

import { GyroscopeViewProps } from './Gyroscope.types';

export default function GyroscopeView(props: GyroscopeViewProps) {
  return (
    <div>
      <iframe
        style={{ flex: 1 }}
        src={props.url}
        onLoad={() => props.onLoad({ nativeEvent: { url: props.url } })}
      />
    </div>
  );
}
