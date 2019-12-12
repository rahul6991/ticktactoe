import React, { Component } from 'react';
import { View, AsyncStorage, Button, alert, StyleSheet, Text, ImageBackground, Dimensions, TextInput, TouchableOpacity, StatusBar } from 'react-native';
import bgImage from './images/background.jpeg';
import Login from './pages/Login';
import Signup from './pages/Signup';
import Home from './pages/Home';
import axios from 'axios';

const { width: WIDTH,height:HEIGHT } = Dimensions.get('window');

export default class App extends Component {
  constructor(props) {
    super(props);
  }
  componentDidMount(){
    AsyncStorage.getItem('x-auth').then((token)=>{
      axios.get('http://192.168.0.102:3000/details',{
        headers: {'x-auth': token}
      }).then(res=>{
        if(res.status  == 200){
          this.setState(previousState=>({
            isLogin:false,
            isSignup: false,
            isHome: true
          }));
        }
      }).catch(err=>{
        console.log("invalid token",err);
      })
    })
  }
  
  state = {
    isLogin: true,
    isSignup: false,
    isHome: false,
    mobile: '',
    password: '',
    email: '',
    name: '',
  }

  changeText = (val, path) => {
    var field ={};
    field[path]=val;
    this.setState(previousState => (field));
  }

  onLogin = (newValue) => {
    this.setState(previousState=>(newValue));
    const {password, email} = this.state;
    if(email.length> 9 && password){
      axios.post('http://192.168.0.102:3000/user/login',{
        password,
        email
      }).then(res=>{
        if(res.status == 201){
       try{ 
         const token = res.headers['x-auth'];
        if(token){
          AsyncStorage.setItem('x-auth',token).then(()=>{
            this.setState(previousState=>({
              isLogin:false,
              isSignup: false,
              isHome: true
            }));
          }).catch(err=>{
            console.log(err);
          })
        }
      }catch(err){
        console.log(err);
      }
    }
    else{
      console.log("wrong fields");
    }
  }).catch(err=>{
    console.log(err);
  })

  }
}

  onSignup = (newValue)=>{
    this.setState(previousState=>(newValue));
    const { email, password, name, mobile} = this.state;
    if(email.length!= null && email.length> 4 && password && mobile){
      axios.post('http://192.168.0.102:3000/user/register',{
        email,
        password,
        name,
        mobile
      }).then(res=>{
        console.log("yippie",res)
        if(res.status == 201){
          this.setState(previousState=>({
            isLogin:true,
            isSignup: false,
            isHome: false
          }))
        }
      }).catch(err=>{
        console.log(email,password, mobile,name,err)
        console.log("ererererere",err)
      })
    }
    else {
      console.log("hello");
    }
  }

  togglePageView = ()=>{
    this.setState(previousState=>({
      isLogin:!this.state.isLogin,
      isSignup: !this.state.isSignup
    }));
  }

  render() {
    let comp;
    if(this.state.isLogin){
        comp =(<Login 
        isSignup ={this.state.isSignup} 
        onSubmit={this.onLogin} 
        toggleView={this.togglePageView}
        />);
    }else if(this.state.isSignup){
      comp = (<Signup 
        isSignup={this.state.isSignup}
        onSubmit={this.onSignup}  
        toggleView={this.togglePageView}
      />);
    }
    else{
      return (
      <ImageBackground source={bgImage} style={styles.backgroundContainer}>
        <Home mobile={this.state.mobile}/></ImageBackground>
        );
    }
    return (
      <ImageBackground source={bgImage} style={styles.backgroundContainer}>
        <View style={{flex:1,justifyContent: 'center'}}>
        {comp}
        </View>
      </ImageBackground>
    );
  }
}

const styles = StyleSheet.create({
  backgroundContainer: {
    flex: 1,
    width: null,
    height: null,
  },
  buttonContainer: {
    width: WIDTH * 0.9,
    height:HEIGHT * 0.4,
    alignSelf: 'center'
  }
});

