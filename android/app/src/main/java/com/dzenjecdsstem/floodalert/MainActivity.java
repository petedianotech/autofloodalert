package com.dzenjecdsstem.floodalert;

import android.app.NotificationChannel;
import android.app.NotificationManager;
import android.media.AudioAttributes;
import android.media.RingtoneManager;
import android.net.Uri;
import android.os.Build;
import android.os.Bundle;
import android.util.Log;
import com.getcapacitor.BridgeActivity;
import com.google.firebase.FirebaseApp;
import com.google.firebase.FirebaseOptions;

public class MainActivity extends BridgeActivity {

    private static final String TAG = "MainActivity";
    public static final String FLOOD_CHANNEL_ID = "dzenje_flood_alarm_channel_v1";

    @Override
    public void onCreate(Bundle savedInstanceState) {
        // Register custom native plugins safely
        try {
            registerPlugin(NativePowerHelperPlugin.class);
        } catch (Throwable t) {
            Log.w(TAG, "NativePowerHelperPlugin registration warning: " + t.getMessage());
        }

        // Initialize Firebase safely if not initialized yet to prevent startup crash
        try {
            if (FirebaseApp.getApps(this).isEmpty()) {
                FirebaseOptions options = new FirebaseOptions.Builder()
                    .setApplicationId("1:158763014091:android:9d45e4517b620b7237084e")
                    .setApiKey("AIzaSyDsh5VHm1rk4tiacIYVkkxZF3LK5lPmH0w")
                    .setProjectId("automatic-flood-alert")
                    .setGcmSenderId("158763014091")
                    .build();
                FirebaseApp.initializeApp(this, options);
                Log.i(TAG, "Firebase initialized safely in MainActivity.");
            }
        } catch (Throwable t) {
            Log.w(TAG, "FirebaseApp initialization check: " + t.getMessage());
        }

        super.onCreate(savedInstanceState);

        // Safely create notification channel
        try {
            createNotificationChannel();
        } catch (Throwable t) {
            Log.w(TAG, "Notification channel init warning: " + t.getMessage());
        }
    }

    private void createNotificationChannel() {
        if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.O) {
            try {
                CharSequence name = "Flood Emergency Sirens";
                String description = "Critical alerts and loud siren notifications during river floods";
                int importance = NotificationManager.IMPORTANCE_HIGH;
                NotificationChannel channel = new NotificationChannel(FLOOD_CHANNEL_ID, name, importance);
                channel.setDescription(description);
                channel.enableLights(true);
                channel.enableVibration(true);
                channel.setVibrationPattern(new long[]{0, 1000, 300, 1000, 300, 1000});
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
                    Log.w(TAG, "Could not set custom channel sound, using default: " + soundErr.getMessage());
                }

                NotificationManager notificationManager = getSystemService(NotificationManager.class);
                if (notificationManager != null) {
                    notificationManager.createNotificationChannel(channel);
                }
            } catch (Throwable t) {
                Log.w(TAG, "createNotificationChannel error: " + t.getMessage());
            }
        }
    }
}
