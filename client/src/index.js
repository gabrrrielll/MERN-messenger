import React from "react";
import ReactDOM from "react-dom";
import axios from "axios";
import "./index.css";
import Messenger from "./components/Messenger";
import LogIn from "./components/LogIn";
import Register from "./components/Register";
import socketIOClient from "socket.io-client";
import { BrowserRouter, Route, Redirect, Switch } from "react-router-dom";

class FrontendApp extends React.Component {
     constructor() {
          super();

          this.initialstate = {
               username: "",
               email: "",
               firstname: "",
               lastname: "",
               password: "",
               rpassword: "",
               tel: "",
               photo: "",
               message: "",
               inform: "",
               info: "",
               myEmail: "",
               me: "",
               color: "#56baed",
               users: [],
               autentificate: true,
               authorized: false,
               display: "",
               conversation: [],
               friends_requests: [],
               requests_sent: [],
               friends: [],
               sugestions: [],
               participants: [],
               show: false,
               profile_edit: false,
               data: [],
               loaded: false,
               response: false,
               endpoint: process.env.PORT || "http://localhost:4000"
          };

          this.state = this.initialstate;
     }

     loadData = myEmail => {
          console.log("-----loadData-------:")
// this function load data from backend sockets
          const socket = socketIOClient(this.state.endpoint);

          socket.on("usersAPI", users => {
                 console.log("socket was connected and response:", process.env.PWD)
               this.sortUsers(users, myEmail);
          });
          socket.on("fragmentAPI" + myEmail, data =>
               this.setState( { data } )
          );
          socket.on("conversationAPI" + myEmail, data =>
               this.setState(
                    { conversation: data.messages, participants: data.participants }
                    /*  console.log("conversationAPI: ",data)  */
               )
          );
     };

     sortUsers = (users, myEmail) => {
       // function for sort users
          if (!myEmail) {
               myEmail = this.state.myEmail;
          }
          // console.log("triger the sortUsers = ( users, myEmail  ):->", users, myEmail )
          if (users) {
               var me = users.find(el => el.email === myEmail);
               var sugestions =
                    me &&
                    users
                         .filter(user => user.email !== me.email)
                         .filter(el => el.email !== me.friends.find(email => email === el.email))
                         .filter(
                              elem =>
                                   elem.email !==
                                   me.friends_requests.find(email => email === elem.email)
                         )
                         .sort((a, b) => {
                              if (a.last_activity > b.last_activity) {
                                   return -1;
                              } else if (a.last_activity < b.last_activity) {
                                   return 1;
                              }
                              return 0;
                         });
               var friends =
                    me &&
                    users
                         .filter(
                              friend =>
                                   friend.email === me.friends.find(email => email === friend.email)
                         )
                         .sort((a, b) => {
                              if (a.last_activity > b.last_activity) {
                                   return -1;
                              } else if (a.last_activity < b.last_activity) {
                                   return 1;
                              }
                              return 0;
                         });
          }

          this.setState({
               users,
               me,
               sugestions,
               friends,
               friends_requests: me.friends_requests,
               requests_sent: me.requests_sent,
               authorized: true
          });

          if (this.state.display === "" && friends.length > 0) {
               this.display(friends[0].email);
          } else if (this.state.display === "" && friends.length === 0) {
               this.display(this.state.sugestions[0].email);
          }
     };

     display = email => {
       // function which set what conversation will be displayed in center
          // console.log("display-->email: ", email)
          if (this.state.profile_edit) {
               this.setState({ profile_edit: false, inform: "" });
          }
          axios.get( process.env +"/conversation", {
               headers: {
                    token: window.localStorage.getItem("token"),
                    hisemail: email
               }
          })
               .then(res => {
                    if (res.data.data !== null) {
                         //console.log( "res.data.data.messages", res.data.data.messages)
                         this.setState({
                              display: email,
                              inform: ""
                              //conversation: res.data.data.messages,
                              //participants: res.data.data.participants
                         });
                    } else {
                         var conversation = [
                              {
                                   text: "Conversations are allowed only between friends :)).",
                                   email: this.state.me.email,
                                   time: Date.now()
                              }
                         ];
                         this.setState({
                              display: email,
                              conversation: conversation,
                              participants: [],
                              inform: ""
                         });
                    }
               })
               .catch(err => {
                    console.log("Error in DB for display conversation", err);

                    this.setState({
                         display: email,
                         //conversation: [],
                         //participants: [],
                         inform: ""
                    });
               });
// after set the conversation, it must scroll up the text
          this.scrollUP();
     };

     updateData = event => {
       // function for update state with input value
          this.setState({
               [event.target.id]: event.target.value,
               inform: "",
               info: ""
          });
     };

