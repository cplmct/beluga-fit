import React from 'react';
import { View, Text, StyleSheet } from 'react-native';

export function RestTimerScreen() {
  return (
    <View style={styles.container}>
      <Text style={styles.text}>RestTimerScreen</Text>
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
  },
});
