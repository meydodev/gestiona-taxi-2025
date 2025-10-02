import React, { useEffect } from "react";
import { useIsFocused } from "@react-navigation/native";
import { useSharedValue, withTiming, useAnimatedStyle } from "react-native-reanimated";

function useFocusAnimation() {
  const isFocused = useIsFocused();

  // valor compartido de opacidad
  const opacity = useSharedValue(0);

  // cada vez que la pantalla se enfoca, reinicia animación
  useEffect(() => {
    if (isFocused) {
      opacity.value = 0; // reset
      opacity.value = withTiming(1, { duration: 800 });
    }
  }, [isFocused]);

  const animatedStyle = useAnimatedStyle(() => ({
    opacity: opacity.value,
  }));

  return animatedStyle;
}

export default useFocusAnimation;