     setColor = () => {
       // function for setting the favorite color on the user page
          if (this.state.color) {
               var color = this.state.favcolor;
          } else {
               color = this.state.me.color;
          }
          axios.post( process.env +"/changecolorprofile", {
               token: window.localStorage.getItem("token"),
               color: color
          })
               .then(response => {
                    this.loadData();
                    //console.log(" response", response);

                    if (this.state.me.email) {
                         this.setState({
                              inform: response.data.inform,
                              display: this.state.me.email,
                              color: this.state.favcolor
                         });
                    }
               })
               .catch(error => {
                    console.log(error, "eroare la accesare");
               });
     };
     profileChange = () => {
      // function for changing user identification data
          if (this.state.firstname) {
               var firstname = this.state.firstname;
          } else {
               firstname = this.state.me.firstname;
          }
          if (this.state.lastname) {
               var lastname = this.state.lastname;
          } else {
               lastname = this.state.me.lastname;
          }
          if (this.state.tel) {
               var tel = this.state.tel;
          } else {
               tel = this.state.me.tel;
          }
          if (this.state.photo) {
               var photo = this.state.photo;
          } else {
               photo = this.state.me.photo;
          }
          if (this.state.color) {
               var color = this.state.color;
          } else {
               color = this.state.me.color;
          }
          axios.post( process.env +"/changeprofile", {
               token: window.localStorage.getItem("token"),
               firstname: firstname,
               lastname: lastname,
               original_pass: this.state.password,
               new_pass: this.state.rpassword,
               tel: tel,
               photo: photo,
               color: color
          })
               .then(response => {
                    //  console.log(" response",  response)

                    if (this.state.me.email) {
                         this.setState({
                              inform: response.data.inform,
                              display: this.state.me.email
                         });
                    }
               })
               .catch(error => {
                    console.log(error, "error");
                    this.setState({ inform: "Old password didn't match!" });
               });
     };

     changeForm = () => {
       // function for change between login and register form
          this.setState({ autentificate: !this.state.autentificate });
     };

     logout = () => {
          window.localStorage.removeItem("token");
          this.setState(this.initialstate);
     };

     scrollUP = () => {
       // function for scroll up the conversation
          var elmnt = document.getElementById("conversation");
          if (elmnt !== null) {
               elmnt.scrollTop = elmnt.scrollHeight;
          }
     };
     showProfile = () => {
       // function for displaying the user profile
          this.setState({
               show: !this.state.show,
               display: this.state.me.email
          });
     };
     editProfile = () => {
       // function for edit the user's dates
          this.setState({
               profile_edit: !this.state.profile_edit,
               display: this.state.me.email,
               inform: " If you don't want change your password, just leave the fields empty"
          });
     };

     sendMessage = () => {
       // function for send messages
          //console.log(" toUserEmail",  this.state.message );
          if (this.state.message === "") return;
          if (this.state.message.length > 1000) {
               this.setState({
                    info: "This message is longer than 1000 characters!"
               });
               return;
          }

          axios.post( process.env +"/addmessage", {
               token: window.localStorage.getItem("token"),
               hisemail: this.state.display,
               message: this.state.message
          })
               .then(res => {
                    // console.log( " sendMessage res.data: ", res.data  );
                    // this.display(this.state.display);
                    this.setState({ message: "", info: "" });
                    this.scrollUP();
               })
               .catch(err => {
                    console.log(err);
                    this.setState({
                         message: "",
                         info: "This message is longer than 1000 characters!"
                    });
               });
          this.scrollUP();
     };
     tryRegister = () => {
          if (this.state.rpassword !== this.state.password) {
               this.setState({ inform: "Passwords don't match!" });
               return;
          }
          axios.post( process.env +"/register", {
               username: this.state.username,
               email: this.state.email,
               firstname: this.state.firstname,
               lastname: this.state.lastname,
               password: this.state.password,
               tel: this.state.tel,
               photo: this.state.photo
          })
               .then(response => {
                    console.log(response);
                    this.setState({ inform: response.data.inform });
               })
               .catch(err => {
                    this.setState({ inform: err.response.data.inform });
                    console.log(err);
               });
     };

     tryLogin = () => {
          axios.post( process.env +"/login", {
               email: this.state.myEmail,
               password: this.state.password
          })
               .then(response => {
                    if (response.data.token && this.state.myEmail === response.data.myEmail) {
                         this.secretToken = response.data.token;
                         window.localStorage.setItem("token", response.data.token);

                         this.setState({
                              authorized: true,
                              inform: response.data.inform
                         });

                         this.loadData(response.data.myEmail);
                    } else {
                         this.setState({ inform: response.data.inform });
                    }
               })
               .catch(err => {
                    this.setState({ inform: "Wrong combination!" });
                    console.log(err);
               });
     };

