const JWT = require("jsonwebtoken");
const User = require("../models/users");
const Conversation = require("../models/conversations");
const CONFIG = require("../config");
const nodemailer = require("nodemailer");

var myEmail;

const checkToken = (req, res) => {
    // this function is for  check the token when exist in browser local storage and send the data
    if (req.headers["token"]) {
        var token = req.headers["token"];
    } else if (req.params.token) {
        var token = req.params.token;
    } else if (req.body.token) {
        var token = req.body.token;
    } else if (req.body.stop) {
        var token = req.body.token;
        console.log(" inform:--Token empty", req.body.stop, token);
        res.status(403);
        res.send({ message: "Token empty", authorized: false });
        return;
    } else {
        res.status(403);
        res.send({ inform: "Token empty", authorized: false });
        return;
    }

    JWT.verify(token, CONFIG.JWT_SECRET_KEY, (error, payload) => {
        if (error) {
            res.status(403);
            res.send({ inform: "Invalid token", authorized: false });
            myEmail = undefined;
            return myEmail;
        } else {
            User.find({}).then(users => {
                if (users) {
                    res.status(200);
                    res.send({
                        inform: "Valid token",
                        authorized: true,
                        users,
                        myEmail: payload.email,
                    });

                    console.log("ok, find users in checktoken");
                }
            });

            myEmail = payload.email;
            setLastActivity(myEmail);
            convFragment(myEmail);
            sendData();
        }
    });
};

const sendData = () => {
    // function to send list of users
    User.find({}).then(users => {
        if (users) {
            CONFIG.io.emit("usersAPI", users);
            //console.log("ok, find users --- io.emit->usersAPI ");
        }
    });
};

const loadSocket = () => {
    CONFIG.io.on("connection", socket => {
        // connect the sockets for live emissions
        console.log("New client connected", socket.id);
        sendData();
        convFragment(myEmail);

        socket.on("disconnect", () => console.log("Client disconnected"));
    });
};

const liveConversation = (myEmail, hisEmail, io) => {
    // live emission of conversation
    //console.log("live emission of conversation");
    Conversation.findOne({
        $or: [{ "participants.1.email": myEmail, "participants.0.email": hisEmail }, { "participants.0.email": myEmail, "participants.1.email": hisEmail }],
        //participants: { $all: [ myEmail  , hisEmail ] }
    }).then(conv => {
        if (conv !== null) {
            CONFIG.io.emit("conversationAPI" + myEmail, conv);
            CONFIG.io.emit("conversationAPI" + hisEmail, conv);
        } else {
            var conv = [];
            CONFIG.io.emit("conversationAPI" + myEmail, conv);
            CONFIG.io.emit("conversationAPI" + hisEmail, conv);
        }
    });
};

