import { Platform } from 'react-native';
import notifee, { AndroidImportance, AndroidVisibility, EventType } from '@notifee/react-native';

const NOTIFICATION_ID = 'workout-timer';
const CHANNEL_ID = 'workout-timer-channel-v2';

let startTime = null;
let elapsedBeforePause = 0;
let setCount = 0;
let intervalId = null;
let notifTickCount = 0;
let listeners = [];
let channelReady = false;

function formatElapsed(ms) {
  const totalSeconds = Math.floor(ms / 1000);
  const seconds = totalSeconds % 60;
  const minutes = Math.floor(totalSeconds / 60);
  return {
    minutes: String(minutes).padStart(2, '0'),
    seconds: String(seconds).padStart(2, '0'),
  };
}

function formatClock(t) {
  return `${t.minutes}:${t.seconds}`;
}

function getElapsedMs() {
  return elapsedBeforePause + (startTime ? Date.now() - startTime : 0);
}

function notify() {
  const snapshot = getSnapshot();
  listeners.forEach((fn) => fn(snapshot));
}

export function getSnapshot() {
  return {
    displayTime: formatElapsed(getElapsedMs()),
    isRunning: startTime !== null,
    setCount,
  };
}

export function subscribe(fn) {
  listeners.push(fn);
  return () => {
    listeners = listeners.filter((l) => l !== fn);
  };
}

export async function ensureNotificationSetup() {
  if (Platform.OS !== 'android' || channelReady) return;
  await notifee.requestPermission();
  await notifee.createChannel({
    id: CHANNEL_ID,
    name: 'Workout Timer',
    importance: AndroidImportance.DEFAULT,
    visibility: AndroidVisibility.PUBLIC,
  });
  channelReady = true;
}

async function updateNotification() {
  if (Platform.OS !== 'android') return;
  try {
    await notifee.displayNotification({
      id: NOTIFICATION_ID,
      title: '운동 타이머',
      body: `${formatClock(formatElapsed(getElapsedMs()))} 진행 중 · ${setCount} set`,
      android: {
        channelId: CHANNEL_ID,
        asForegroundService: true,
        ongoing: true,
        colorized: true,
        smallIcon: 'ic_launcher',
        pressAction: { id: 'default' },
        actions: [
          {
            title: 'Stop',
            pressAction: { id: 'stop' },
          },
        ],
      },
    });
  } catch (e) {
    console.log('notification error', e);
  }
}

async function clearNotification() {
  if (Platform.OS !== 'android') return;
  try {
    await notifee.stopForegroundService();
    await notifee.cancelNotification(NOTIFICATION_ID);
  } catch (e) {
    console.log('clear notification error', e);
  }
}

export async function start() {
  await ensureNotificationSetup();
  startTime = Date.now();
  clearInterval(intervalId);
  notifTickCount = 0;
  intervalId = setInterval(() => {
    notify();
    notifTickCount += 1;
    if (notifTickCount % 10 === 0) {
      updateNotification();
    }
  }, 100);
  updateNotification();
  notify();
}

export async function stop() {
  if (startTime) {
    elapsedBeforePause += Date.now() - startTime;
    startTime = null;
  }
  clearInterval(intervalId);
  await clearNotification();
  notify();
}

export async function reset() {
  clearInterval(intervalId);
  startTime = null;
  elapsedBeforePause = 0;
  await clearNotification();
  notify();
}

export function addSet() {
  setCount += 1;
  notify();
}

export async function done() {
  clearInterval(intervalId);
  startTime = null;
  elapsedBeforePause = 0;
  setCount = 0;
  await clearNotification();
  notify();
}

export function handleNotificationEvent({ type, detail }) {
  if (type === EventType.ACTION_PRESS && detail && detail.pressAction && detail.pressAction.id === 'stop') {
    stop();
  }
}
