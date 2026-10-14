package com.petediano.autofloodalert;

import android.app.PendingIntent;
import android.content.Context;
import android.content.Intent;
import android.media.AudioManager;
import android.media.RingtoneManager;
import android.net.Uri;
import android.os.Build;
import android.os.PowerManager;
import android.os.Vibrator;
import android.os.VibrationEffect;
import android.provider.Settings;
import android.util.Log;
import androidx.core.app.NotificationCompat;
import androidx.core.app.NotificationManagerCompat;
import com.getcapacitor.JSObject;
import com.getcapacitor.Plugin;
import com.getcapacitor.PluginCall;
import com.getcapacitor.PluginMethod;
import com.getcapacitor.annotation.CapacitorPlugin;

@CapacitorPlugin(name = "NativePowerHelper")
public class NativePowerHelperPlugin extends Plugin {

    private static final String TAG = "NativePowerHelper";

    @PluginMethod
    public void isBatteryOptimized(PluginCall call) {
        try {
            Context context = getContext();
            if (context != null && Build.VERSION.SDK_INT >= Build.VERSION_CODES.M) {
                PowerManager pm = (PowerManager) context.getSystemService(Context.POWER_SERVICE);
                boolean isIgnoring = pm != null && pm.isIgnoringBatteryOptimizations(context.getPackageName());
                JSObject ret = new JSObject();
                ret.put("isIgnoringBatteryOptimizations", isIgnoring);
                call.resolve(ret);
                return;
            }
            JSObject ret = new JSObject();
            ret.put("isIgnoringBatteryOptimizations", true);
            call.resolve(ret);
        } catch (Throwable e) {
            JSObject ret = new JSObject();
            ret.put("isIgnoringBatteryOptimizations", true);
            call.resolve(ret);
        }
    }

    @PluginMethod
    public void requestDisableBatteryOptimization(PluginCall call) {
        try {
            Context context = getContext();
            if (context != null && Build.VERSION.SDK_INT >= Build.VERSION_CODES.M) {
                PowerManager pm = (PowerManager) context.getSystemService(Context.POWER_SERVICE);
                if (pm != null && !pm.isIgnoringBatteryOptimizations(context.getPackageName())) {
                    Intent intent = new Intent(Settings.ACTION_REQUEST_IGNORE_BATTERY_OPTIMIZATIONS);
                    intent.setData(Uri.parse("package:" + context.getPackageName()));
                    intent.addFlags(Intent.FLAG_ACTIVITY_NEW_TASK);
                    context.startActivity(intent);
                    JSObject ret = new JSObject();
                    ret.put("requested", true);
                    call.resolve(ret);
                    return;
                }
            }
            JSObject ret = new JSObject();
            ret.put("requested", false);
            call.resolve(ret);
        } catch (Throwable e) {
            try {
                Context context = getContext();
                if (context != null) {
                    Intent intent = new Intent(Settings.ACTION_IGNORE_BATTERY_OPTIMIZATION_SETTINGS);
                    intent.addFlags(Intent.FLAG_ACTIVITY_NEW_TASK);
                    context.startActivity(intent);
                    JSObject ret = new JSObject();
                    ret.put("requested", true);
                    call.resolve(ret);
                    return;
                }
            } catch (Throwable ignored) {}
            call.reject("Could not open battery settings");
        }
    }

    @PluginMethod
    public void areNotificationsEnabled(PluginCall call) {
        try {
            Context context = getContext();
            boolean areEnabled = context != null && NotificationManagerCompat.from(context).areNotificationsEnabled();
            JSObject ret = new JSObject();
            ret.put("enabled", areEnabled);
            call.resolve(ret);
        } catch (Throwable e) {
            JSObject ret = new JSObject();
            ret.put("enabled", true);
            call.resolve(ret);
        }
    }

