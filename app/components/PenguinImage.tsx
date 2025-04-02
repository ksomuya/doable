import React, { useMemo } from 'react';
import { View, StyleSheet } from 'react-native';
import LottieView from 'lottie-react-native';

interface PenguinImageProps {
  size?: number;
  style?: any;
  animation?: 'waving' | 'excited' | 'walking' | 'writing' | 'sleeping';
  loop?: boolean;
  autoPlay?: boolean;
}

const PenguinImage: React.FC<PenguinImageProps> = ({ 
  size = 240, 
  style, 
  animation = 'waving',
  loop = true,
  autoPlay = true
}) => {
  // Map animation prop to file path using useMemo to avoid unnecessary recalculations
  const animationSource = useMemo(() => {
    switch(animation) {
      case 'waving':
        return require('../../assets/animation/Waving.json');
      case 'excited':
        return require('../../assets/animation/Excited.json');
      case 'walking':
        return require('../../assets/animation/Walking.json');
      case 'writing':
        return require('../../assets/animation/Writing.json');
      case 'sleeping':
        return require('../../assets/animation/Sleeping.json');
      default:
        return require('../../assets/animation/Waving.json');
    }
  }, [animation]);

  // Memoize the container style to avoid recreating the style object on each render
  const containerStyle = useMemo(() => {
    return [
      styles.container, 
      style, 
      { width: size, height: size }
    ];
  }, [style, size]);

  const lottieStyle = useMemo(() => {
    return { width: size, height: size };
  }, [size]);

  return (
    <View style={containerStyle}>
      <LottieView
        source={animationSource}
        style={lottieStyle}
        autoPlay={autoPlay}
        loop={loop}
        resizeMode="contain"
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    justifyContent: 'center',
    alignItems: 'center'
  }
});

export default React.memo(PenguinImage); 