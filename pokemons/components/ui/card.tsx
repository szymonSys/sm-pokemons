import { Animated, StyleSheet, Text } from "react-native";

export function Card({
  animatedStyle,
  name,
}: {
  animatedStyle: any;
  name: string;
}) {
  return (
    <Animated.View style={[styles.card, animatedStyle]}>
      <Text>{name}</Text>
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  card: {
    width: "80%",
    height: "80%",
    backgroundColor: "#ffffff",
    position: "absolute",
    top: 0,
    left: 0,
    borderRadius: 32,
    shadowColor: "#000",
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 20,
  },
});
