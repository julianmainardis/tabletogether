import React from 'react';
import { View, Text, StyleSheet } from 'react-native';

const NotFound = () => {
  return (
    <View style={styles.container}>
      <Text style={styles.text}>404 - Not Found</Text>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#fff',
  },
  text: {
    fontSize: 24,
    fontWeight: 'bold',
    color: 'red',
  },
});

export default NotFound;
