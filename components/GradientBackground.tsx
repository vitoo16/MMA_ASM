import React from 'react';
import { ImageBackground, StyleSheet, ViewStyle } from 'react-native';

interface GradientBackgroundProps {
  children: React.ReactNode;
  style?: ViewStyle;
  imageStyle?: any;
}

export function GradientBackground({ children, style, imageStyle }: GradientBackgroundProps) {
  return (
    <ImageBackground
      source={require('../assets/images/Rectangle 189.png')}
      style={[styles.background, style]}
      imageStyle={[styles.imageStyle, imageStyle]}
    >
      {children}
    </ImageBackground>
  );
}

const styles = StyleSheet.create({
  background: {
    overflow: 'hidden',
  },
  imageStyle: {
    resizeMode: 'cover',
  },
});
