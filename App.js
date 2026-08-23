import React, { useState, useRef, useEffect, useCallback } from 'react';
import {
  StyleSheet,
  Text,
  View,
  TouchableOpacity,
  AppState,
  StatusBar,
  Platform,
} from 'react-native';
import {
  SafeAreaProvider,
  useSafeAreaInsets,
} from 'react-native-safe-area-context';
import notifee, { AndroidImportance, AndroidVisibility } from '@notifee/react-native';

const NOTIFICATION_ID = 'workout-timer';
const CHANNEL_ID = 'workout-timer-channel';

function formatElapsed(ms) {
  const totalSeconds = Math.floor(ms / 1000);
  const seconds = totalSeconds % 60;
  const minutes = Math.floor(totalSeconds / 60);
  return {
    minutes: String(minutes).padStart(2, '0'),
    seconds: String(seconds).padStart(2, '0'),
  };
}

function formatClock({ minutes, seconds }) {
  return `${minutes}:${seconds}`;
}

function TimerScreen() {
  const insets = useSafeAreaInsets();
  const [displayTime, setDisplayTime] = useState({ minutes: '00', seconds: '00' });
  const [isRunning, setIsRunning] = useState(false);
  const [setCount, setSetCount] = useState(0);

  const startTimeRef = useRef(null);
  const elapsedBeforePauseRef = useRef(0);
  const intervalRef = useRef(null);
  const appState = useRef(AppState.currentState);

  useEffect(() => {
    if (Platform.OS !== 'android') return;
    (async () => {
      await notifee.requestPermission();
      await notifee.createChannel({
        id: CHANNEL_ID,
        name: 'Workout Timer',
        importance: AndroidImportance.LOW,
        visibility: AndroidVisibility.PUBLIC,
      });
    })();
    return () => {
      notifee.stopForegroundService();
    };
  }, []);

  const updateNotification = useCallback(async (timeObj, currentSetCount) => {
    if (Platform.OS !== 'android') return;
    try {
      await notifee.displayNotification({
        id: NOTIFICATION_ID,
        title: '운동 타이머',
        body: `${formatClock(timeObj)} 진행 중 · ${currentSetCount} set`,
        android: {
          channelId: CHANNEL_ID,
          asForegroundService: true,
          ongoing: true,
          colorized: true,
          smallIcon: 'ic_launcher',
          pressAction: { id: 'default' },
        },
      });
    } catch (e) {
      console.log('notification error', e);
    }
  }, []);

  const clearNotification = useCallback(async () => {
    if (Platform.OS !== 'android') return;
    try {
      await notifee.stopForegroundService();
      await notifee.cancelNotification(NOTIFICATION_ID);
    } catch (e) {
      console.log('clear notification error', e);
    }
  }, []);

  const tick = useCallback(() => {
    const now = Date.now();
    const elapsed =
      elapsedBeforePauseRef.current +
      (startTimeRef.current ? now - startTimeRef.current : 0);
    const timeObj = formatElapsed(elapsed);
    setDisplayTime(timeObj);
    return timeObj;
  }, []);

  const handleStart = async () => {
    startTimeRef.current = Date.now();
    setIsRunning(true);
    clearInterval(intervalRef.current);

    let notifTickCount = 0;
    intervalRef.current = setInterval(() => {
      const timeObj = tick();
      notifTickCount += 1;
      if (notifTickCount % 10 === 0) {
        updateNotification(timeObj, setCount);
      }
    }, 100);

    updateNotification(formatElapsed(elapsedBeforePauseRef.current), setCount);
  };

  const handleStop = async () => {
    if (startTimeRef.current) {
      elapsedBeforePauseRef.current += Date.now() - startTimeRef.current;
      startTimeRef.current = null;
    }
    setIsRunning(false);
    clearInterval(intervalRef.current);
    await clearNotification();
  };

  const handleStartStopToggle = () => {
    if (isRunning) {
      handleStop();
    } else {
      handleStart();
    }
  };

  const handleReset = async () => {
    clearInterval(intervalRef.current);
    startTimeRef.current = null;
    elapsedBeforePauseRef.current = 0;
    setIsRunning(false);
    setDisplayTime(formatElapsed(0));
    await clearNotification();
  };

  const handleSet = () => {
    setSetCount((prev) => prev + 1);
  };

  const handleDone = async () => {
    clearInterval(intervalRef.current);
    startTimeRef.current = null;
    elapsedBeforePauseRef.current = 0;
    setIsRunning(false);
    setDisplayTime(formatElapsed(0));
    setSetCount(0);
    await clearNotification();
  };

  useEffect(() => {
    const subscription = AppState.addEventListener('change', (nextState) => {
      if (
        appState.current.match(/inactive|background/) &&
        nextState === 'active' &&
        isRunning
      ) {
        tick();
      }
      appState.current = nextState;
    });
    return () => subscription.remove();
  }, [isRunning, tick]);

  useEffect(() => {
    return () => clearInterval(intervalRef.current);
  }, []);

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

        <TouchableOpacity style={styles.pillButton} onPress={handleReset}>
          <Text style={styles.pillButtonText}>Reset</Text>
        </TouchableOpacity>

        <TouchableOpacity style={styles.pillButton} onPress={handleSet}>
          <Text style={styles.pillButtonText}>Set</Text>
        </TouchableOpacity>
      </View>

      <TouchableOpacity style={styles.doneButton} onPress={handleDone}>
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
