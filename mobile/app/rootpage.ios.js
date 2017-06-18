import React, { Component } from 'react';
import {
  Modal,
  StyleSheet,
  TouchableOpacity,
  TouchableWithoutFeedback,
  NativeAppEventEmitter,
  Navigator,
  Text,
  TextInput,
  View,
  Image,
  SegmentedControlIOS,
  Switch,
  Keyboard
} from 'react-native';
import BleManager from 'react-native-ble-manager';
import API from './common/API.js'

var base64 = require('base-64');

var pako = require('pako');

var PAYLOAD_END = "FFFFFFFF";

export default class RootPage extends Component {
  constructor(props) {
    super(props)
    this._ROUTINGSERVICE = "routing"
    this._ROUTINGSERVICEDATA = "data"
    this._moduleIdentifier = "FB49F2AC-8406-43D9-B0DA-B11C65EEDF72"
    //this._moduleIdentifier = "3A85A35E-419E-EC6A-C1C2-E9EEBEB19A7A" // Macbook
    this._moduleName = "raspberrypi"
    this._moduleServices = {
        routing: {
          uuid:   "526F7574-696E-6753-6572-76696365FFFF", //"RoutingService" in hex + 'ffff'
          characteristics: {
            data: "526F7574-696E-6753-6572-766963654331" //"RoutingServiceC1" in hex
          }
        }
    }
    this.openSettingsView = this.openSettingsView.bind(this)
    this.updateSettings = this.updateSettings.bind(this)
    this.APIService = new API()

    this.state = {
      blePeripheralInfo: {},
      destinationInputValue: '',
      programmableButtons: [
        {isActive: true, value: null}, // Set true for testing. TODO Change to false
        {isActive: true, value: null},
        {isActive: false, value: null},
        {isActive: false, value: null},
        {isActive: false, value: null}
      ],
      bleConnectionStatus: 0, //0: Not Connected, 1: Connecting, 2: Connected
      isSettingsModalVisible: false, // Setting true for testing.
      settings: [
        {text: "Display Units", value: 0, options: ["km", "miles"], optionsLength: 2},
        {text: "Check for Firmware Updates",
          value: false, optionsLength: 1,
          isModal: true,
          states: {
            currentState: 2,
            requireConfirmation: true,
            text:["Checking for updates...", "Update not found", "Update found!"],
            confirmationPrompts:["Cancel","Update"],
            regularPrompts:["Back"]
          }
        },
        {text: "About Us",
          value: false, optionsLength: 1,
          isModal: true,
          isBoolean: false,
          states: {
            currentState: 0,
            text:["The team of NoStress GPS consist of extremely skilled and hard working individuals.\n\nSvetlana Borkovkina\nGur Kohli\nEvgeny Kuznetsov\nHimanshu Garg"],
            regularPrompts:["Back"]
          }
        }
      ]
    }

  }

  connectToModule() {
    BleManager.isPeripheralConnected(this._moduleIdentifier, [])
      .then((isConnected) => {
        if (isConnected) {
          this.setState({bleConnectionStatus: 2})
        } else {
          this.setState({bleConnectionStatus: 0})
          BleManager.scan([], 10, true).then(()=>console.debug("Scan Started"))
        }
      })
  }

  writeToModule(serviceName, characteristicName, data) {
    if (this.state.bleConnectionStatus == 2) {
      var service = this._moduleServices[serviceName]
      if (service && service.characteristics[characteristicName]) {
        data = data.constructor == String ? data : JSON.stringify(data);
        var data_compressed = pako.deflate(data, {to: 'string', level: 9})
        var data_b64 = base64.encode(data_compressed)
        var characteristicUUID = service.characteristics[characteristicName]
        return BleManager.write(
          this._moduleIdentifier,
          service.uuid,
          characteristicUUID,
          data_b64,
          512
        ).then((response)=>{
          console.log(response);

          BleManager.write(
            this._moduleIdentifier,
            service.uuid,
            characteristicUUID,
            PAYLOAD_END,
            10
          ).then((response)=> {
            console.log(response)
          }).catch((error)=>console.log(error))
        })
        .catch((error)=>console.log(error));
      }
    }
  }


  componentDidMount() {
    // showAlert: iOS only. Shows alert if bluetooth is off.
    BleManager.start({showAlert: true}).then(()=>console.debug("Ble Initialized"))
    this.handleDiscoverPeripheral = this.handleDiscoverPeripheral.bind(this);

    NativeAppEventEmitter.addListener('BleManagerDiscoverPeripheral', this.handleDiscoverPeripheral);
  }

