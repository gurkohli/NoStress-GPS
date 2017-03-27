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
  Switch
} from 'react-native';
import BleManager from 'react-native-ble-manager';

export default class RootPage extends Component {
  constructor(props) {
    super(props)

    this.openSettingsView = this.openSettingsView.bind(this)
    this.updateSettings = this.updateSettings.bind(this)

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
      bleConnectionStatus: 2, //0: Not Connected, 1: Connecting, 2: Connected
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

  // componentDidMount() {
  //   BleManager.start({showAlert: false})
  //   this.handleDiscoverPeripheral = this.handleDiscoverPeripheral.bind(this);
  //
  //   NativeAppEventEmitter.addListener('BleManagerDiscoverPeripheral', this.handleDiscoverPeripheral);
  // }
  //
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
  destinationEntered(value) {

  }

  handleProgrammableButtonClicked(index) {

  }

  handleDiscoverPeripheral(data) {
    console.log('Got ble data', data);
    this.setState({ble: data})
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
        <Modal
          animationType={"fade"}
          transparent={true}
          visible={this.state.isSettingsModalVisible}>
            <View style={styles.settingsModal}>
              <View style={styles.pad15}></View>
              {settingsOptions}
            </View>
        </Modal>
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
    backgroundColor: '#0088cc',
    flex: 1
  },
  containerTranslucent: {
    height: '100%',
    alignItems: 'center',
    backgroundColor: 'rgba(0,0,0,0.4)',
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
    marginLeft: 30,
    paddingTop: '12%',
    width: '10%',
    height: '100%',
    justifyContent: 'center',
  },
  settingsIcon: {
    resizeMode: 'contain',
    borderRadius: 12,
    width: '70%'
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
    top: '18.5%',
    left: '5%',
    height: '80%',
    width: '90%',
    position: 'absolute',
    backgroundColor: '#0088cc',
    alignItems: 'center',
    flex: 1
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