const register = (req, res) => {
    if (req.body.friends_requests.length) {
        // This situation is when registration is after user received a invitation to register from another user on mail
        if (req.body && req.body.email && req.body.password) {
            var newUser = new User({
                email: req.body.email,
                username: req.body.email,
                firstname: req.body.firstname,
                lastname: req.body.lastname,
                mail_confirm: true,
                password: req.body.password,
                tel: req.body.tel,
                photo: req.body.photo ? req.body.photo : "https://www.w3schools.com/w3css/img_avatar3.png",
                friends: req.body.friends_requests,
                friends_requests: [],
                requests_sent: [],
            });

            newUser.save((err, result) => {
                if (err) {
                    console.log(err);
                    res.status(200).json({ inform: "The email is allready teaken" });
                } else {
                    User.findOne({ email: req.body.friends_requests })
                        .then(sent => {
                            //console.log("person who send me request>", sent);

                            sent.requests_sent = sent.requests_sent.filter(el => el !== req.body.email);
                            sent.friends.push(req.body.email);
                            sent.save();
                            setLastActivity(req.body.email);
                            sendData();

                            //create the conversation with this accept
                            var salut = " Say hello to your new friend! 👋 ";
                            createConversation(req.body.email, req.body.friends_requests, salut);

                            // res.status(200).json({ inform: "success" });
                        })
                        .catch(err => {
                            console.log("DB error");
                            console.log(err);
                            res.sendStatus(500);
                        });

                    var to = req.body.email;
                    var subject = "Registration with succes!";
                    var cont = "<center><h5>Hi, your registration on MESSENGER was successful! Click  <a href ='https://mern-messenger.herokuapp.com/' ><b>HERE</b></a> to login.</h5></center>";
                    emailSender(to, subject, cont);

                    var to = "gabrrrielll@gmail.com";
                    var subject = "New user on MERN-Messenger";
                    var cont = "<center><h5>Hi Admin, a new user with name<b> " + sent.firstname + " " + sent.lastname + "</b>  and with email: <b>" + myEmail + " </b> was register in MERN Messenger App with invitation from user with email: " + req.body.friends_requests + " on " + Date.now().toString() + " </h5></center>";
                    emailSender(to, subject, cont);

                    res.send({
                        statusCode: 200,
                        inform: "Register with succes! ",
                    });
                }
            });
        } else {
            res.status(422).json({ inform: "Please provide all data for register process !" });
        }
    } else {
        // This situation is from normaly registration
        if (req.body && req.body.email && req.body.password) {
            var newUser = new User({
                email: req.body.email,
                username: req.body.email,
                firstname: req.body.firstname,
                lastname: req.body.lastname,
                mail_confirm: false,
                password: req.body.password,
                tel: req.body.tel,
                photo: req.body.photo
                    ? req.body.photo
                    : "data:image/png;base64,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",
                friends_requests: [],
                requests_sent: [],
            });

            newUser.save((err, result) => {
                if (err) {
                    console.log(err);
                    res.status(200).json({ inform: "The email is allready teaken" });
                } else {
                    var confirmToken = JWT.sign({ confirm: true, email: req.body.email }, CONFIG.JWT_SECRET_KEY);
                    var to = req.body.email;
                    var subject = "Account verification token";
                    var cont = "<h5><center>For register on messenger, please click  <a href='https://mern-messenger.herokuapp.com/confirm/" + confirmToken + "'><b>HERE</b></a> to verify your email.</center></h5>";
                    emailSender(to, subject, cont);

                    var to = "gabrrrielll@gmail.com";
                    var subject = "New user on MERN-Messenger";
                    var cont = "<center><h5>Hi Admin, a new user with name<b> " + sent.firstname + " " + sent.lastname + "</b>  and with email: <b>" + myEmail + " </b> was register in MERN Messenger App in default mode on " + Date.now().toString() + "</h5></center>";
                    emailSender(to, subject, cont);

                    res.send({
                        statusCode: 200,
                        inform: "Register with succes! Now you have to click the link received in your mail to activate the account.",
                    });
                }
            });
        } else {
            res.status(422).json({ inform: "Please provide all data for register process !" });
        }
    }
};

const confirmToken = (req, res) => {
    // function for check the token used for mail confirmation
    myEmail = req.email;
    if (!myEmail) return res.sendStatus(500);

    User.updateOne({ email: myEmail }, { $set: { mail_confirm: true } })
        .then(data => {
            res.send(
                "<style>h3 {margin-top: 45px;} body{ with: 100%; background:  linear-gradient(#ffffff 50%, rgba(255,255,255,0) 0) 0 0, radial-gradient(circle closest-side, #FFFFFF 53%, rgba(255,255,255,0) 0) 0 0, radial-gradient(circle closest-side, #FFFFFF 50%, rgba(255,255,255,0) 0) 55px 0 #48B; background-size: 110px 200px; background-repeat: repeat-x; }</style><h3><center>Your account was activated! You must now login <a href ='https://mern-messenger.herokuapp.com/' ><b>HERE</b></a></center></h3>",
            );
        })
        .catch(err => {
            console.log("DB error");
            console.log(err);
            res.sendStatus(500);
        });
};

const login = (req, res) => {
    // function for login process
    if (req.body && req.body.email && req.body.password) {
        User.findOne({
            email: req.body.email,
            password: req.body.password,
            //mail_confirm: true
        }).then(result => {
            if (result == null) {
                res.status(401).json({ inform: "Wrong combination!" });
            } else {
                if (result.mail_confirm === false) {
                    res.json({
                        inform: "You don't have mail confirmation! Please folow the link received in your mail after registration.",
                        result,
                    });
                } else {
                    var TOKEN = JWT.sign(
                        {
                            email: req.body.email,
                            exp: Math.floor(Date.now() / 1000) + CONFIG.JWT_EXPIRE_TIME,
                        },
                        CONFIG.JWT_SECRET_KEY,
                    );
                    setLastActivity(req.body.email);
                    convFragment(req.body.email);
                    sendData();
                    res.status(200).json({
                        token: TOKEN,
                        myEmail: req.body.email,
                        inform: "Login successfully!",
                    });
                }
            }
        });
    } else {
        res.status(403).json({ inform: "Please provide all data!" });
    }
};

