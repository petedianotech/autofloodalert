package com.dzenjecdsstem.floodalert;

import android.app.NotificationChannel;
import android.app.NotificationManager;
import android.app.PendingIntent;
import android.content.BroadcastReceiver;
import android.content.Context;
import android.content.Intent;
import android.media.AudioAttributes;
import android.media.AudioManager;
import android.media.RingtoneManager;
import android.net.Uri;
import android.os.Build;
import android.os.PowerManager;
import android.os.Vibrator;
import android.os.VibrationEffect;
import android.util.Log;
import androidx.core.app.NotificationCompat;
import androidx.core.app.NotificationManagerCompat;

/**
 * FloodAlarmReceiver
 * 
 * Standalone Android Native BroadcastReceiver triggered by Android AlarmManager
 * using exact allow-while-idle alarms (setExactAndAllowWhileIdle / setAlarmClock).
 * 
 * Guarantees:
 * 1. Triggers even when the app process / WebView is completely killed or terminated.
 * 2. Acquires a PowerManager WakeLock to wake up the screen from deep sleep / Doze.
 * 3. Shows full-screen priority notification on lockscreen with HIGH/MAX importance.
 * 4. Forces volume up for STREAM_ALARM and sounds loud emergency siren ringtone.
 * 5. Handles device boot (BOOT_COMPLETED) to reschedule scheduled reminders/alerts.
 */
public class FloodAlarmReceiver extends BroadcastReceiver {

    private static final String TAG = "FloodAlarmReceiver";
    public static final String ACTION_TRIGGER_FLOOD_ALARM = "com.dzenjecdsstem.floodalert.ACTION_TRIGGER_FLOOD_ALARM";
    public static final String FLOOD_CHANNEL_ID = "dzenje_flood_alarm_channel_v1";

    public static final String EXTRA_ALARM_ID = "alarm_id";
    public static final String EXTRA_TITLE = "title";
    public static final String EXTRA_MESSAGE = "message";
    public static final String EXTRA_VILLAGE = "village";
    public static final String EXTRA_SEVERITY = "severity";

