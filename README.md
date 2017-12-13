ScienceCache Mobile App
=======================

A geocaching, citizen science app using the Ionic 2 Framework.

Development Environment Setup
-----------------------------
###Install NVM
```
curl -o- https://raw.githubusercontent.com/creationix/nvm/v0.33.7/install.sh | bash
```
###Install Node.js 
```
nvm install 6.12.2
```
I chose 6.12.2 because it is the recommended version for the book "Mobile App Development with Ionic2."
Newer versions may be appropriate, and can be installed via nvm. To select a version, use:
```
nvm use 6.12.2
```
Uninstall various old global node things that the previous command complained about

###Update NPM
```
npm config set cafile /Users/jllong/certificates/DOIRootCA.pem (didn’t work, so)
npm config set strict-ssl false
npm install npm -g
```

###Install Ionic 

https://ionicframework.com/docs/intro/installation/
```
npm install -g ionic cordova
```

###Install XCode (Mac)

###Install Android SDK 
https://developer.android.com/studio/install.html

###PIP Configuration

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
Substitute ios for android if not on a Mac.

Build and Deploy Debug APK to Device
------------------------------------
```
ionic cordova build android

adb install -r ./platforms/android/build/outputs/apk/debug/android-debug.apk
```