const sendFriendRequest = (req, res) => {
    // function for send friendship request
    myEmail = req.email;
    if (!myEmail) return res.sendStatus(500);
    console.log("sendFriendRequest", myEmail);
    //check if in our send list exist request allready sent
    User.findOne({ email: myEmail })
        .then(sent => {
            if (sent && (sent.friends.some(x => x === req.body.email_target) || sent.friends_requests.some(x => x === req.body.email_target) || sent.requests_sent.some(x => x === req.body.email_target))) {
                res.status(409).json({ inform: "Already friend or friend request" });
            } else {
                sent.requests_sent.push(req.body.email_target);
                sent.save();

                User.findOne({ email: req.body.email_target })
                    .then(sent => {
                        if (sent && (sent.friends.some(x => x === myEmail) || sent.friends_requests.some(x => x === myEmail) || sent.requests_sent.some(x => x === myEmail))) {
                            res.status(409).json({
                                inform: "Already friend or friend request",
                            });
                        } else {
                            sent.friends_requests.push(myEmail);
                            sent.save();
                            setLastActivity(myEmail);
                            sendData();
                            res.status(200).json({ inform: "success" });
                        }
                    })
                    .catch(err => {
                        console.log("DB error");
                        console.log(err);
                        res.sendStatus(500);
                    });
            }
        })
        .catch(err => {
            console.log("DB error");
            console.log(err);
            res.sendStatus(500);
        });
};

const revokeFriendRequest = (req, res) => {
    // function for canceling a friend request
    myEmail = req.email;
    if (!myEmail) return res.sendStatus(500);

    //check if the request is allready in list
    User.findOne({ email: myEmail })
        .then(sent => {
            if (sent && !sent.requests_sent.some(x => x === req.body.email_target)) {
                res.status(409).json({ inform: "Already friend or friend request" });
            } else {
                sent.requests_sent = sent.requests_sent.filter(el => el !== req.body.email_target);
                sent.save();

                User.findOne({ email: req.body.email_target })
                    .then(sent => {
                        if (sent && !sent.friends_requests.some(x => x === myEmail)) {
                            res.status(409).json({
                                inform: "Already friend or friend request",
                            });
                        } else {
                            sent.friends_requests = sent.friends_requests.filter(el => el !== myEmail);
                            sent.save();
                            setLastActivity(myEmail);
                            sendData();

                            res.status(200).json({ inform: "success" });
                        }
                    })
                    .catch(err => {
                        console.log("DB error");
                        console.log(err);
                        res.sendStatus(500);
                    });
            }
        })
        .catch(err => {
            console.log("DB error");
            console.log(err);
            res.sendStatus(500);
        });
};

const deniedFriendRequest = (req, res) => {
    // function for denied friendship request
    myEmail = req.email;
    if (!myEmail) return res.sendStatus(500);
    // check if allready exist
    User.findOne({ email: myEmail })
        .then(sent => {
            if (sent && !sent.friends_requests.some(x => x === req.body.email_target)) {
                res.status(409).json({ inform: "Already friend or friend request" });
            } else {
                sent.friends_requests = sent.friends_requests.filter(el => el !== req.body.email_target);
                sent.save();

                User.findOne({ email: req.body.email_target })
                    .then(sent => {
                        if (sent && !sent.requests_sent.some(x => x === myEmail)) {
                            res.status(409).json({
                                inform: "Already friend or friend request",
                            });
                        } else {
                            sent.requests_sent = sent.requests_sent.filter(el => el !== myEmail);
                            sent.save();
                            sendData();
                            res.status(200).json({ inform: "success" });
                        }
                    })
                    .catch(err => {
                        console.log("DB error");
                        console.log(err);
                        res.sendStatus(500);
                    });
            }
        })
        .catch(err => {
            console.log("DB error");
            console.log(err);
            res.sendStatus(500);
        });
};

