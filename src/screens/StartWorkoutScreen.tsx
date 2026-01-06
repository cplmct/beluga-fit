import { View, Text, StyleSheet } from 'react-native';

export function StartWorkoutScreen() {
  return (
    <View style={styles.container}>
      <Text style={styles.text}>Start Workout</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  text: {
    fontSize: 24,
    fontWeight: 'bold',
  },
});