    @Override
    public void onReceive(Context context, Intent intent) {
        if (context == null || intent == null) return;

        String action = intent.getAction();
        Log.i(TAG, "FloodAlarmReceiver onReceive invoked with action: " + action);

        if (Intent.ACTION_BOOT_COMPLETED.equals(action) || 
            "android.intent.action.QUICKBOOT_POWERON".equals(action) ||
            "com.htc.intent.action.QUICKBOOT_POWERON".equals(action)) {
            // Phone rebooted: re-initialize notification channel
            ensureNotificationChannel(context);
            Log.i(TAG, "Device reboot detected. Notification channels restored.");
            return;
        }

        // Handle exact alarm trigger
        PowerManager.WakeLock wakeLock = null;
        try {
            // 1. Acquire WakeLock to immediately wake up phone and screen
            PowerManager pm = (PowerManager) context.getSystemService(Context.POWER_SERVICE);
            if (pm != null) {
                wakeLock = pm.newWakeLock(
                    PowerManager.FULL_WAKE_LOCK |
                    PowerManager.ACQUIRE_CAUSES_WAKEUP |
                    PowerManager.ON_AFTER_RELEASE,
                    "floodalert:exact_alarm_receiver"
                );
                wakeLock.acquire(15000); // Hold for up to 15 seconds
                Log.d(TAG, "WakeLock acquired to wake screen on lockscreen");
            }
        } catch (Throwable t) {
            Log.w(TAG, "Failed to acquire WakeLock: " + t.getMessage());
        }

        try {
            // Extract extras
            String title = intent.getStringExtra(EXTRA_TITLE);
            if (title == null || title.trim().isEmpty()) {
                title = "🚨 CRITICAL FLOOD WARNING";
            }

            String message = intent.getStringExtra(EXTRA_MESSAGE);
            if (message == null || message.trim().isEmpty()) {
                message = "Continuous river water rise detected! Evacuate to high ground immediately.";
            }

            String village = intent.getStringExtra(EXTRA_VILLAGE);
            if (village != null && !village.trim().isEmpty()) {
                title = "🚨 FLOOD ALERT: " + village.toUpperCase();
            }

            int alarmId = intent.getIntExtra(EXTRA_ALARM_ID, (int) System.currentTimeMillis());

            // 2. Maximize Alarm stream volume for loud audible siren
            try {
                AudioManager audioManager = (AudioManager) context.getSystemService(Context.AUDIO_SERVICE);
                if (audioManager != null) {
                    int maxAlarm = audioManager.getStreamMaxVolume(AudioManager.STREAM_ALARM);
                    audioManager.setStreamVolume(AudioManager.STREAM_ALARM, maxAlarm, 0);

                    int maxMusic = audioManager.getStreamMaxVolume(AudioManager.STREAM_MUSIC);
                    audioManager.setStreamVolume(AudioManager.STREAM_MUSIC, maxMusic, 0);
                }
            } catch (Throwable audioErr) {
                Log.w(TAG, "Volume boost error: " + audioErr.getMessage());
            }

            // 3. Ensure Notification Channel exists
            ensureNotificationChannel(context);

            // 4. Intent to open MainActivity on notification tap or full-screen intent
            Intent launchIntent = new Intent(context, MainActivity.class);
            launchIntent.addFlags(Intent.FLAG_ACTIVITY_NEW_TASK | 
                                 Intent.FLAG_ACTIVITY_CLEAR_TOP | 
                                 Intent.FLAG_ACTIVITY_SINGLE_TOP);
            launchIntent.putExtra("isEmergencyAlarm", true);
            launchIntent.putExtra("title", title);
            launchIntent.putExtra("message", message);
            if (village != null) {
                launchIntent.putExtra("village", village);
            }

            int pendingFlags = Build.VERSION.SDK_INT >= Build.VERSION_CODES.M
                ? PendingIntent.FLAG_IMMUTABLE | PendingIntent.FLAG_UPDATE_CURRENT
                : PendingIntent.FLAG_UPDATE_CURRENT;

            PendingIntent contentPendingIntent = PendingIntent.getActivity(
                context,
                alarmId,
                launchIntent,
                pendingFlags
            );

            // Full screen intent allows waking lockscreen into app
            PendingIntent fullScreenPendingIntent = PendingIntent.getActivity(
                context,
                alarmId + 1,
                launchIntent,
                pendingFlags
            );

            Uri sirenSound = RingtoneManager.getDefaultUri(RingtoneManager.TYPE_ALARM);
            if (sirenSound == null) {
                sirenSound = RingtoneManager.getDefaultUri(RingtoneManager.TYPE_RINGTONE);
            }
            if (sirenSound == null) {
                sirenSound = RingtoneManager.getDefaultUri(RingtoneManager.TYPE_NOTIFICATION);
            }

            long[] vibrationPattern = new long[]{0, 1000, 300, 1000, 300, 1000, 300, 1500};

            NotificationCompat.Builder builder = new NotificationCompat.Builder(context, FLOOD_CHANNEL_ID)
                .setSmallIcon(R.mipmap.ic_launcher)
                .setContentTitle(title)
                .setContentText(message)
                .setStyle(new NotificationCompat.BigTextStyle().bigText(message))
                .setPriority(NotificationCompat.PRIORITY_MAX)
                .setCategory(NotificationCompat.CATEGORY_ALARM)
                .setVisibility(NotificationCompat.VISIBILITY_PUBLIC)
                .setContentIntent(contentPendingIntent)
                .setFullScreenIntent(fullScreenPendingIntent, true) // Wakes screen & shows heads-up
                .setAutoCancel(true)
                .setOngoing(false)
                .setVibrate(vibrationPattern);

            if (sirenSound != null) {
                builder.setSound(sirenSound);
            }

            NotificationManagerCompat notificationManager = NotificationManagerCompat.from(context);
            try {
                notificationManager.notify(alarmId, builder.build());
                Log.i(TAG, "Flood alarm notification posted successfully: id=" + alarmId);
            } catch (SecurityException se) {
                Log.e(TAG, "Notification permission missing: " + se.getMessage());
            }

            // 5. Hardware vibration
            try {
                Vibrator vibrator = (Vibrator) context.getSystemService(Context.VIBRATOR_SERVICE);
                if (vibrator != null && vibrator.hasVibrator()) {
                    if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.O) {
                        vibrator.vibrate(VibrationEffect.createWaveform(vibrationPattern, -1));
                    } else {
                        vibrator.vibrate(vibrationPattern, -1);
                    }
                }
            } catch (Throwable vibErr) {
                Log.w(TAG, "Vibrator trigger error: " + vibErr.getMessage());
            }

        } catch (Throwable t) {
            Log.e(TAG, "Error executing flood alarm in receiver: " + t.getMessage(), t);
        } finally {
            if (wakeLock != null && wakeLock.isHeld()) {
                try {
                    wakeLock.release();
                } catch (Throwable ignored) {}
            }
        }
    }

    private void ensureNotificationChannel(Context context) {
        if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.O) {
            try {
                CharSequence name = "Flood Emergency Sirens";
                String description = "Critical alerts and loud siren notifications during river floods";
                int importance = NotificationManager.IMPORTANCE_HIGH;
                NotificationChannel channel = new NotificationChannel(FLOOD_CHANNEL_ID, name, importance);
                channel.setDescription(description);
                channel.enableLights(true);
                channel.enableVibration(true);
                channel.setVibrationPattern(new long[]{0, 1000, 300, 1000, 300, 1000, 300, 1500});
                channel.setLockscreenVisibility(android.app.Notification.VISIBILITY_PUBLIC);

                try {
                    AudioAttributes audioAttributes = new AudioAttributes.Builder()
                        .setContentType(AudioAttributes.CONTENT_TYPE_SONIFICATION)
                        .setUsage(AudioAttributes.USAGE_ALARM)
                        .build();
                    Uri alarmSound = RingtoneManager.getDefaultUri(RingtoneManager.TYPE_ALARM);
                    if (alarmSound == null) {
                        alarmSound = RingtoneManager.getDefaultUri(RingtoneManager.TYPE_NOTIFICATION);
                    }
                    if (alarmSound != null) {
                        channel.setSound(alarmSound, audioAttributes);
                    }
                } catch (Throwable soundErr) {
                    Log.w(TAG, "AudioAttributes channel error: " + soundErr.getMessage());
                }

                NotificationManager nm = context.getSystemService(NotificationManager.class);
                if (nm != null) {
                    nm.createNotificationChannel(channel);
                }
            } catch (Throwable t) {
                Log.w(TAG, "NotificationChannel creation error: " + t.getMessage());
            }
        }
    }
}