const acceptFriendRequest = (req, res) => {
    // function for accept friendship request
    myEmail = req.email;
    if (!myEmail) return res.sendStatus(500);
    // check if allready exist accept in list
    User.findOne({ email: myEmail })
        .then(sent => {
            if (sent && !sent.friends_requests.some(x => x === req.body.email_target)) {
                res.status(409).json({ inform: "Already friend or friend request" });
            } else {
                sent.friends_requests = sent.friends_requests.filter(el => el !== req.body.email_target);
                sent.friends.push(req.body.email_target);
                sent.save();

                User.findOne({ email: req.body.email_target })
                    .then(sent => {
                        if (sent && !sent.requests_sent.some(x => x === myEmail)) {
                            res.status(409).json({
                                inform: "Already friend or friend request",
                            });
                        } else {
                            sent.requests_sent = sent.requests_sent.filter(el => el !== myEmail);
                            sent.friends.push(myEmail);
                            sent.save();
                            setLastActivity(myEmail);
                            sendData();

                            //create the conversation with this accept
                            var salut = " Say hello to your new friend! 👋 ";
                            createConversation(myEmail, req.body.email_target, salut);

                            res.status(200).json({ inform: "success" });
                        }
                    })
                    .catch(err => {
                        console.log("DB error");
                        console.log(err);
                        res.sendStatus(500);
                    });
            }
        })
        .catch(err => {
            console.log("DB error");
            console.log(err);
            res.sendStatus(500);
        });
};

const removeFriend = (req, res) => {
    // function for remove friend from list
    myEmail = req.email;
    if (!myEmail) return res.sendStatus(500);
    // first check if allready exist request in list
    User.findOne({ email: myEmail })
        .then(me => {
            if (me && !me.friends.some(x => x === req.body.email_target)) {
                res.status(409).json({ inform: "Already friend or friend request" });
            } else {
                me.friends = me.friends.filter(el => el !== req.body.email_target);
                me.save();

                User.findOne({ email: req.body.email_target })
                    .then(him => {
                        if (him && !him.friends.some(x => x === myEmail)) {
                            res.status(409).json({
                                inform: "Already friend or friend request",
                            });
                        } else {
                            him.friends = him.friends.filter(el => el !== myEmail);
                            him.save();
                            setLastActivity(myEmail);
                            sendData();

                            res.status(200).json({ inform: "success" });
                        }
                    })
                    .catch(err => {
                        console.log("DB error");
                        console.log(err);
                        res.sendStatus(500);
                    });
            }
        })
        .catch(err => {
            console.log("DB error");
            console.log(err);
            res.sendStatus(500);
        });
};

const createConversation = (myEmail, hisEmail, message) => {
    // function for create one conversation after accept friendship request
    setLastActivity(myEmail);
    Conversation.findOne({
        $or: [{ "participants.1.email": myEmail, "participants.0.email": hisEmail }, { "participants.0.email": myEmail, "participants.1.email": hisEmail }],
    })
        .then(data => {
            if (data == null) {
                console.log("conversation not exist ");
                // don't find any conversation, so will make new one
                var newConv = new Conversation({
                    messages: [
                        {
                            text: message,
                            email: myEmail,
                            time: Date.now(),
                        },
                    ],
                    participants: [
                        {
                            email: myEmail,
                            seen: Date.now(),
                        },
                        {
                            email: hisEmail,
                            seen: Date.now(),
                        },
                    ],
                });
                newConv.save((err, newConv) => {
                    if (err) {
                        console.log(err);
                    } else {
                        var convID = newConv._id;
                        console.log("newConv:", convID);
                        return convID;
                    }
                });
            }
            console.log("conversation find, will not create another ");
        })
        .catch(err => {
            console.log("DB error");
        });
};

