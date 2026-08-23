import React, { useState, useEffect } from 'react';
import {
  StyleSheet,
  Text,
  View,
  TouchableOpacity,
  StatusBar,
} from 'react-native';
import {
  SafeAreaProvider,
  useSafeAreaInsets,
} from 'react-native-safe-area-context';
import notifee from '@notifee/react-native';
import * as timerService from './timerService';

function TimerScreen() {
  const insets = useSafeAreaInsets();
  const [state, setState] = useState(timerService.getSnapshot());

  useEffect(() => {
    const unsubscribe = timerService.subscribe(setState);
    timerService.ensureNotificationSetup();
    const unsubscribeForeground = notifee.onForegroundEvent(
      timerService.handleNotificationEvent
    );
    return () => {
      unsubscribe();
      unsubscribeForeground();
    };
  }, []);

  const { displayTime, isRunning, setCount } = state;

  const handleStartStopToggle = () => {
    if (isRunning) {
      timerService.stop();
    } else {
      timerService.start();
    }
  };

  return (
    <View
      style={[
        styles.container,
        { paddingTop: insets.top, paddingBottom: insets.bottom + 16 },
      ]}
    >
      <StatusBar barStyle="dark-content" />

      <View style={styles.timerContainer}>
        <Text style={styles.timerText}>
          {displayTime.minutes}:{displayTime.seconds}
        </Text>
      </View>

      <View style={styles.setContainer}>
        <Text style={styles.setNumber}>{setCount}</Text>
        <Text style={styles.setLabel}>set</Text>
      </View>

      <View style={styles.buttonRow}>
        <TouchableOpacity
          style={[styles.pillButton, isRunning && styles.pillButtonStop]}
          onPress={handleStartStopToggle}
        >
          <Text style={styles.pillButtonText}>
            {isRunning ? 'Stop' : 'Start'}
          </Text>
        </TouchableOpacity>

        <TouchableOpacity style={styles.pillButton} onPress={() => timerService.reset()}>
          <Text style={styles.pillButtonText}>Reset</Text>
        </TouchableOpacity>

        <TouchableOpacity style={styles.pillButton} onPress={() => timerService.addSet()}>
          <Text style={styles.pillButtonText}>Set</Text>
        </TouchableOpacity>
      </View>

      <TouchableOpacity style={styles.doneButton} onPress={() => timerService.done()}>
        <Text style={styles.doneButtonText}>Done</Text>
      </TouchableOpacity>
    </View>
  );
}

export default function App() {
  return (
    <SafeAreaProvider>
      <TimerScreen />
    </SafeAreaProvider>
  );
}

const COLOR_BG = '#f7f7f8';
const COLOR_TEXT = '#111111';
const COLOR_VIOLET = '#8a2be2';
const COLOR_RED = '#f0324c';
const COLOR_BLUE = '#4169e1';
const COLOR_SNOW = '#FFFFFF';

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLOR_BG,
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  timerContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  setContainer: {
    marginBottom: 40,
    alignItems: 'center',
  },
  timerText: {
    color: COLOR_TEXT,
    fontSize: 48,
    fontVariant: ['tabular-nums'],
    fontWeight: '700',
  },
  setNumber: {
    color: COLOR_TEXT,
    fontSize: 36,
    fontWeight: '700',
  },
  setLabel: {
    color: COLOR_TEXT,
    fontSize: 14,
    marginTop: -2,
  },
  buttonRow: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 30,
    paddingHorizontal: 12,
  },
  pillButton: {
    backgroundColor: COLOR_VIOLET,
    borderRadius: 30,
    paddingVertical: 12,
    paddingHorizontal: 14,
    marginHorizontal: 6,
    minWidth: 78,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.15,
    shadowRadius: 6,
    elevation: 3,
  },
  pillButtonStop: {
    backgroundColor: COLOR_RED,
  },
  pillButtonText: {
    color: COLOR_SNOW,
    fontSize: 15,
    fontWeight: '700',
  },
  doneButton: {
    width: 84,
    height: 84,
    borderRadius: 42,
    backgroundColor: COLOR_BLUE,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.2,
    shadowRadius: 6,
    elevation: 4,
  },
  doneButtonText: {
    color: COLOR_SNOW,
    fontSize: 15,
    fontWeight: '700',
  },
});
