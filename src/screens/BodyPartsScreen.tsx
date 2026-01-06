import React from 'react';
import { View, Text, StyleSheet } from 'react-native';

export function BodyPartsScreen() {
  return (
    <View style={styles.container}>
      <Text style={styles.text}>BodyPartsScreen</Text>
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