  handleDiscoverPeripheral(data) {
    if (data.id == this._moduleIdentifier || data.name == this._moduleName) {
      BleManager.stopScan()
      this.setState({bleConnectionStatus: 1});
      BleManager.connect(this._moduleIdentifier)
          .then((peripheralInfo)=>{
            this.setState({bleConnectionStatus: 2, blePeripheralInfo: peripheralInfo})
            console.log(peripheralInfo)
          })
          .catch((error)=>{
            console.log(error);
            this.setState({bleConnectionStatus: 0})
          })
    }
    console.log('Got ble data', data);
    this.setState({ble: data})
  }

  // handleScan() {
  //   BleManager.scan([], 30, true).then((results) => {
  //     console.log('Scanning', results);
  //   });
  // }
  //
  // toggleScanning(bool) {
  //   if (bool) {
  //     this.setState({scanning:true})
  //     this.scanning = setInterval(() => this.handleScan(), 3000);
  //   } else {
  //     this.setState({scanning:false, ble: null})
  //     clearInterval(this.scanning);
  //   }
  // }

  openSettingsView() {
    // this.props.navigator.push({
    //   title: 'Settings',
    //   component: SettingsPage,
    //   navigationBarHidden: true,
    //   passProps: this.state
    // })
    this.setState({isSettingsModalVisible: true})
  }
  closeSettingsView() {
    this.setState({isSettingsModalVisible: false});
  }
  destinationEntered() {
    this.APIService.geocodingSearch(this.state.destinationInputValue).then((response)=>{
      console.log(response)
      var source=["49.276745","-122.9177736"];
      var destination = [response[0].lat, response[0].lon];
      var routes;
      this.writeToModule(this._ROUTINGSERVICE, this._ROUTINGSERVICEDATA, {source: source, destination: destination})
    }).catch((error)=>{
      console.log(error)
    })

  }

  handleProgrammableButtonClicked(index) {
    // Testing only!
    if (this.state.bleConnectionStatus == 0) {
      this.connectToModule()
    } else {
      BleManager.disconnect(this._moduleIdentifier)
        .then(()=>{
          this.setState({bleConnectionStatus: 0})
        })
    }
  }

