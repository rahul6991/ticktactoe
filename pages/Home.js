import React, { Component } from 'react';
import { AsyncStorage, View, Alert, Button, StyleSheet, Text, Dimensions, lazy, ScrollView, TouchableOpacity, TextInput } from 'react-native';
import axios from 'axios';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
const { width: WIDTH } = Dimensions.get('window');
import Tourament from "./Touranament";
import openSocket from "socket.io-client";

const socket = openSocket("http://192.168.0.102:3000");


export default class Home extends Component {
  constructor(props) {
    super(props);
    AsyncStorage.getItem('x-auth').then((token) => {
      axios.get('http://192.168.0.102:3000/details', {
        headers: { 'x-auth': token }
      }).then(res => {
        if (res.status == 200) {
          const { email, mobile, name } = res.data;
          this.setState(previousState => ({
            email, mobile, name
          }));
          var userConnected = { email, name, mobile }
          socket.on(email, (visitor) => {
            if (!this.state.isTournamentOpen) {
              if (visitor.action === "accepted") {
                this.setState(previousState => ({
                  isTournamentOpen: true,
                  firstTurn: true,
                  presentTurn: true,
                  toEmail: visitor.from.email,
                  toName: visitor.from.name,
                }));
              }
              if (visitor.action === "declined") {
                Alert.alert(
                  'Response status',
                  `${visitor.from.email} Rejected`,
                  [
                    {
                      text: 'Ok',
                      onPress: () => this.rejectTournament(visitor),
                      style: 'cancel',
                    }
                  ],
                  { cancelable: false },
                );
              }
              if (visitor.action === "request_play") {
                Alert.alert(
                  'Can we play',
                  `${visitor.from.email} wants to play ?`,
                  [
                    {
                      text: 'Cancel',
                      onPress: () => this.rejectTournament(visitor),
                      style: 'cancel',
                    },
                    { text: 'OK', onPress: () => this.startTournament(visitor) },
                  ],
                  { cancelable: false },
                );
              }

            }
          })
          socket.emit("new_visitor", userConnected);
          socket.on('visitors', (visitors) => {
            visitors = visitors.filter(user => { return user.email !== email })
            this.setState(previousState => ({
              visitors: visitors
            }));
          })
        }
      }).catch(err => {
        console.log("invalid token", err);
      })
    })
  }
  state = {
    isTournamentOpen: false,
    mobile: '',
    email: '',
    name: '',
    toEmail: '',
    toName: '',
    visitors: []
  }

  requestUserToPlay = (user) => {
    const { email, mobile, name } = this.state;
    let connectionInfo = { to: user, from: { email, mobile, name } };
    connectionInfo.action = "request_play"
    socket.emit("request_visitor", connectionInfo);
  }

  rejectTournament = (user) => {
    const to = user.from;
    const from = user.to;
    let connectionInfo = { to: to, from: from, action: "declined" }
    socket.emit("request_declined", connectionInfo);
  }

  closeTournament = ()=>{
    this.setState(previousState => ({
      isTournamentOpen: false,
      toEmail: '',
      toName: ''
    }));
  }

  startTournament = (user) => {
    const to = user.from;
    const from = user.to;
    let connectionInfo = { to: to, from: from, action: "accepted" }
    socket.emit("request_accepted", connectionInfo);
    this.setState(previousState => ({
      isTournamentOpen: true,
      toEmail: to.email,
      toName: to.name,
      firstTurn: false,
      presentTurn: false,
    }));
  }


  render() {
    let k = 1
    let liveUser = this.state.visitors.map(eachUser => {
      k = k + 1;
      return (<TouchableOpacity onPress={() => { this.requestUserToPlay(eachUser) }} key={k} style={styles.userContainer}>
        <Text style={{ color: 'black', fontSize: 20 }} >{eachUser.name}</Text>
        <Text style={{ color: 'black', fontSize: 20 }} >{eachUser.email}</Text>
        <Text style={{ color: 'black', fontSize: 20 }} >{eachUser.mobile}</Text>

      </TouchableOpacity>)
    });

    if (this.state.isTournamentOpen) {
      const { name, email, toName, toEmail, firstTurn, presentTurn } = this.state;
      return <Tourament user={{ fromName: name, fromEmail: email, toName, toEmail, firstTurn, presentTurn }} closeTournament={this.closeTournament} />
    }
    return (<View>
      <View style={{ marginTop: 25, flexDirection: 'row', justifyContent: 'space-between', paddingVertical: 5, paddingHorizontal: 10, backgroundColor: '#E5E5E5' }}>
        <Text style={{ color: 'black', fontSize: 30 }}>TicTacToe</Text>
        <TouchableOpacity style={{ backgroundColor: 'grey', padding: 10, borderRadius: 30, width: 50, height: 50 }}>
          <Text style={{ color: 'white', fontSize: 23 }}>{this.state.name}</Text>
        </TouchableOpacity>
      </View>
      <View>
        <Text style={{ color: 'green', fontSize: 20, alignSelf: 'center' }}>Online Friends</Text>
        <ScrollView>
          {liveUser}
        </ScrollView>
      </View>
    </View>
    );
  }
}


const styles = StyleSheet.create({
  userContainer: {
    backgroundColor: 'rgba(115,128,128, 0.5)',
    marginTop: 25,
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingVertical: 10,
    paddingHorizontal: 10,
    borderRadius: 30,
    borderWidth: 2,
    borderColor: 'green'
  },
  textInput: {
    borderColor: 'blue',
    backgroundColor: 'rgba(1,255,255, 0.01)',
    width: WIDTH * 0.9,
    color: 'grey',
    fontSize: WIDTH * 0.05,
  },
  imageContainer: {
    width: 200,
    height: 200,
    borderRadius: 50
  },
  imageText: {
    alignSelf: 'center',
    position: 'absolute',
    zIndex: 1,
    bottom: 0
  },
  button: {
    width: WIDTH * 0.9
  }
})