const addMessage = (req, res) => {
    myEmail = req.email;
    if (!myEmail) return res.sendStatus(500);

    var hisEmail = req.body.hisemail;
    var message = req.body.message;
    if (message.length > 1000) {
        return res.sendStatus(409);
    }

    Conversation.findOne({
        $or: [{ "participants.1.email": myEmail, "participants.0.email": hisEmail }, { "participants.0.email": myEmail, "participants.1.email": hisEmail }],
    })
        .then(oldData => {
            if (oldData) {
                var newMess = {
                    text: message,
                    email: myEmail,
                    time: Date.now(),
                };
                var newData = [...oldData.messages, newMess];

                Conversation.updateOne(
                    {
                        $or: [
                            {
                                "participants.1.email": myEmail,
                                "participants.0.email": hisEmail,
                            },
                            {
                                "participants.0.email": myEmail,
                                "participants.1.email": hisEmail,
                            },
                        ],
                    },

                    { $set: { messages: newData } },
                )
                    .then(data => {
                        if (data == null) {
                            return res.sendStatus(401);
                        }

                        setConvSeen(myEmail, hisEmail);
                        liveConversation(myEmail, hisEmail);
                        convFragment(myEmail);
                        convFragment(hisEmail);
                        res.send({ status: 200, mesaj: "Update succesfully!" });
                        console.log("Update message! ");
                    })
                    .catch(err => {
                        console.log("DB error");
                        //console.log(err);
                        res.sendStatus(500);
                    });
            }
        })
        .catch(err => {
            console.log("DB error");
            console.log(err);
            res.sendStatus(500);
        });
};

var contor = 0;
const conversation = (req, res) => {
    //console.log(" conversation = (req, res)->", req.body);
    // function to extract only conversation selected from frontend

    myEmail = req.email;
    token = req.token;
    if (!myEmail) return res.sendStatus(500);

    var hisEmail = req.headers["hisemail"];
    // console.log("********conversation-io--->")
    setConvSeen(myEmail, hisEmail);
    liveConversation(myEmail, hisEmail);
    convFragment(myEmail);
    convFragment(hisEmail);
    sendData();

    Conversation.findOne({
        $or: [{ "participants.1.email": myEmail, "participants.0.email": hisEmail }, { "participants.0.email": myEmail, "participants.1.email": hisEmail }],
    })
        // .sort({ time: -1 })

        .then((data, participants) => {
            if (data == null) {
                //console.log( "null->data: ", data)
                return res.send({ status: 200, data, mesages: "No conversation!" });
            }
            //console.log( "conversation-data: ", data.messages.length)
            if (data.messages.length > 3) {
                contor = contor - 3;
                var newData = data.messages.slice(contor);
                // console.log( "newData", newData, contor)
            }

            res.send({ status: 200, data, participants, mesages: "OK!" });
        })

        .catch(err => {
            console.log("DB error");
            res.sendStatus(500);
        });
};

const convFragment = myEmail => {
    //console.log("convFragment----->?");
    // function for extact last fragment of conversations which is diplayes under the user's name
    Conversation.find({ participants: { $elemMatch: { email: myEmail } } })
        //  .sort({ time: -1 })
        .then(data => {
            var x = [];
            data.map(mes => {
                return x.push({
                    message: mes.messages[mes.messages.length - 1],
                    seenTime: mes.participants.find(part => part.email !== myEmail).seen,
                    userEmail: mes.participants.find(part => part.email !== myEmail).email,
                });
            });
            CONFIG.io.emit("fragmentAPI" + myEmail, x);
        });
};

const setColor = (req, res) => {
    // function for set the favorite color of elements in user's dashboard
    myEmail = req.email;
    if (!myEmail) return res.sendStatus(500);

    User.findOne({ email: myEmail })
        .then(user => {
            user.color = req.body.color;
            console.log("Update succesfully!", req.body);
            user.save();
            sendData();
            res.send({ status: 200, inform: "Update succesfully!" });
        })
        .catch(err => {
            console.log("DB error");
            console.log(err);
            res.sendStatus(500);
        });
};

const changeProfile = (req, res) => {
    // function for changing user identification data
    myEmail = req.email;
    if (!myEmail) return res.sendStatus(500);
    if (req.body.original_pass) {
        User.findOne({ email: myEmail, password: req.body.original_pass })
            .then(user => {
                user.firstname = req.body.firstname;
                user.lastname = req.body.lastname;
                if (req.body.new_pass) {
                    user.password = req.body.new_pass;
                } else if (!req.body.new_pass) {
                    res.send({ inform: "You have to provide new password to change it!" });
                }
                user.tel = req.body.tel;
                user.photo = req.body.photo;
                console.log("Update succesfully", req.body);
                user.save();
                sendData();
                res.send({ status: 200, inform: "Update succesfully!" });
            })
            .catch(err => {
                console.log("DB error");
                console.log(err);
                res.sendStatus(500);
            });
    } else if (req.body.new_pass && !req.body.original_pass) {
        res.send({ inform: "You have to provide old password to change it!" });
    } else if (!req.body.new_pass && !req.body.original_pass) {
        User.findOne({ email: myEmail })
            .then(user => {
                user.firstname = req.body.firstname;
                user.lastname = req.body.lastname;

                user.tel = req.body.tel;
                user.photo = req.body.photo;
                console.log("Update succesfully", req.body);
                user.save();
                sendData();
                res.send({ status: 200, inform: "Update succesfully!" });
            })
            .catch(err => {
                console.log("DB error");
                console.log(err);
                res.sendStatus(500);
            });
    }
};