  updateSettings(index, value) {
    var settings = this.state.settings;
    settings[index].value = value;
    this.setState({settings: settings})
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
      return <TouchableOpacity key={index} onPress={() => this.handleProgrammableButtonClicked()} style ={nodeStyle.programmableButton}>
              <Image source={require('./assets/images/button.png')} style={nodeStyle.programmableButtonIcon}/>
            </TouchableOpacity>
    }.bind(this));

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

    var settingsOptions = this.state.settings.map(function(elem, index){
      var entry
      if (elem.isBoolean) {
        // Need an on off switch
        entry = <View key={index} style={styles.settingsModalItem}>
                  <View style={styles.textOnWhiteBgContainer}>
                      <Text style={styles.textOnWhiteBg}>{elem.text}</Text>
                  </View>
                  <View style={styles.settingsModalItemButtonContainer}>
                    <Switch
                      onValueChange={(value) => {this.updateSettings(index, value)}}
                      onTintColor='#0088cc'
                      value={elem.value}
                      style={styles.settingsModalItemButton}
                   />
                  </View>
                </View>

      } else if (elem.optionsLength && elem.optionsLength> 1) {
        // Need a Segmented Control
        entry = <View key={index} style={styles.settingsModalItem}>
                  <View style={styles.textOnWhiteBgContainer}>
                      <Text style={styles.textOnWhiteBg}>{elem.text}</Text>
                  </View>
                  <View style={styles.settingsModalItemButtonContainer}>
                    <SegmentedControlIOS
                      values={elem.options}
                      tintColor='#0088cc'
                      selectedIndex={elem.value}
                      onChange={(event) => {this.updateSettings(index, event.nativeEvent.selectedSegmentIndex)}}
                    />
                  </View>
                </View>
      } else if (elem.isModal) {
        var buttons;
        if (elem.states.requireConfirmation) {
          buttons = <View style={styles.settingsModalItemModalStateButtonContainer}>
                      <View style={{padding:5}}></View>
                      <TouchableOpacity style={[styles.settingsModalItemModalStateButton,{width: "45%"}]} onPress={() =>this.updateSettings(index, true)}>
                        <Text style={[styles.textOnWhiteBg, {color: 'red'}]}>{elem.states.confirmationPrompts[0]}</Text>
                      </TouchableOpacity>
                      <View style={{padding:7}}></View>
                      <TouchableOpacity style={[styles.settingsModalItemModalStateButton,{width: "45%"}]} onPress={() =>this.updateSettings(index, true)}>
                        <Text style={styles.textOnWhiteBg}>{elem.states.confirmationPrompts[1]}</Text>
                      </TouchableOpacity>
                      <View style={{padding:5}}></View>
                    </View>
        } else {
          buttons = <View style={styles.settingsModalItemModalStateButtonContainer}>
                      <View style={{padding:5}}></View>
                      <TouchableOpacity style={[styles.settingsModalItemModalStateButton,{width: "90%"}]} onPress={() =>this.updateSettings(index, true)}>
                        <Text style={styles.textOnWhiteBg}>{elem.states.regularPrompts[0]}</Text>
                      </TouchableOpacity>
                      <View style={{padding:5}}></View>
                    </View>
        }
        entry = <View key={index}>
                  <TouchableOpacity key={index} style={styles.settingsModalItem} onPress={() =>this.updateSettings(index, true)}>
                    <View style={styles.textOnWhiteBgContainerModal}>
                      <Text style={styles.textOnWhiteBg}>{elem.text}</Text>
                    </View>
                  </TouchableOpacity>
                  <Modal
                      animationType={"fade"}
                      transparent={true}
                      visible={elem.value}>
                        <TouchableOpacity focusedOpacity={0.3} activeOpacity={0.3} style={styles.containerTranslucent} onPress={()=>this.updateSettings(index, false)}>
                          <TouchableWithoutFeedback>
                            <View style={styles.settingsModalItemModalItem} onPress={()=>this.updateSettings(index, false)}>
                              <View style={styles.settingsModalItemModalLabelContainer}>
                                <Text style={styles.settingsModalItemModalLabel}>{elem.text}</Text>
                              </View>
                              <View style={styles.settingsModalItemModalStateTextContainer}>
                                <Text style={styles.settingsModalItemModalStateText}>{elem.states.text[elem.states.currentState]}</Text>
                              </View>
                              {buttons}
                            </View>
                          </TouchableWithoutFeedback>
                        </TouchableOpacity>
                  </Modal>
                </View>
      }

      return entry
    }.bind(this))
    return (
      <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
        <View style={styles.container}>
          <View style={styles.header}>
            <Image source={require('./assets/images/logo.png')} style={styles.logo}/>
            <TouchableOpacity onPress={this.openSettingsView} style ={styles.settingsButton}>
              <View style={styles.settingsBorder}>
                <Image source={require('./assets/images/cog_blue.png')} style={styles.settingsIcon}/>
              </View>
            </TouchableOpacity>
          </View>
          <View style={styles.main}>
            <TextInput placeholder='Where would you like to go?' onChangeText={(text)=>this.setState({destinationInputValue:text})} onEndEditing={()=>this.destinationEntered()} style={styles.destinationInput} value={this.state.destinationInputValue}/>
            <TouchableOpacity onPress={()=>this.destinationEntered()} style ={styles.goButton}>
              <Image source={require('./assets/images/go.png')} style={styles.goIcon}/>
            </TouchableOpacity>
            {statusLabel()}
            <View style={{padding:5}}></View>
            <View style={styles.programmableButtonsView}>
              {programmableButtonNodes}
            </View>
          </View>
          <Modal
            animationType={"fade"}
            transparent={true}
            visible={this.state.isSettingsModalVisible}>
            <TouchableOpacity style={styles.containerTransparent} onPress={()=>this.setState({isSettingsModalVisible: false})}>
              <TouchableWithoutFeedback>
                <View style={styles.settingsModal}>
                  <Text style={styles.settingsModalLabel}>Settings</Text>
                  {settingsOptions}
                </View>
              </TouchableWithoutFeedback>
            </TouchableOpacity>
          </Modal>
        </View>
      </TouchableWithoutFeedback>
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
    backgroundColor: '#0088cc',
    flex: 1
  },
  containerTranslucent: {
    height: '100%',
    alignItems: 'center',
    backgroundColor: 'rgba(0,0,0,0.4)',
    justifyContent: 'center'
  },
  containerTransparent: {
    height: '100%',
    alignItems: 'center',
    backgroundColor: 'rgba(0,0,0,0)',
    justifyContent: 'center'
  },
  main: {
    height: '80%',
    width: '90%',
    marginBottom:10,
    alignItems: 'center'
  },
  header: {
    marginLeft: '14%',
    height: '20%',
    width: '90%',
    flex: 1,
    alignItems: 'center',
    flexDirection: 'row',
    justifyContent: 'center'
  },
  logo: {
    top: 10,
    width: '72%',
    resizeMode: 'contain'
  },
  settingsButton: {
    marginLeft: 15,
    paddingTop: '12%',
    width: '10%',
    justifyContent: 'center',
  },
  settingsBorder: {
    borderWidth: 1,
    borderRadius: 15,
    backgroundColor: 'white',
    height: 30,
    width: 30,
    justifyContent: 'center'
  },
  settingsIcon: {
    resizeMode: 'contain',
    alignSelf: 'center',
    width: 18,
    height: 18,
  },
  destinationInput: {
    width: '80%',
    height: 50,
    borderRadius: 5,
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
  },
  settingsModal: {
    top: '25%',
    left: '0%',
    width: '100%',
    bottom: 0,
    position: 'absolute',
    backgroundColor: '#0088cc',
    alignItems: 'center',
    flex: 1
  },
  settingsModalLabel: {
    fontSize: 25,
    fontWeight: '300',
    color: 'white',
    textAlign: 'center'
  },
  settingsModalItem: {
    width: '90%',
    minHeight: 50,
    maxHeight: 50,
    borderRadius: 5,
    borderWidth: 2,
    borderColor: 'black',
    backgroundColor: 'rgba(255, 255, 255, 0.9)',
    alignSelf: 'center',
    marginTop: '10%',
    alignItems: 'center',
    flex: 1,
    flexDirection: 'row'
  },
  textOnWhiteBgContainer: {
    width: '55%',
    alignSelf: 'flex-start',
    justifyContent: 'center',
    minHeight: 46,
    maxHeight: 46,
    paddingRight: 10
  },
  textOnWhiteBgContainerModal: {
    width: '100%',
    alignSelf: 'flex-start',
    justifyContent: 'center',
    minHeight: 46,
    maxHeight: 46,
    paddingRight: 10
  },
  textOnWhiteBg: {
    fontSize: 15,
    fontWeight: '400',
    color: '#0088cc',
    textAlign: 'center'
  },
  settingsModalItemButtonContainer: {
    maxWidth: '40%',
    alignSelf: 'flex-start',
    minHeight: 46,
    maxHeight: 46,
    minWidth: '40%',
    flex: 1,
    justifyContent: 'center',
    paddingLeft: 10
  },
  settingsModalItemButton: {
    alignSelf: 'center'
  },
  settingsModalItemModalItem: {
    borderRadius: 10,
    backgroundColor: '#0088cc',
    alignItems: 'center',
    borderWidth: 2,
  },
  settingsModalItemModalLabelContainer: {
    height: 30,
    borderRadius: 5,
    marginTop: 5,
    marginBottom: 20,
    justifyContent: 'center',
  },
  settingsModalItemModalLabel: {
    fontSize: 20,
    fontWeight: '400',
    color: 'white',
    textAlign: 'center'
  },
  settingsModalItemModalStateTextContainer: {
    justifyContent: 'center',
    paddingLeft: 10,
    paddingRight: 10,
    paddingTop: 15,
    paddingBottom: 15,
    marginBottom: 15,
  },
  settingsModalItemModalStateText: {
    fontSize: 15,
    fontWeight: '400',
    color: 'white',
    textAlign: 'center'
  },
  settingsModalItemModalStateButtonContainer: {
    maxWidth: '90%',
    minWidth: '90%',
    maxHeight: 40,
    flex: 1,
    justifyContent: 'center',
    flexDirection: 'row',
    marginBottom: 15
  },
  settingsModalItemModalStateButton: {
    height: 40,
    borderRadius: 5,
    borderWidth: 2,
    borderColor: 'black',
    backgroundColor: 'rgba(255, 255, 255, 0.9)',
    alignSelf: 'center',
    justifyContent: 'center'
  },
  pad15: {
    paddingTop: '15%'
  }
});