    @PluginMethod
    public void openNotificationSettings(PluginCall call) {
        try {
            Context context = getContext();
            if (context != null) {
                Intent intent = new Intent();
                if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.O) {
                    intent.setAction(Settings.ACTION_APP_NOTIFICATION_SETTINGS);
                    intent.putExtra(Settings.EXTRA_APP_PACKAGE, context.getPackageName());
                } else {
                    intent.setAction(Settings.ACTION_APPLICATION_DETAILS_SETTINGS);
                    intent.setData(Uri.parse("package:" + context.getPackageName()));
                }
                intent.addFlags(Intent.FLAG_ACTIVITY_NEW_TASK);
                context.startActivity(intent);
                JSObject ret = new JSObject();
                ret.put("opened", true);
                call.resolve(ret);
                return;
            }
        } catch (Throwable e) {
            Log.w(TAG, "openNotificationSettings error", e);
        }
        call.reject("Could not open notification settings");
    }

    @PluginMethod
    public void boostSystemAlarmVolume(PluginCall call) {
        try {
            Context context = getContext();
            if (context != null) {
                AudioManager audioManager = (AudioManager) context.getSystemService(Context.AUDIO_SERVICE);
                if (audioManager != null) {
                    audioManager.setStreamVolume(AudioManager.STREAM_ALARM, audioManager.getStreamMaxVolume(AudioManager.STREAM_ALARM), 0);
                    audioManager.setStreamVolume(AudioManager.STREAM_MUSIC, audioManager.getStreamMaxVolume(AudioManager.STREAM_MUSIC), 0);
                    JSObject ret = new JSObject();
                    ret.put("boosted", true);
                    call.resolve(ret);
                    return;
                }
            }
        } catch (Throwable e) {
            Log.w(TAG, "boostSystemAlarmVolume error", e);
        }
        JSObject ret = new JSObject();
        ret.put("boosted", false);
        call.resolve(ret);
    }

    @PluginMethod
    public void showNativeFloodAlert(PluginCall call) {
        try {
            Context context = getContext();
            if (context == null) {
                call.reject("Null context");
                return;
            }
            String title = call.getString("title", "FLOOD WARNING ALERT");
            String body = call.getString("body", "Continuous river rise detected! Evacuate to high ground immediately.");
            try {
                AudioManager audioManager = (AudioManager) context.getSystemService(Context.AUDIO_SERVICE);
                if (audioManager != null) {
                    audioManager.setStreamVolume(AudioManager.STREAM_ALARM, audioManager.getStreamMaxVolume(AudioManager.STREAM_ALARM), 0);
                    audioManager.setStreamVolume(AudioManager.STREAM_MUSIC, audioManager.getStreamMaxVolume(AudioManager.STREAM_MUSIC), 0);
                }
            } catch (Throwable ignored) {}

            Intent intent = new Intent(context, MainActivity.class);
            intent.addFlags(Intent.FLAG_ACTIVITY_CLEAR_TOP | Intent.FLAG_ACTIVITY_SINGLE_TOP);
            PendingIntent pendingIntent = PendingIntent.getActivity(
                    context, 0, intent,
                    Build.VERSION.SDK_INT >= Build.VERSION_CODES.M
                            ? PendingIntent.FLAG_IMMUTABLE | PendingIntent.FLAG_UPDATE_CURRENT
                            : PendingIntent.FLAG_UPDATE_CURRENT);

            Uri alarmSound = RingtoneManager.getDefaultUri(RingtoneManager.TYPE_ALARM);
            if (alarmSound == null) alarmSound = RingtoneManager.getDefaultUri(RingtoneManager.TYPE_NOTIFICATION);

            NotificationCompat.Builder builder = new NotificationCompat.Builder(context, MainActivity.FLOOD_CHANNEL_ID)
                    .setSmallIcon(R.mipmap.ic_launcher)
                    .setContentTitle(title)
                    .setContentText(body)
                    .setStyle(new NotificationCompat.BigTextStyle().bigText(body))
                    .setPriority(NotificationCompat.PRIORITY_MAX)
                    .setCategory(NotificationCompat.CATEGORY_ALARM)
                    .setVisibility(NotificationCompat.VISIBILITY_PUBLIC)
                    .setContentIntent(pendingIntent)
                    .setAutoCancel(true)
                    .setVibrate(new long[]{0, 1000, 300, 1000, 300, 1000});
            if (alarmSound != null) builder.setSound(alarmSound);

            try {
                NotificationManagerCompat.from(context).notify((int) System.currentTimeMillis(), builder.build());
            } catch (SecurityException se) {
                Log.w(TAG, "Notification permission missing", se);
            }

            try {
                Vibrator v = (Vibrator) context.getSystemService(Context.VIBRATOR_SERVICE);
                if (v != null && v.hasVibrator()) {
                    if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.O) {
                        v.vibrate(VibrationEffect.createWaveform(new long[]{0, 1000, 300, 1000, 300, 1000}, -1));
                    } else {
                        v.vibrate(new long[]{0, 1000, 300, 1000, 300, 1000}, -1);
                    }
                }
            } catch (Throwable ignored) {}

            JSObject ret = new JSObject();
            ret.put("notified", true);
            call.resolve(ret);
        } catch (Throwable e) {
            Log.w(TAG, "showNativeFloodAlert error", e);
            call.reject("Failed to show native notification",
                    e instanceof Exception ? (Exception) e : new Exception(e));
        }
    }

    @PluginMethod
    public void canScheduleExactAlarms(PluginCall call) {
        try {
            Context context = getContext();
            boolean canSchedule = true;
            if (context != null && Build.VERSION.SDK_INT >= Build.VERSION_CODES.S) {
                android.app.AlarmManager alarmManager = (android.app.AlarmManager) context.getSystemService(Context.ALARM_SERVICE);
                canSchedule = alarmManager != null && alarmManager.canScheduleExactAlarms();
            }
            JSObject ret = new JSObject();
            ret.put("canSchedule", canSchedule);
            call.resolve(ret);
        } catch (Throwable e) {
            JSObject ret = new JSObject();
            ret.put("canSchedule", true);
            call.resolve(ret);
        }
    }

    @PluginMethod
    public void openExactAlarmSettings(PluginCall call) {
        try {
            Context context = getContext();
            if (context != null && Build.VERSION.SDK_INT >= Build.VERSION_CODES.S) {
                Intent intent = new Intent(Settings.ACTION_REQUEST_SCHEDULE_EXACT_ALARM);
                intent.setData(Uri.parse("package:" + context.getPackageName()));
                intent.addFlags(Intent.FLAG_ACTIVITY_NEW_TASK);
                context.startActivity(intent);
                JSObject ret = new JSObject();
                ret.put("opened", true);
                call.resolve(ret);
                return;
            }
        } catch (Throwable e) {
            Log.w(TAG, "openExactAlarmSettings error: " + e.getMessage());
        }
        JSObject ret = new JSObject();
        ret.put("opened", false);
        call.resolve(ret);
    }

    @PluginMethod
    public void scheduleExactFloodAlarm(PluginCall call) {
        try {
            Context context = getContext();
            if (context == null) {
                call.reject("Null context");
                return;
            }
            int alarmId = call.getInt("alarmId", (int) (System.currentTimeMillis() % 100000));
            long triggerAtMillis = call.getLong("triggerAtMillis", System.currentTimeMillis() + 5000);
            String title = call.getString("title", "CRITICAL FLOOD WARNING");
            String message = call.getString("message", "Continuous river rise detected! Evacuate immediately.");
            String village = call.getString("village", "Dzenje Village");

            Intent intent = new Intent(context, FloodAlarmReceiver.class);
            intent.setAction(FloodAlarmReceiver.ACTION_TRIGGER_FLOOD_ALARM);
            intent.putExtra(FloodAlarmReceiver.EXTRA_ALARM_ID, alarmId);
            intent.putExtra(FloodAlarmReceiver.EXTRA_TITLE, title);
            intent.putExtra(FloodAlarmReceiver.EXTRA_MESSAGE, message);
            intent.putExtra(FloodAlarmReceiver.EXTRA_VILLAGE, village);

            int pendingFlags = Build.VERSION.SDK_INT >= Build.VERSION_CODES.M
                    ? PendingIntent.FLAG_IMMUTABLE | PendingIntent.FLAG_UPDATE_CURRENT
                    : PendingIntent.FLAG_UPDATE_CURRENT;

            PendingIntent pendingIntent = PendingIntent.getBroadcast(context, alarmId, intent, pendingFlags);
            android.app.AlarmManager alarmManager = (android.app.AlarmManager) context.getSystemService(Context.ALARM_SERVICE);
            if (alarmManager == null) {
                call.reject("AlarmManager service unavailable");
                return;
            }

            if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.M) {
                alarmManager.setExactAndAllowWhileIdle(android.app.AlarmManager.RTC_WAKEUP, triggerAtMillis, pendingIntent);
            } else if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.KITKAT) {
                alarmManager.setExact(android.app.AlarmManager.RTC_WAKEUP, triggerAtMillis, pendingIntent);
            } else {
                alarmManager.set(android.app.AlarmManager.RTC_WAKEUP, triggerAtMillis, pendingIntent);
            }

            JSObject ret = new JSObject();
            ret.put("scheduled", true);
            ret.put("alarmId", alarmId);
            ret.put("triggerAtMillis", triggerAtMillis);
            call.resolve(ret);
        } catch (SecurityException se) {
            call.reject("SCHEDULE_EXACT_ALARM permission required: " + se.getMessage());
        } catch (Throwable t) {
            call.reject("Failed to schedule alarm: " + t.getMessage());
        }
    }

    @PluginMethod
    public void cancelExactFloodAlarm(PluginCall call) {
        try {
            Context context = getContext();
            if (context == null) {
                call.reject("Null context");
                return;
            }
            int alarmId = call.getInt("alarmId", 0);
            Intent intent = new Intent(context, FloodAlarmReceiver.class);
            intent.setAction(FloodAlarmReceiver.ACTION_TRIGGER_FLOOD_ALARM);
            int pendingFlags = Build.VERSION.SDK_INT >= Build.VERSION_CODES.M
                    ? PendingIntent.FLAG_IMMUTABLE | PendingIntent.FLAG_NO_CREATE
                    : PendingIntent.FLAG_NO_CREATE;
            PendingIntent pendingIntent = PendingIntent.getBroadcast(context, alarmId, intent, pendingFlags);
            if (pendingIntent != null) {
                android.app.AlarmManager alarmManager = (android.app.AlarmManager) context.getSystemService(Context.ALARM_SERVICE);
                if (alarmManager != null) alarmManager.cancel(pendingIntent);
                pendingIntent.cancel();
            }
            JSObject ret = new JSObject();
            ret.put("cancelled", true);
            call.resolve(ret);
        } catch (Throwable t) {
            call.reject("Error cancelling alarm: " + t.getMessage());
        }
    }
}
