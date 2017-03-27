import React, { Component } from 'react';
import {
  AppRegistry,
  StyleSheet,
  NavigatorIOS,
  NativeAppEventEmitter,
  View
} from 'react-native';
import BleManager from 'react-native-ble-manager';

var rootPage = require('./rootpage.ios.js').default
//var rootPage = require('./settingspage.ios.js').default
export default class app extends Component {
  constructor() {
    super()
  }
  render() {
    return (
      <NavigatorIOS
          style = {styles.container}
          initialRoute={{
            title: "Root",
            navigationBarHidden: true,
            component: rootPage
        }}
        configureScenes={(route, routeStack) => Navigator.SceneConfigs.FloatFromRight}
      />
    );
  }
}

const styles = StyleSheet.create({
  container: {
    flex: 1
  }
});

AppRegistry.registerComponent('app', () => app);