const setConvSeen = (myEmail, hisEmail) => {
    //this function runs only from back so don't need token verification

    Conversation.updateOne({ "participants.0.email": hisEmail, "participants.1.email": myEmail }, { $set: { "participants.1.seen": Date.now(), "participants.1.counter": Date.now() } })
        .then(data => {
            Conversation.updateOne(
                { "participants.0.email": myEmail, "participants.1.email": hisEmail },
                {
                    $set: {
                        "participants.0.seen": Date.now(),
                        "participants.0.counter": Date.now(),
                    },
                },
            )
                .then(data2 => {
                    liveConversation(myEmail, hisEmail);
                })
                .catch(err => {
                    console.log("DB error");
                });
        })
        .catch(err => {
            console.log("DB error");
        });
};

const setLastActivity = userEmail => {
    User.updateOne({ email: userEmail }, { $set: { last_activity: Date.now().toString() } })
        .then(data => {
            if (data == null) {
                console.log("Empty data", data);
            }
            sendData();
            //console.log("Update last activity: ", data);
        })
        .catch(err => {
            console.log("DB error");
        });
};

const sendEmailRequest = (req, res) => {
    // function for send friendship request
    myEmail = req.email;
    if (!myEmail) return res.sendStatus(500);

    User.findOne({ email: req.body.email_target })
        .then(user => {
            console.log("what it find---------->", user);
            // First check if the user is in the sugestions list
            if (user !== null) {
                res.status(200).json({ infos: "This email is already owned by a registered user which you can find it the suggestions list." });
            } else {
                //check if in our send list exist request allready sent
                User.findOne({ email: myEmail })
                    .then(sent => {
                        if (sent && (sent.friends.some(x => x === req.body.email_target) || sent.friends_requests.some(x => x === req.body.email_target) || sent.requests_sent.some(x => x === req.body.email_target))) {
                            res.status(200).json({ infos: "Already friend or friend request" });
                        } else {
                            sent.requests_sent.push(req.body.email_target);
                            sent.save();

                            var dataToken = JWT.sign({ mail: req.body.email_target, friends_requests: myEmail }, "47vhc93y5hncbwier7rr22");
                            var to = req.body.email_target;
                            var subject = "You have one frindship request";
                            var cont = "<center><h3>You are invited from<b> " + sent.firstname + " " + sent.lastname + "</b>  with email: <b>" + myEmail + " </b> to register in MERN Messenger App. For accept this friends request, please click <a href='https://mern-messenger.herokuapp.com/emailfriendrequest/" + dataToken + "'><b>HERE</b></a> </h3></center>";
                            emailSender(to, subject, cont);

                            res.send({
                                statusCode: 200,
                                infos: "Your friends requst was sent.",
                            });
                        }
                    })
                    .catch(err => {
                        console.log("DB error");
                        console.log(err);
                        res.sendStatus(500);
                    });
            }
        })
        .catch(err => {
            console.log("DB error");
            console.log(err);
            res.sendStatus(500);
        });
};

const emailSender = (to, subject, cont) => {
    const sgMail = require("@sendgrid/mail");
    sgMail.setApiKey(process.env.SENDGRID_API_KEY);
    const msg = {
        to: to,
        from: "gabrrrielll@gmail.com",
        subject: subject,
        text: "You have to check the html version...",
        html: cont,
    };
    sgMail.send(msg);
};
module.exports = {
    register,
    login,
    confirmToken,
    sendFriendRequest,
    revokeFriendRequest,
    deniedFriendRequest,
    acceptFriendRequest,
    removeFriend,
    conversation,
    convFragment,
    checkToken,
    createConversation,
    addMessage,
    setLastActivity,
    changeProfile,
    setColor,
    sendData,
    loadSocket,
    sendEmailRequest,
    //confirmTokenFriendRequest,
};
