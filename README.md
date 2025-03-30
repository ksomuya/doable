# Welcome to your Expo app 👋

This is an [Expo](https://expo.dev) project created with [`create-expo-app`](https://www.npmjs.com/package/create-expo-app).

## Get started

1. Install dependencies

   ```bash
   npm install
   ```

2. Start the app

   ```bash
    npx expo start
   ```

In the output, you'll find options to open the app in a

- [development build](https://docs.expo.dev/develop/development-builds/introduction/)
- [Android emulator](https://docs.expo.dev/workflow/android-studio-emulator/)
- [iOS simulator](https://docs.expo.dev/workflow/ios-simulator/)
- [Expo Go](https://expo.dev/go), a limited sandbox for trying out app development with Expo

You can start developing by editing the files inside the **app** directory. This project uses [file-based routing](https://docs.expo.dev/router/introduction).

## Get a fresh project

When you're ready, run:

```bash
npm run reset-project
```

This command will move the starter code to the **app-example** directory and create a blank **app** directory where you can start developing.

## Learn more

To learn more about developing your project with Expo, look at the following resources:

- [Expo documentation](https://docs.expo.dev/): Learn fundamentals, or go into advanced topics with our [guides](https://docs.expo.dev/guides).
- [Learn Expo tutorial](https://docs.expo.dev/tutorial/introduction/): Follow a step-by-step tutorial where you'll create a project that runs on Android, iOS, and the web.

## Join the community

Join our community of developers creating universal apps.

- [Expo on GitHub](https://github.com/expo/expo): View our open source platform and contribute.
- [Discord community](https://chat.expo.dev): Chat with Expo users and ask questions.

# Doable App

## Distraction Blocker Feature

The Distraction Blocker feature helps users stay focused on their studies by reducing digital distractions. It monitors app usage and provides mindful breathing exercises when users attempt to access distracting apps.

### How It Works

1. **Setup**: Users select which apps they want to limit access to.
2. **Monitoring**: The app uses Android's Accessibility Service to detect when a user opens a distracting app.
3. **Mindful Intervention**: When a distracting app is opened, a breathing exercise overlay appears before allowing access.
4. **Usage Tracking**: The app tracks how many times each distracting app is opened.

### Requirements

This feature requires the following permissions on Android:
- Accessibility Service permission
- Draw over other apps permission (SYSTEM_ALERT_WINDOW)
- Usage stats permission

### Implementation Notes

To fully implement this feature, you will need to:

1. Eject from Expo managed workflow to the bare workflow:
   ```
   npx expo prebuild
   ```

2. Set up the required native modules:
   - Create an Android Accessibility Service to detect app launches
   - Implement overlay functionality using SYSTEM_ALERT_WINDOW permission
   - Add usage stats tracking with UsageStatsManager

3. Add the following to your `AndroidManifest.xml`:
   ```xml
   <!-- Accessibility Service -->
   <service
     android:name=".DistractionBlockerService"
     android:permission="android.permission.BIND_ACCESSIBILITY_SERVICE"
     android:exported="false">
     <intent-filter>
       <action android:name="android.accessibilityservice.AccessibilityService" />
     </intent-filter>
     <meta-data
       android:name="android.accessibilityservice"
       android:resource="@xml/accessibility_service_config" />
   </service>
   
   <!-- Overlay Permission -->
   <uses-permission android:name="android.permission.SYSTEM_ALERT_WINDOW" />
   
   <!-- Usage Stats Permission -->
   <uses-permission android:name="android.permission.PACKAGE_USAGE_STATS" />
   ```

4. Create the accessibility service configuration file `res/xml/accessibility_service_config.xml`:
   ```xml
   <accessibility-service xmlns:android="http://schemas.android.com/apk/res/android"
     android:description="@string/accessibility_service_description"
     android:packageNames="com.instagram.android, com.facebook.katana, com.zhiliaoapp.musically"
     android:accessibilityEventTypes="typeWindowStateChanged"
     android:accessibilityFlags="flagReportViewIds"
     android:accessibilityFeedbackType="feedbackGeneric"
     android:notificationTimeout="100"
     android:canRetrieveWindowContent="true"
     android:settingsActivity="com.doable.MainActivity"/>
   ```

### Usage

1. Navigate to the "Remove Distractions" card on the home screen
2. Follow the setup process to grant necessary permissions
3. Select the apps you want to limit
4. When you open a blocked app, the breathing exercise overlay will appear

### Limitations

- iOS does not allow app usage monitoring or drawing over other apps, so this feature is Android-only.
- The feature requires significant native code and permissions, which may affect app review times.

### Packages Used

- `@react-native-async-storage/async-storage`: For storing app settings and usage data
- `expo-intent-launcher`: For directing users to system permission screens
- Custom native modules for accessibility service and overlay functionality

## Other Features

[Add other app features here]
