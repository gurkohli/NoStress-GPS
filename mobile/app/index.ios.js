/**
 * Sample React Native App
 * https://github.com/facebook/react-native
 * @flow
 */

import React, { Component } from 'react';
import {
  AppRegistry,
  StyleSheet,
  TouchableHighlight,
  NativeAppEventEmitter,
  Text,
  View
} from 'react-native';
import BleManager from 'react-native-ble-manager';

export default class app extends Component {
  constructor() {
    super()

    this.state = {
      ble: null,
      scanning: false
    }
  }

  componentDidMount() {
    BleManager.start({showAlert: false})
    this.handleDiscoverPeripheral = this.handleDiscoverPeripheral.bind(this);

    NativeAppEventEmitter.addListener('BleManagerDiscoverPeripheral', this.handleDiscoverPeripheral); 
  }

  handleScan() {
    BleManager.scan([], 30, true).then((results) => {
      console.log("Scanning", results); 
    });
  }

  toggleScanning(bool) {
    if (bool) {
      this.setState({scanning:true})
      this.scanning = setInterval(() => this.handleScan(), 3000);
    } else {
      this.setState({scanning:false, ble: null})
      clearInterval(this.scanning);
    }
  }

  handleDiscoverPeripheral(data) {
    console.log("Got ble data", data);
    this.setState({ble: data})
  }
  render() {
    const bleList = this.state.ble 
                ? <Text> Device found : {this.state.ble.name} </Text>
                : <Text> No Devices Nearby </Text>
    return (
      <View style={styles.container}>
        <TouchableHighlight style={{padding:20, backgroundColor:'#ccc'}} onPress={() => this.toggleScanning(!this.state.scanning) }>
            <Text>Scan Bluetooth ({this.state.scanning ? 'on' : 'off'})</Text>
        </TouchableHighlight>

        {bleList}
      </View>
    );
  }
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#F5FCFF',
  },
  welcome: {
    fontSize: 20,
    textAlign: 'center',
    margin: 10,
  },
  instructions: {
    textAlign: 'center',
    color: '#333333',
    marginBottom: 5,
  },
});

AppRegistry.registerComponent('app', () => app);
