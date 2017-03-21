/**
 * Sample React Native App
 * https://github.com/facebook/react-native
 * @flow
 */

import React, { Component } from 'react';
import {
  AppRegistry,
  StyleSheet,
  TouchableOpacity,
  NativeAppEventEmitter,
  Text,
  TextInput,
  View,
  Image
} from 'react-native';
import BleManager from 'react-native-ble-manager';

export default class app extends Component {
  constructor() {
    super()

    this.state = {
      ble: null,
      scanning: false,
      destinationInputValue: '',
      programmableButtons: [
        {isActive: true, value: null}, // Set true for testing. TODO Change to false
        {isActive: true, value: null},
        {isActive: false, value: null},
        {isActive: false, value: null},
        {isActive: false, value: null}
      ],
      bleConnectionStatus: 2 //0: Not Connected, 1: Connecting, 2: Connected
    }
  }

  componentDidMount() {
    BleManager.start({showAlert: false})
    this.handleDiscoverPeripheral = this.handleDiscoverPeripheral.bind(this);

    NativeAppEventEmitter.addListener('BleManagerDiscoverPeripheral', this.handleDiscoverPeripheral); 
  }

  handleScan() {
    BleManager.scan([], 30, true).then((results) => {
      console.log('Scanning', results); 
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

  openSettingsView() {

  }

  destinationEntered(value) {

  }

  handleProgrammableButtonClicked(index) {

  }

  handleDiscoverPeripheral(data) {
    console.log('Got ble data', data);
    this.setState({ble: data})
  }
  render() {
    // const bleList = this.state.ble 
    //             ? <Text> Device found : {this.state.ble.name} </Text>
    //             : <Text> No Devices Nearby </Text>
    var programmableButtonNodes = this.state.programmableButtons.map(function(elem, index) {
      var backgroundColor, tintColor;
      if (elem.isActive) {
        backgroundColor = '#4efc3f'
        tintColor = '#2f9b25'
      } else {
        backgroundColor = '#e2e2e2'
        tintColor = '#909090'
      }
      var nodeStyle = StyleSheet.create({
        programmableButton: {
          width: '20%',
          alignItems:'center'
        },
        programmableButtonIcon: {
          width: '70%',
          height: '100%',
          resizeMode: 'contain',
          tintColor: tintColor,
          backgroundColor: backgroundColor,
          borderRadius: 8,
          borderWidth: 1,
          borderColor: 'black'
        }
      })
      return <TouchableOpacity key={index} onPress={this.handleProgrammableButtonClicked} style ={nodeStyle.programmableButton}>
              <Image source={require('./assets/images/button.png')} style={nodeStyle.programmableButtonIcon}/>
            </TouchableOpacity>
    });

    var statusLabel = function() {
      var textColor, textValue
      if (this.state.bleConnectionStatus == 0) {
        textValue = "Not Connected";
        textColor = "#ff0000"
      } else if (this.state.bleConnectionStatus == 1) {
        textValue = "Connecting...";
        textColor = "#ffff00";
      } else if (this.state.bleConnectionStatus == 2) {
        textValue = "Connected";
        textColor = "#00ff00";
      }
      var labelStyle = StyleSheet.create({
        label: {
          color: textColor,
          width: "35%",
          height: 20,
          fontSize: 13,
          alignSelf: 'center',
          textAlign: 'center',
          marginTop: 15
        }
      })
      return <Text style={labelStyle.label}>{textValue}</Text>
    }.bind(this)
    return (
      <View style={styles.container}>
        <View style={styles.header}>
          <Image source={require('./assets/images/logo.png')} style={styles.logo}/>
          <TouchableOpacity onPress={this.openSettingsView} style ={styles.settingsButton}>
            <Image source={require('./assets/images/cog.png')} style={styles.settingsIcon}/>
          </TouchableOpacity>
        </View>
        <View style={styles.main}>
          <TextInput placeholder='Where would you like to go?' onChangeText={(text)=>this.setState({destinationInputValue:text})} onEndEditing={(text)=>this.destinationEntered(text)} style={styles.destinationInput} value={this.state.destinationInputValue}/>
          <TouchableOpacity onPress={this.openSettingsView} style ={styles.goButton}>
            <Image source={require('./assets/images/go.png')} style={styles.goIcon}/>
          </TouchableOpacity>
          <View style={styles.programmableButtonsView}>
            {programmableButtonNodes}
          </View>
          {statusLabel()}
        </View>
      </View>
      // <View style={styles.container}>
      //   <TouchableHighlight style={{padding:20, backgroundColor:'#ccc'}} onPress={() => this.toggleScanning(!this.state.scanning) }>
      //       <Text>Scan Bluetooth ({this.state.scanning ? 'on' : 'off'})</Text>
      //   </TouchableHighlight>

      //   {bleList}
      // </View>
    );
  }
}

const styles = StyleSheet.create({
  container: {
    height: '100%',
    justifyContent: 'center',
    alignItems: 'center',
    flex: 1
  },
  main: {
    height: '80%',
    width: '90%',
    borderRadius: 50,
    backgroundColor: '#0088cc',
    marginBottom:10,
    alignItems: 'center'
  },
  header: {
    height: '15%',
    width: '90%',
    flex: 1,
    alignItems: 'center',
    flexDirection: 'row'
  },
  logo: {
    width: '70%',
    left: '38%',
    resizeMode: 'contain'
  },
  settingsButton: {
    width: '8%',
    left: '60%',
    top: '3%'
  },
  settingsIcon: {
    resizeMode: 'contain',
    width: '80%'
  },
  destinationInput: {
    width: '80%',
    height: 50,
    borderRadius: 10,
    fontSize: 15,
    borderWidth: 1,
    borderColor: 'black',
    alignSelf: 'center',
    marginTop: '15%',
    backgroundColor: 'white',
    padding: 10
  },
  goButton: {
    width: '30%',
    height: '25%',
    marginTop: '30%',
    alignSelf: 'center',
    marginBottom: '30%'
  },
  goIcon: {
    width: '100%',
    tintColor: '#0088cc',
    borderRadius: 50,
    borderWidth: 1,
    borderColor: 'black',
    backgroundColor: 'white'
  },
  programmableButtonsView: {
    width: '80%',
    maxHeight: 40,
    flex: 1,
    alignItems: 'center',
    flexDirection: 'row',
    alignSelf: 'center'
  }
});

AppRegistry.registerComponent('app', () => app);
