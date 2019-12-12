const  axios = require('axios');


let data = {
    email: 'example@example.com',
    username: 'helloworld',
    password: '123456'
}
axios.post("http://localhost:3000/regiter",data)
.then(response=>{console.log(response.status)}).
catch(err=>{
    console.log(err.response.status);
})