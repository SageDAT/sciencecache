ScienceCache Mobile App
=======================

A geocaching, citizen science app using the Ionic 2 Framework.

Development Environment Setup
-----------------------------
### Install NVM
```
curl -o- https://raw.githubusercontent.com/creationix/nvm/v0.33.7/install.sh | bash
```
### Install Node.js 
```
nvm install 6.12.2
```
I chose 6.12.2 because it is the recommended version for the book "Mobile App Development with Ionic2."
Newer versions may be appropriate, and can be installed via nvm. To select a version, use:
```
nvm use 6.12.2
```
Uninstall various old global node things that the previous command complained about

### Update NPM
```
npm config set cafile /Users/jllong/certificates/DOIRootCA.pem (didn’t work, so)
npm config set strict-ssl false
npm install npm -g
```

### Install Ionic 

https://ionicframework.com/docs/intro/installation/
```
npm install -g ionic cordova
```

### Install XCode (Mac)

### Install Android SDK 
https://developer.android.com/studio/install.html

### PIP Configuration

For pip cert errors, download cert and create pem:
```
curl -sO http://cacerts.digicert.com/DigiCertHighAssuranceEVRootCA.crt
openssl x509 -inform DES -in DigiCertHighAssuranceEVRootCA.crt -out DigiCertHighAssuranceEVRootCA.pem -text
```
Tried setting in .pip/pip.conf:
```
[global]
cert = /Users/jllong/certificates/DigiCertHighAssuranceEVRootCA.pem
```

If that doesn’t work  (doesn’t seem to work when using virtualenv), add ```--cert <path to cert>``` to pip command line.

Building and Running Mobile App
-------------------------------
Clone the repository.  In the app directory build the app using:
```
 npm install
```

Install cordova
```
sudo npm install -g ionic cordova
```

To run the app in a browser. While running in a browser is useful, cordova.js will not be present and full device simulation will not occur:
```
ionic serve
```

Simulate iOS or Android look at feel with --lab (But still no full device simulation):
```
ionic serve --lab
```

This command should fully simulate the app if you are running on a Mac:
```
ionic cordova platform add ios
ionic cordova run ios -lc
```
Substitute ios for android if not on a Mac. The -lc is livereload and console logging.

Deploying to a device info:
```
https://ionicframework.com/docs/intro/deploying/
```
Can use this to build an IOS file
```
ionic cordova build ios --prod
```
And then open the .xcodeproj file in platforms/ios/ in Xcode

Otherwise running this should copy it to the device automatically:
```
ionic cordova run ios --device
```

Some tips to running on IOS:
* Trying to run it with just your apple id likely wont work. Setup XCODE 'Preferences'>'Accounts' and make sure you're a part of Team 'US Geological Survey'
* To be a part of the team sign into https://developer.apple.com/account/ios/certificate/?teamId=XA97G7J7P2 and look for requesting access under the 'Certificates, Ids and Profiles'
* In xcode, when looking at the left bar navigator, select 'ScienceCache'. Under the 'Signing' section and where it says 'Development Team' make sure to select 'US Geological Survey'


Build and Deploy Debug APK to Device
------------------------------------
```
ionic cordova build android

adb install -r ./platforms/android/build/outputs/apk/debug/android-debug.apk
```
