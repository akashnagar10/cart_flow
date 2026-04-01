import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import Svg, { Path } from 'react-native-svg';

type DiscountTagProps = {
  value: number | string;
  width?: number;
  height?: number;
  color?: string;
};

const DiscountTag: React.FC<DiscountTagProps> = ({
  value,
  width = 100,
  height = 120,
  color = '#0C748C',
}) => {
  const zigZagHeight = height * 0.2;
  const baseHeight = height - zigZagHeight;
  const r = Math.min(22, width * 0.16);

  // Matches the reference: rounded top corners + a left bookmark point + 3 bottom "teeth".
  const toothCount = 3;
  const leftTailWidth = width * 0.18;
  const toothW = (width - leftTailWidth) / toothCount;

  const bottomSegments: string[] = [];
  for (let i = toothCount - 1; i >= 0; i--) {
    const xValley = leftTailWidth + i * toothW;
    const xPeak = xValley + toothW * 0.5;
    bottomSegments.push(`L ${xPeak} ${height}`);
    bottomSegments.push(`L ${xValley} ${baseHeight}`);
  }

  const d = [
    `M ${r} 0`,
    `H ${width}`,
    `V 0`,
    `V ${baseHeight}`,
    `L ${width} ${baseHeight}`,
    ...bottomSegments,
    `L ${leftTailWidth} ${baseHeight}`,
    `L 0 ${height}`,
    `L 0 ${baseHeight}`,
    `V ${r}`,
    `Q 0 0 ${r} 0`,
    'Z',
  ].join(' ');

  return (
    <View style={[styles.container, { width, height }]}>
      <Svg width={width} height={height}>
        <Path d={d} fill={color} />
      </Svg>

      <View style={[styles.textContainer, { top: height * 0.05, left: width * 0.1 }]}>
        <Text style={[styles.percent, { fontSize: width * 0.38 }]}>{value}%</Text>
        <Text style={[styles.off, { fontSize: width * 0.34 }]}>OFF</Text>
      </View>
    </View>
  );
};

export default DiscountTag;

const styles = StyleSheet.create({
  container: {
    justifyContent: 'center',
    alignItems: 'center',
  },
  textContainer: {
    position: 'absolute',
    alignItems: 'center',
  },
  percent: {
    fontWeight: '900',
    color: '#fff',
    letterSpacing: 1,
  },
  off: {
    fontWeight: '300',
    color: '#fff',
    letterSpacing: 2,
  },
});