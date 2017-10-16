ScienceCache Mobile App

A geocaching, citizen science app using the Ionic 2 Framework.

Install Ionic https://ionicframework.com/docs/intro/installation/
```
npm install -g ionic cordova
```

Download the repository and in the app directory build the app using:
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
