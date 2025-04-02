import React, { useEffect } from 'react';
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
  // Map animation prop to file path
  const getAnimationSource = () => {
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
  };

  return (
    <View style={[styles.container, style, { width: size, height: size }]}>
      <LottieView
        source={getAnimationSource()}
        style={{ width: size, height: size }}
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

export default PenguinImage; 