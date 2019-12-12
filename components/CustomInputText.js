import React, { Component } from 'react';
import { StyleSheet, Text, View, Image, Dimensions, TextInput, TouchableOpacity, Platform } from 'react-native';
const { width: WIDTH } = Dimensions.get('window');
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';

export default class CustomInputText extends Component {
    constructor(props){
        super(props);

        this.state = {
            secureText: props.inpTextField.password||false,
            secureTextToggle:props.inpTextField.password||false,
            textIconColor: props.icon.iconColor||'blue',
            textIconName: props.icon.iconName||'magnify',
            iconColor: props.icon.iconColor||'blue',
            changeText: props.changeText,
            changeTextPath: props.changeTextPath
        };
    }

    iconColorChange=(val=false)=>{
        if(val){
            this.setState(previousState=>({iconColor: 'grey'}))
            return
        }
        this.setState(previousState=>({iconColor: this.state.textIconColor}));
        return
    }

    secureTextToggle=(val=this.state.secureText)=>{
        if(this.state.secureTextToggle){
            this.setState(previousState=>({secureText: !this.state.secureText}))
        }
    }
    render() {
     return (
         <View style={styles.container}>
             <Icon name={this.state.textIconName} size={WIDTH*0.1} style= {{color: this.state.iconColor}} 
             onPress={()=>this.secureTextToggle(this.state.secureText)} />
               <TextInput
               placeholder={this.state.changeTextPath}
               placeholderTextColor={'black'}
               secureTextEntry={this.state.secureText}
               onChangeText={(text)=>{this.state.changeText(text,this.state.changeTextPath)}}
               onFocus = {()=>this.iconColorChange(true)}
               onBlur={()=>this.iconColorChange(false)}
               style={styles.textInput}
                />
         </View>
       );
   }
}

const styles = StyleSheet.create(
    {
    container:{
        marginVertical: 15,
        alignSelf: 'center',
        backgroundColor: 'rgba(255,255,255, 0.1)',
        flexDirection: 'row',
        width:WIDTH *0.9,
        padding:5,
        borderColor: 'black',
        borderWidth: 2
    },
    textInput: {
        backgroundColor: 'rgba(255,255,255, 0.01)',
        width: WIDTH * 0.9,
        color: 'grey',
        fontSize: WIDTH * 0.05,
    }
}
);