     sendFriendRequest = email => {
          axios.post( process.env +"/sendfriendrequest", {
               token: window.localStorage.getItem("token"),
               email_target: email
          })
               .then(response => {
                    //  console.log("response.data.requestSentEmail", response.data );
               })
               .catch(error => {
                    console.log(error, "eroare la accesare");
               });
     };
     revokeFriendRequest = email => {
          axios.post( process.env +"/revokefriendrequest", {
               token: window.localStorage.getItem("token"),
               email_target: email
          })
               .then(response => {
                    // console.log("response.data.revokefriendrequest", response.data );
               })
               .catch(error => {
                    console.log(error, "eroare la accesare");
               });
     };
     deniedFriendRequest = email => {
          axios.post( process.env +"/deniedfriendrequest", {
               token: window.localStorage.getItem("token"),
               email_target: email
          })
               .then(response => {
                    //console.log(response)
                    //  this.users();
               })
               .catch(error => {
                    console.log(error, "eroare la accesare");
               });
     };
     acceptFriendRequest = email => {
          axios.post( process.env +"/acceptfriendrequest", {
               token: window.localStorage.getItem("token"),
               email_target: email
          })
               .then(response => {
                    //console.log("response", response)
                    //this.users();
               })
               .catch(error => {
                    console.log(error, "eroare la accesare");
               });
     };

     removeFriend = email => {
          var confirmation = window.confirm(
               "You will delete this user from your friends list. Are you sure?"
          );
          if (confirmation) {
               axios.post( process.env +"/removefriend", {
                    token: window.localStorage.getItem("token"),
                    email_target: email
               })
                    .then(response => {
                         //console.log(" response",  response)
                    })
                    .catch(error => {
                         console.log(error, "eroare la accesare");
                    });
          }
     };

     //this function is for check autorization and comand load data from backend
     checkToken = token => {
          if (!token) {
               token = window.localStorage.getItem("token");
          }
          // console.log("trigger this.checkToken(); TOKEN.....>", token )
          axios.post( process.env +"/checkToken", {
               token: token
          })
               .then(response => {
                    // console.log("checkToken() OK!, MY Email ->>", response.data.myEmail )
                    //this.sortUsers( response.data.users, response.data.myEmail )
                    this.setState({
                         authorized: response.data.authorized,
                         myEmail: response.data.myEmail,
                         loaded: true
                    });

                    this.loadData(response.data.myEmail);
                    // console.log("s-a verificat tokenul, a venit raspunsul si s-a activat  this.loadData( response.data.myEmail );", response.data.myEmail )
               })
               .catch(error => {
                    console.log(error, "DB acces error");
               });
     };

     componentDidMount() {
          if (window.localStorage.getItem("token") && this.state.users.length === 0) {
               this.checkToken();
          }
     }

     render() {
          return (
               <BrowserRouter>
                    {this.state.authorized ? (
                         <Redirect to="/" />
                    ) : this.state.autentificate ? (
                         <Redirect to="/login" />
                    ) : (
                         <Redirect to="/register" />
                    )}

                    <Switch>
                         <Route
                              exact
                              path="/"
                              render={props => (
                                   <Messenger
                                        loadData={this.loadData}
                                        logout={this.logout}
                                        display={this.display}
                                        state={this.state}
                                        updateData={this.updateData}
                                        sendMessage={this.sendMessage}
                                        sendFriendRequest={this.sendFriendRequest}
                                        revokeFriendRequest={this.revokeFriendRequest}
                                        deniedFriendRequest={this.deniedFriendRequest}
                                        acceptFriendRequest={this.acceptFriendRequest}
                                        removeFriend={this.removeFriend}
                                        showProfile={this.showProfile}
                                        editProfile={this.editProfile}
                                        profileChange={this.profileChange}
                                        scrollUP={this.scrollUP}
                                        setColor={this.setColor}
                                   />
                              )}
                         />

                         <Route
                              path="/login"
                              render={props => (
                                   <LogIn
                                        updateData={this.updateData}
                                        state={this.state}
                                        tryLogin={this.tryLogin}
                                        changeForm={this.changeForm}
                                   />
                              )}
                         />
                         <Route
                              path="/register"
                              render={props => (
                                   <Register
                                        updateData={this.updateData}
                                        state={this.state}
                                        tryRegister={this.tryRegister}
                                        changeForm={this.changeForm}
                                   />
                              )}
                         />
                    </Switch>
               </BrowserRouter>
          );
     }
}

const rootElement = document.getElementById("root");
ReactDOM.render(<FrontendApp />, rootElement);
