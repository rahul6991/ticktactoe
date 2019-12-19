import React, { Component } from 'react';
import { AsyncStorage, View, Alert, Button, StyleSheet, Text, Dimensions, lazy, ScrollView, TouchableOpacity, TextInput, StatusBar } from 'react-native';
import axios from 'axios';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
const { width: WIDTH } = Dimensions.get('window');

import openSocket from "socket.io-client";

const socket = openSocket("http://192.168.0.102:3000");


export default class Tourament extends Component {
    constructor(props) {
        super(props);
        socket.on(props.user.fromEmail, (value) => {
            if(value.action === "endGame"){
                console.log("end game", value);
                this.props.closeTournament();
            }
            if (value.action === "turn") {
                let { game } = value;
                this.setState(previousState => ({
                    presentTurn: true,
                    game
                }));
                let val = this.checkWon(game);
                this.setMatchStatus(val);
            }
            if(value.action === "restart"){
                this.setState(previousState => ({
                    firstTurn: !this.state.firstTurn,
                    presentTurn: !this.state.firstTurn,
                    game: [['', '', ''], ['', '', ''], ['', '', '']]
                }));
            }
        });
    }
    state = {
        toEmail: '',
        toName: '',
        fromName: '',
        fromEmail: '',
        won: 0,
        round: 0,
        firstTurn: false,
        presentTurn: false,
        game: [['', '', ''], ['', '', ''], ['', '', '']]
    }
    componentWillMount(){
        this.setState(previousState => ({
            toEmail: this.props.user.toEmail,
            fromEmail: this.props.user.fromEmail,
            toName: this.props.user.toName,
            fromName: this.props.user.fromName,
            firstTurn: this.props.user.firstTurn,
            presentTurn: this.props.user.presentTurn,
        }));
    }

    setMatchStatus = (val)=>{
        if (val === 'X') {
            if (this.state.firstTurn) {
                this.setState(previousState => ({
                    won: this.state.won + 1,
                    round: this.state.round + 1,
                    game: [['', '', ''], ['', '', ''], ['', '', '']]
                }))
            } else {
                this.setState(previousState => ({
                    round: this.state.round + 1,
                    game: [['', '', ''], ['', '', ''], ['', '', '']]
                }))
            }
        }
        if (val === 'T') {
            if (this.state.firstTurn) {
                this.setState(previousState => ({
                    round: this.state.round + 1,
                    game: [['', '', ''], ['', '', ''], ['', '', '']]
                }))
            } else {
                this.setState(previousState => ({
                    won: this.state.won + 1,
                    round: this.state.round + 1,
                    game: [['', '', ''], ['', '', ''], ['', '', '']]
                }))
            }
        }
        if(val === 'end'){
          this.restartGame()
        }
    }

    sendPayload = () => {
        const { toEmail, toName, fromName, fromEmail, won, game } = this.state;
        let to = { email: toEmail, name:toName }
        let from = { name: fromName, email: fromEmail}
        let payload = { to: to, from: from, game, action: "turn" }
        return payload;
    }

    setGameValue = ([i, j]) => {
        let newArray = this.state.game;
        newArray[i][j] = this.state.firstTurn ? 'X' : 'T';
        this.setState(previousState => ({
            presentTurn: false,
            game: newArray
        }));
        
        let val = this.checkWon(newArray);
        this.setMatchStatus(val);
        socket.emit("nextTurn", this.sendPayload());
    }

    checkWon = (newArray) => {
        let count = 0;
        let arrayLen = newArray.length;
        let leftCrossX = leftCrossT = rightCrossX = rightCrossT = 0;
        for (let i = 0; i < arrayLen; i++) {
            var rowX = rowT = colX = colT = 0;
            if (newArray[i][i] === 'X') {
                leftCrossX++;
            }
            if (newArray[i][i] === 'T') {
                leftCrossT++;
            }
            if (newArray[i][arrayLen - i] === 'X') {
                rightCrossX++;
            }
            if (newArray[i][arrayLen - i] === 'T') {
                rightCrossT++;
            }
            for (let j = 0; j < arrayLen; j++) {
                if (newArray[i][j] === 'X') {
                    rowX ++;
                }
                if (newArray[j][i] === 'X') {
                    colX++;
                }
                if (newArray[i][j] === 'T') {
                    rowT++;
                }
                if (newArray[j][i] === 'T') {
                    colT++;
                }
                if(newArray[i][j] === 'X' || newArray[i][j] === 'T'){
                    count++;
                }
            }
        }
        if (leftCrossX === 3 || rightCrossX === 3 || rowX === 3 || colX === 3) {
            return 'X';
        }
        if (leftCrossT === 3 || rightCrossT === 3 || rowT === 3 || colT === 3) {
            return 'T';
        }
        if(count === 9){
            return 'end'
        }
        return '';
    }
    
