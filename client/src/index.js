import React from "react";
import ReactDOM from "react-dom";
import axios from "axios";
import "./index.css";
import Messenger from "./components/Messenger";
import LogIn from "./components/LogIn";
import Register from "./components/Register";
import socketIOClient from "socket.io-client";
import { BrowserRouter, Route, Redirect, Switch } from "react-router-dom";
const JWT = require("jsonwebtoken");

class FrontendApp extends React.Component {
    constructor() {
        super();

        this.initialstate = {
            username: "",
            email: "",
            showEmailInput: true,
            firstname: "",
            lastname: "",
            password: "demo",
            rpassword: "",
            tel: "",
            photo: "",
            message: "",
            inform: "",
            info: "",
            infos: "",
            myEmail: "demo@demo.com",
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
            EmailRequest: "",
            data: [],
            loaded: false,
            response: false,
            token: "",
            endpoint: "https://mern-messenger.herokuapp.com",
        };

        this.state = this.initialstate;
    }

    loadData = myEmail => {
        // this function load data from backend sockets
        const socket = socketIOClient(this.state.endpoint);

        socket.on("usersAPI", users => {
            // console.log("socket was connected and response:", users)
            this.sortUsers(users, myEmail);
        });
        socket.on("fragmentAPI" + myEmail, data => this.setState({ data }));
        socket.on("conversationAPI" + myEmail, data =>
            this.setState(
                { conversation: data.messages, participants: data.participants },
                /*  console.log("conversationAPI: ",data)  */
            ),
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
                    .filter(user => user.email !== myEmail)
                    .filter(el => el.email !== me.friends.find(email => email === el.email))
                    .filter(elem => elem.email !== me.friends_requests.find(email => email === elem.email))
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
                    .filter(friend => friend.email === me.friends.find(email => email === friend.email))
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
            myEmail,
            me,
            sugestions,
            friends,
            friends_requests: me.friends_requests,
            requests_sent: me.requests_sent,
            authorized: true,
        });

