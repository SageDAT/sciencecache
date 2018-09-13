# README for installing a Lubuntu 18.04 LTS Development Environment


Install Lubuntu 18.04 LTS (bionic)

Update the OS:
  ```
  $ sudo apt-get update
  $ sudo apt-get upgrade
  ```

Add packages:
  ```
  $ sudo apt-get install net-tools
  $ sudo apt-get install tree
  $ sudo apt-get install git
  $ sudo apt-get install curl
  $ sudo apt-get install vim-gui-common
  $ sudo apt-get install cpu-checker
  $ sudo apt-get install qemu-kvm
  $ sudo apt-get install libvirt-bin
  ```

Add your username to the kvm group (group permission is REQUIRED by the Android emulator):
  ```
  $ sudo adduser {your username} kvm
  # To effect the new kvm group permission updates:
  $ sudo reboot
  ```

Install nvm, node, cordova, and ionic:
  ```
  $ curl -o- https://raw.githubusercontent.com/creationix/nvm/v0.33.11/install.sh | bash
  $ nvm install 6.12.2
  # Creates ~/.npmrc:
  $ npm config set strict-ssl false
  $ npm install -g npm@6.4.1
  $ npm install -g cordova@8.0.0
  $ npm install -g ionic@4.1.2
  ```

Install Android Studio:
  ```
  $ cd ~/Downloads
  $ wget https://dl.google.com/dl/android/studio/ide-zips/3.1.4.0/android-studio-ide-173.4907809-linux.zip
  $ unzip android-studio-ide-173.4907809-linux.zip
  $ sudo mv android-studio/ /usr/local/
  $ cd /usr/local
  $ sudo chown -R root:root android-studio/
  # Set executable:
  $ sudo chmod 775 /usr/local/android-studio/gradle/gradle-4.4/bin/gradle
  ```

Install Java JDK 8:
  * Browse to: http://www.oracle.com/technetwork/java/javase/downloads/jdk8-downloads-2133151.html
    * Accept license
    * Download appropriate version to ~/Downloads: jdk-8u181-linux-x64.tar.gz (for my environment)
  ```
  $ cd ~/Downloads
  $ tar -xzvf jdk-8u181-linux-x64.tar.gz
  $ sudo mv jdk1.8.0_181/ /usr/lib/jvm/
  $ cd /usr/lib
  $ sudo chown -R root:root jvm/
  ```
  Run, append to ~/.bashrc:
  ```
  # These fully enable the java/sdk cli:
  export JAVA_HOME=/usr/lib/jvm
  export PATH=$PATH:/$JAVA_HOME/bin
  ```

Run Android Studio: Download additional components:
  * Android Studio Setup Wizard - Welcome
  * Welcome -> Next
  * Custom  -> Next
  * IntelliJ -> Next
  * Android Virtual Device -> Next
  * Next
  * Finish
  * Downloading Components -> Next
  * Append to ~/.bashrc
    * export ANDROID_HOME=~/Android/Sdk
    * export PATH=$PATH:$ANDROID_HOME/emulator:$ANDROID_HOME/tools:/usr/local/android-studio/bin:/usr/local/android-studio/gradle/gradle-4.4/bin

Run Android Studio: Install SDKs:
  * Tools -> SDK Manager -> SDK Platforms (tab)
  * Check: Android 8.1 (Oreo)
  * Check: Android 8.0 (Oreo)
  * Apply
  * Ok

Run Android Studio: Create Android Virtual Device (AVD):
  * Tools -> AVD
  * Name:   Nexus 5X API 26
  * API:    26
  * Target: Android 8.0
  * CPU:    x86

Run Android Studio: Prepare to run AVD (Android Virtual Device) Manager:
  * Start a new Android Studio Project
  * Use the default settings -> Next
  * Select the form factors and minimum SDK (API 15) -> Next
  * Add No Activity -> Next
  * Finish (starts a build)
  * In new window, select Install Build Tools 27.0.3 and sync project
  * Accept license -> Next
  * Finish (downloads the build tools, compiles the "new project" app)

Test the new AVD from the command line:
  ```
  # Quick test, should start without error:
  $ emulator -wipe-data  @Nexus_5X_API_28 
  ```

Clone sciencecache, **Do temp fixups for Android-only Ubuntu dev-tooling testing**:
  ```
  $ cd ~
  $ # Start with GitHub latest
  $ rm -rf sciencecache
  $ git clone https://github.com/SageDAT/sciencecache.git
  $ cd sciencecache
  $ # For Android-only dev: remove ios from package.json
  $ sed -i "/ios-deploy/d"  package.json   # remove ios-deploy
  $ sed -i "/cordova-ios/d" package.json   # remove cordova-ios
  $ sed -i "/ios/d"         package.json   # remove ios
  ```

Install sciencecache:
  ```
  $ cd ~/sciencecache
  $ # This sequence results in a successful '$ ionic cordova platform add android'
  $ npm install                                --no-optional
  $ npm audit fix                              --no-optional
  $ npm install   pouchdb@7.0.0                --no-optional
  $ npm install   cordova-android@7.1.1        --no-optional
  $ npm uninstall cordova-plugin-compat        --no-optional
  # Required to suppress build errors:
  $ npm install   cordova-plugin-camera@3      --no-optional
  $ npm install   cordova-plugin-geolocation@3 --no-optional
  ```

Fixup ~/sciencecache/config.xml:
  * Change:
  ```
  <preference name="android-minSdkVersion" value="16" />
  ```
  * To:
  ```
  <preference name="android-minSdkVersion" value="19" />
  ```
  * Why: To suppress ionic run error:
  ```
  Error:
  [cordova]  uses-sdk:minSdkVersion 16 cannot be smaller than version 19 declared in library [:CordovaLib] /home/nsimon/sciencecache/platforms/android/CordovaLib/build/intermediates/manifests/full/debug/AndroidManifest.xml as the library might be using APIs not available in 16
  [cordova]  Suggestion: use a compatible library with a minSdk of at most 16,
  [cordova]    or increase this project's minSdk version to at least 19
  ```

Fixup ~/sciencecache/node_modules/@ionic/app-scripts/dist/dev-server/serve-config.js:
  * Change:
  ```
  exports.ANDROID_PLATFORM_PATH = path.join('platforms', 'android', 'assets', 'www');
  ```
  * To:
  ```
  exports.ANDROID_PLATFORM_PATH = path.join('platforms', 'android', 'app', 'src', 'main', 'assets', 'www');
  ```
  * Why: To suppress ionic run warnings, e.g.:
  ```
  Native: tried calling StatusBar.styleDefault, but Cordova is not available.
  ```

Run ionic cordova: add the android platform:
  ```
  $ ionic cordova platform add android
  ```
  * Creates the emulator.js (below)

Fixup ~/sciencecache/platforms/android/cordova/lib/emulator.js:
  * Change:
  ```
  if ((error && error.message &&
      (error.message.indexOf('not found') > -1)) ||
      (error.message.indexOf('device offline') > -1))
  ```
  * To:
  ```
  if ((error && error.message &&
      (error.message.indexOf('not found') > -1)) ||
      (error.message.indexOf('device offline') > -1) ||
      (error.message.indexOf('device still authorizing') > -1) ||
      (error.message.indexOf('device still connecting') > -1))
  ```
  * Why: To suppress ionic run error:
  ```
  UnhandledPromiseRejectionWarning: CordovaError: Failed to execute shell command "getprop,dev.bootcomplete" on device
  ```

Run ionic cordova to compile and load/start **sciencecache** in the Android emulator:
  ```
  $ ionic cordova run android -lc
  ```