    restartGame = () => {
        this.setState(previousState => ({
            firstTurn: !this.state.firstTurn,
            presentTurn: !this.state.firstTurn,
            game: [['', '', ''], ['', '', ''], ['', '', '']]
        }));
        let payload = this.sendPayload();
        delete payload.game;
        payload.action = "restart";
        socket.emit("restart", payload);
    }

    endGame= ()=>{
        let payload = this.sendPayload();
        payload.action = "endGame";
        socket.emit("end_tournament", payload);
        console.log("end game", payload);
        this.props.closeTournament();
    }

    render() {
        let k = 0;
        var tickTackToe = [];
        this.state.game.forEach((eachCol, outIndex) => {
            eachCol.forEach((inside, inIndex) => {
                k = k + 1;
                tickTackToe.push(<TouchableOpacity key={k} style={styles.gameContainerBoxes}
                    disabled={!this.state.presentTurn || inside? true: false} 
                    onPress={() => { this.setGameValue([outIndex, inIndex]) }}>
                    <Text style={styles.gameContainerText}> {!inside?"":inside}</Text>
                </TouchableOpacity>);
            })
        })

        return (
            <View style={{ flex: 1, justifyContent: 'space-around', backgroundColor: 'rgba(212,223,250)', }}>
                <View style={{ alignItems: "center" }}>
                    <Text style={{ color: "#B4AA37", fontSize: 30, fontStyle: 'italic', fontWeight: "bold" }}>TIC-TAC-TOE</Text>
                </View>
                <View>
                    <View style={{ flexDirection: 'row', alignSelf: 'center' }}>
                        <View style={styles.scoreBox}>
                            <Text style={styles.turnText}>{this.state.presentTurn ? "Play" : 'Stop'}</Text>
                        </View>
                        <View style={styles.scoreBox}>
                            <Text style={styles.turnText}>{this.state.presentTurn ? "Stop" : "Playing"}</Text>
                        </View>
                    </View>
                    <View style={{ flexDirection: 'row', alignSelf: 'center' }}>
                        <View style={styles.scoreBox}>
                            <Text style={styles.scoreBoxText} >{this.state.fromName.toUpperCase()}</Text>
                            <Text style={styles.scoreBoxText}>{this.state.won}</Text>
                        </View>
                        <View style={styles.scoreBox}>
                            <Text style={styles.scoreBoxText} >{this.state.toName.toUpperCase()}</Text>
                            <Text style={styles.scoreBoxText} >{this.state.round - this.state.won}</Text>
                        </View>
                    </View>
                </View>
                <View style={styles.gameContainer}>
                    {tickTackToe}
                </View>
                <View>
                <TouchableOpacity style={styles.restartButton}
                    disabled={!this.state.round ? true : false}
                    onPress={() => { this.restartGame() }}>
                    <Text style={styles.restartButtonText}>Restart</Text>
                </TouchableOpacity>
                <TouchableOpacity style={styles.backButton}
                    disabled={!this.state.round ? true : false}
                    onPress={() => { this.endGame()}}>
                    <Text style={styles.restartButtonText}>Go Back</Text>
                </TouchableOpacity>
                </View>
            </View>);
    }
}


const styles = StyleSheet.create({
    scoreBox: {
        backgroundColor: '#101E6C',
        width: WIDTH * 0.5,
        paddingVertical: 8,

    },
    scoreBoxText: {
        alignSelf: 'center',
        color: 'white',
        fontSize: 17,
        fontWeight: "400"
    },
    turnText: {
        alignSelf: 'center',
        color: 'white',
    },
    gameContainerBoxes:
    {
        borderWidth: 2,
        borderColor: 'rgba(212,223,250, 0.5)',
        width: WIDTH * 0.8 / 3,
        height: WIDTH * 0.8 / 3,
        backgroundColor: '#a6bdf5',
        color: 'white',
        justifyContent: 'center'
    },
    gameContainerText: {
        color: '#6e2a46',
        fontWeight: "bold",
        fontSize: 35,
        alignSelf: 'center',
    },
    gameContainer: {
        flexWrap: 'wrap',
        flexDirection: 'row',
        backgroundColor: 'rgba(115,128,128, 0.5)',
        width: WIDTH * 0.8,
        height: WIDTH * 0.8,
        alignSelf: 'center'
    },
    restartButton: {
        borderColor: 'blue',
        backgroundColor: '#2A62E6',
        width: WIDTH,
        padding: 15,
        marginTop: 10,
    },
    backButton: {
        borderColor: 'green',
        backgroundColor: '#2A62E6',
        width: WIDTH,
        padding: 15,
        marginTop: 10,
    },
    restartButtonText: {
        color: 'white',
        fontSize: WIDTH * 0.05,
        alignSelf: 'center'
    }
})