        if (this.state.display === "" && friends.length > 0) {
            this.display(friends[0].email);
        } else if (this.state.display === "" && friends.length === 0 && this.state.sugestions.lenght) {
            this.display(this.state.sugestions[0].email);
        }
    };

    display = email => {
        // function which set what conversation will be displayed in center
        // console.log("display-->email: ", email)
        var left = document.getElementById("left");
        var center = document.getElementById("center");
        var right = document.getElementById("right");
        if (window.innerWidth < 768) {
            if (center.style.display === "none") {
                left.style.display = "none";
                center.style.display = "block";
                right.style.display = "none";
                this.setState({ show: true });
            } else {
                left.style.display = "block";
                center.style.display = "none";
                right.style.display = "none";
                this.setState({ show: false });
            }
        } else {
            left.style.display = "block";
            center.style.display = "block";
            right.style.display = "block";
            this.setState({ show: true });
        }

        if (this.state.profile_edit) {
            this.setState({ profile_edit: false, inform: "" });
        }
        axios
            .get(this.state.endpoint + "/conversation", {
                headers: {
                    token: window.localStorage.getItem("token"),
                    hisemail: email,
                },
            })
            .then(res => {
                if (res.data.data !== null) {
                    //console.log( "res.data.data.messages", res.data.data.messages)
                    this.setState({
                        display: email,
                        inform: "",
                        //conversation: res.data.data.messages,
                        //participants: res.data.data.participants
                    });
                } else {
                    var conversation = [
                        {
                            text: "Conversations are allowed only between friends :)).",
                            email: this.state.me.email,
                            time: Date.now(),
                        },
                    ];
                    this.setState({
                        display: email,
                        conversation: conversation,
                        participants: [],
                        inform: "",
                    });
                }
            })
            .catch(err => {
                console.log("Error in DB for display conversation", err);

                this.setState({
                    display: email,
                    //conversation: [],
                    //participants: [],
                    inform: "",
                });
            });
        // after set the conversation, it must scroll up the text
        this.scrollUP();
    };

    updateData = event => {
        this.setState({
            [event.target.id]: event.target.value,
            inform: "",
            info: "",
            infos: "",
        });

        var input = document.getElementById(event.target.id);
        input.addEventListener(
            "keydown",
            event => {
                if ((event.keyCode === 13 || event.charCode === 13) && event.target.id !== "message") {
                    document.getElementById("submit").click();
                }
            },
            false,
        );
    };

    setColor = () => {
        // function for setting the favorite color on the user page
        if (this.state.color) {
            var color = this.state.favcolor;
        } else {
            color = this.state.me.color;
        }
        axios
            .post(this.state.endpoint + "/changecolorprofile", {
                token: window.localStorage.getItem("token"),
                color: color,
            })
            .then(response => {
                this.loadData();
                //console.log(" response", response);

                if (this.state.me.email) {
                    this.setState({
                        inform: response.data.inform,
                        display: this.state.me.email,
                        color: this.state.favcolor,
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
        axios
            .post(this.state.endpoint + "/changeprofile", {
                token: window.localStorage.getItem("token"),
                firstname: firstname,
                lastname: lastname,
                original_pass: this.state.password,
                new_pass: this.state.rpassword,
                tel: tel,
                photo: photo,
                color: color,
            })
            .then(response => {
                //  console.log(" response",  response)

                if (this.state.me.email) {
                    this.setState({
                        inform: response.data.inform,
                        display: this.state.me.email,
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
    keyEnter = e => {
        //  function for set enter key on submit messages
        if (e.charCode === 13 || e.keyCode === 13) {
            this.sendMessage();
        }
    };
    showMobileBack = () => {
        // function for displaying the user profile

        var left = document.getElementById("left");
        var center = document.getElementById("center");
        var right = document.getElementById("right");
        if (left.style.display === "none") {
            left.style.display = "block";
            center.style.display = "none";
            right.style.display = "none";
            this.setState({ show: false });
        } else {
            left.style.display = "none";
            center.style.display = "block";
            right.style.display = "none";
            this.setState({ show: true });
        }
    };
    editProfile = () => {
        // function for edit the user's dates
        var left = document.getElementById("left");
        var center = document.getElementById("center");
        var right = document.getElementById("right");
        if (window.innerWidth < 768) {
            if (right.style.display === "block") {
                left.style.display = "none";
                center.style.display = "block";
                right.style.display = "none";
            } else {
                left.style.display = "none";
                center.style.display = "none";
                right.style.display = "block";
            }
        } else {
            left.style.display = "block";
            center.style.display = "block";
            right.style.display = "block";
        }

        this.setState({
            profile_edit: true,
            display: this.state.me.email,
            inform: " If you don't want change your password, just leave the fields empty",
        });
    };

    sendMessage = () => {
        // function for send messages
        //console.log(" toUserEmail",  this.state.message );
        if (this.state.message === "") return;
        if (this.state.message.length > 1000) {
            this.setState({
                info: "This message is longer than 1000 characters!",
            });
            return;
        }

        axios
            .post(this.state.endpoint + "/addmessage", {
                token: window.localStorage.getItem("token"),
                hisemail: this.state.display,
                message: this.state.message,
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
                    info: "This message is longer than 1000 characters!",
                });
            });
        this.scrollUP();
    };
    tryRegister = () => {
        if (/^\w+([.-]?\w+)*@\w+([.-]?\w+)*(.\w{2,3})+$/.test(this.state.email)) {
            if (this.state.rpassword !== this.state.password) {
                this.setState({ inform: "Passwords don't match!" });
                return;
            }
            if (this.state.friends_requests) {
                var friends_requests = this.state.friends_requests;
            } else {
                friends_requests = [];
            }
            axios
                .post(this.state.endpoint + "/register", {
                    email: this.state.email,
                    firstname: this.state.firstname,
                    lastname: this.state.lastname,
                    password: this.state.password,
                    tel: this.state.tel,
                    photo: this.state.photo,
                    friends_requests,
                })
                .then(response => {
                    // console.log(response);
                    this.setState({ inform: response.data.inform, autentificate: true });
                })
                .catch(err => {
                    this.setState({ inform: err.response.data.inform });
                    console.log(err);
                });
        } else {
            this.setState({ inform: "You entered invalid email!" });
        }
    };

    tryLogin = () => {
        axios
            .post(this.state.endpoint + "/login", {
                email: this.state.myEmail,
                password: this.state.password,
            })
            .then(response => {
                if (response.data.token && this.state.myEmail === response.data.myEmail) {
                    window.localStorage.setItem("token", response.data.token);

                    this.setState({
                        authorized: true,
                        inform: response.data.inform,
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
        axios
            .post(this.state.endpoint + "/sendfriendrequest", {
                token: window.localStorage.getItem("token"),
                email_target: email,
            })
            .then(response => {
                //  console.log("response.data.requestSentEmail", response.data );
            })
            .catch(error => {
                console.log(error);
            });
    };
    revokeFriendRequest = email => {
        axios
            .post(this.state.endpoint + "/revokefriendrequest", {
                token: window.localStorage.getItem("token"),
                email_target: email,
            })
            .then(response => {
                // console.log("response.data.revokefriendrequest", response.data );
            })
            .catch(error => {
                console.log(error);
            });
    };
    deniedFriendRequest = email => {
        axios
            .post(this.state.endpoint + "/deniedfriendrequest", {
                token: window.localStorage.getItem("token"),
                email_target: email,
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
        axios
            .post(this.state.endpoint + "/acceptfriendrequest", {
                token: window.localStorage.getItem("token"),
                email_target: email,
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
        var confirmation = window.confirm("You will delete this user from your friends list. Are you sure?");
        if (confirmation) {
            axios
                .post(this.state.endpoint + "/removefriend", {
                    token: window.localStorage.getItem("token"),
                    email_target: email,
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
        axios
            .post(this.state.endpoint + "/checkToken", {
                token: token,
            })
            .then(response => {
                this.setState({
                    authorized: response.data.authorized,
                    myEmail: response.data.myEmail,
                    loaded: true,
                });

                this.loadData(response.data.myEmail);
            })
            .catch(error => {
                console.log(error, "DB acces error");
            });
    };

    sendEmailRequest = () => {
        //console.log("sendEmailRequest", this.state.EmailRequest);

        if (/^\w+([.-]?\w+)*@\w+([.-]?\w+)*(.\w{2,3})+$/.test(this.state.EmailRequest)) {
            this.setState({ infos: "" });
            axios
                .post(this.state.endpoint + "/sendEmailRequest", {
                    token: window.localStorage.getItem("token"),
                    email_target: this.state.EmailRequest,
                })
                .then(response => {
                    //console.log(" response", response);
                    this.setState({ infos: response.data.infos });
                })
                .catch(error => {
                    console.log(error);
                });
            return true;
        }
        this.setState({ infos: "You entered an invalid email address" });
        return false;
    };

    componentDidMount() {
        if (window.localStorage.getItem("token") && this.state.users.length === 0) {
            this.checkToken();
        }
    }
    getToken() {
        var token = window.location.pathname.slice(20);
        //console.log("token------->", token);
        JWT.verify(token, "47vhc93y5hncbwier7rr22", (error, payload) => {
            if (error) {
                console.log("eror payload", error);
            }
            if (payload) {
                this.setState({ autentificate: false, email: payload.mail, friends_requests: payload.friends_requests, showEmailInput: false });
            }
        });
    }

    render() {
        if (window && window.location.pathname.slice(0, 20) === "/emailfriendrequest/") {
            this.getToken();
        }

        return (
            <BrowserRouter>
                {this.state.authorized ? <Redirect to="/" /> : this.state.autentificate ? <Redirect to="/login" /> : <Redirect to="/register" />}
                <Switch>
                    <Route
                        exact
                        path="/"
                        render={props => (
                            <Messenger
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
                                showMobileBack={this.showMobileBack}
                                editProfile={this.editProfile}
                                profileChange={this.profileChange}
                                scrollUP={this.scrollUP}
                                setColor={this.setColor}
                                sendEmailRequest={this.sendEmailRequest}
                                keyEnter={this.keyEnter}
                            />
                        )}
                    />

                    <Route path="/login" render={props => <LogIn updateData={this.updateData} state={this.state} tryLogin={this.tryLogin} changeForm={this.changeForm} keyEnter={this.keyEnter} />} />
                    <Route path="/register" render={props => <Register updateData={this.updateData} state={this.state} tryRegister={this.tryRegister} changeForm={this.changeForm} keyEnter={this.keyEnter} />} />
                </Switch>
            </BrowserRouter>
        );
    }
}

const rootElement = document.getElementById("root");
ReactDOM.render(<FrontendApp />, rootElement);
