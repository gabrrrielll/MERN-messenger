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

                    /* // create the SMTP object
                    var smtpConfig = {
                        service: "Gmail", //which services is used
                        host: "smtp.gmail.com", // SMTP address
                        port: 465, //l SMTPS port,  S represent SECURED
                        secure: true, //For activated the secured protocol
                        auth: {
                            // the SMTP credentilales acces
                            user: "nodejsappcontact@gmail.com",
                            pass: "Parola123!",
                        },
                    };

                    // will create the body of message
                    var mailOption = {
                        from: "nodejsappcontact@gmail.com",
                        to: req.body.email,
                        subject: "Registration with succes!",
                        text: "Hi, your registration on MESSENGER was successful! ",
                        html: "<center><h3>Hi, your registration on MESSENGER was successful! Click  <a href ='https://mern-messenger.herokuapp.com/' ><b>HERE</b></a> to login.</h3></center>",
                    };
                    // Initializing the transport component with the configurations defined above
                    var transporter = nodemailer.createTransport(smtpConfig);
                    //Send the message
                    transporter.sendMail(mailOption, (err, info) => {
                        if (err) {
                            console.log(err);
                        } else {
                            console.log("Mail was send to " + req.body.email + " and response " + info.response);
                        }
                    });
                    res.send({
                        statusCode: 200,
                        inform: "Register with succes! ",
                    }); */

                    var to = req.body.email;
                    var subject = "Registration with succes!";
                    var cont = "<center><h3>Hi, your registration on MESSENGER was successful! Click  <a href ='https://mern-messenger.herokuapp.com/' ><b>HERE</b></a> to login.</h3></center>";
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
                photo: req.body.photo ? req.body.photo : "https://www.w3schools.com/w3css/img_avatar3.png",
                friends_requests: [],
                requests_sent: [],
            });

            newUser.save((err, result) => {
                if (err) {
                    console.log(err);
                    res.status(200).json({ inform: "The email is allready teaken" });
                } else {
                    // create the SMTP object
                    /* var smtpConfig = {
                        service: "Gmail", //which services is used
                        host: "smtp.gmail.com", // SMTP address
                        port: 465, //l SMTPS port,  S represent SECURED
                        secure: true, //For activated the secured protocol
                        auth: {
                            // the SMTP credentilales acces
                            user: "nodejsappcontact@gmail.com",
                            pass: "Parola123!",
                        },
                    };
                    // Create the token which will send in mail to the user
                    var confirmToken = JWT.sign({ confirm: true, email: req.body.email }, CONFIG.JWT_SECRET_KEY);
                    // will create the body of message
                    var mailOption = {
                        from: "nodejsappcontact@gmail.com",
                        to: req.body.email,
                        subject: "Account verification token",
                        text: "<h3><center>For register on messenger, please click  <a href='https://mern-messenger.herokuapp.com/confirm/" + confirmToken + "'><b>HERE</b></a> to verify your email.</center></h3>",
                        html: "<h3><center>For register on messenger, please click  <a href='https://mern-messenger.herokuapp.com/confirm/" + confirmToken + "'><b>HERE</b></a> to verify your email.</center></h3>",
                    };
                    // Initializing the transport component with the configurations defined above
                    var transporter = nodemailer.createTransport(smtpConfig);
                    //Send the message
                    transporter.sendMail(mailOption, (err, info) => {
                        if (err) {
                            console.log(err);
                        } else {
                            console.log("Mail was send to " + req.body.email + " and response " + info.response);
                        }
                    }); */

                    var confirmToken = JWT.sign({ confirm: true, email: req.body.email }, CONFIG.JWT_SECRET_KEY);
                    var to = req.body.email;
                    var subject = "Account verification token";
                    var cont = "<h3><center>For register on messenger, please click  <a href='https://mern-messenger.herokuapp.com/confirm/" + confirmToken + "'><b>HERE</b></a> to verify your email.</center></h3>";
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
                "<style>h3 {margin-top: 45px;} body{ background:  linear-gradient(#ffffff 50%, rgba(255,255,255,0) 0) 0 0, radial-gradient(circle closest-side, #FFFFFF 53%, rgba(255,255,255,0) 0) 0 0, radial-gradient(circle closest-side, #FFFFFF 50%, rgba(255,255,255,0) 0) 55px 0 #48B; background-size: 110px 200px; background-repeat: repeat-x; }</style><h3><center>Your account was activated! You must now login <a href ='https://mern-messenger.herokuapp.com/' ><b>HERE</b></a></center></h3>",
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
                        /* if (sent && (sent.friends.some(x => x === req.body.email_target) || sent.friends_requests.some(x => x === req.body.email_target) || sent.requests_sent.some(x => x === req.body.email_target))) {
                            res.status(200).json({ infos: "Already friend or friend request" });
                        } else {
                            sent.requests_sent.push(req.body.email_target);
                            sent.save(); */
                        /* 
                            {
                                // create the SMTP object
                                var smtpConfig = {
                                    service: "Gmail", //which services is used
                                    host: "smtp.gmail.com", // SMTP address
                                    port: 465, //l SMTPS port,  S represent SECURED
                                    secure: true, //For activated the secured protocol
                                    auth: {
                                        // the SMTP credentilales acces
                                        user: "nodejsappcontact@gmail.com",
                                        pass: "Parola123!",
                                    },
                                };
                                // Create the token which will send in mail to the user
                                var confirmToken = JWT.sign({ mail: req.body.email_target, friends_requests: myEmail }, CONFIG.JWT_SECRET_KEY);

                                // will create the body of message
                                var mailOption = {
                                    from: "MERN Messenger <nodejsappcontact@gmail.com>",
                                    to: req.body.email_target,
                                    subject: "You have one frindship request",
                                    text: "Please verify email, click on link",
                                    html: "<center><h3>You are invited from<b> " + sent.firstname + " " + sent.lastname + "</b>  and email: <b>" + myEmail + " </b> to register in MERN Messenger App and accept his friends request, please click 
                                     <a href='https://mern-messenger.herokuapp.com/emailfriendrequest/" + confirmToken + "'><b>HERE</b></a> </h3></center>",
                                };
                                // Initializing the transport component with the configurations defined above
                                var transporter = nodemailer.createTransport(smtpConfig);
                                //Send the message
                                transporter.sendMail(mailOption, (err, info) => {
                                    if (err) {
                                        console.log(err);
                                    } else {
                                        console.log("Mail was send to " + req.body.email_target + " and response " + info.response);
                                    }
                                });
                                res.send({
                                    statusCode: 200,
                                    infos: "Your friends requst was sent.",
                                });
                            } */
                        var confirmToken = JWT.sign({ mail: req.body.email_target, friends_requests: myEmail }, CONFIG.JWT_SECRET_KEY);
                        var to = req.body.email_target;
                        var subject = "You have one frindship request";
                        var cont = "<center><h3>You are invited from<b> " + sent.firstname + " " + sent.lastname + "</b>  with email: <b>" + myEmail + " </b> to register in MERN Messenger App. For accept this friends request, please click <a href='https://mern-messenger.herokuapp.com/emailfriendrequest/" + confirmToken + "'><b>HERE</b></a> </h3></center>";
                        emailSender(to, subject, cont);

                        res.send({
                            statusCode: 200,
                            infos: "Your friends requst was sent.",
                        });
                        //}
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
    /*  var helper = require("sendgrid").mail;
    var from_email = new helper.Email("MERN Messenger <nodejsappcontact@gmail.com>");
    var to_email = new helper.Email(to);
    var content = new helper.Content("text/plain", cont);
    var mail = new helper.Mail(from_email, subject, to_email, content);

    var sg = require("sendgrid")(process.env.SENDGRID_API_KEY);
    var request = sg.emptyRequest({
        method: "POST",
        path: "/v3/mail/send",
        body: mail.toJSON(),
    });

    sg.API(request, function(error, response) {
        console.log(response.statusCode);
        console.log(response.body);
        console.log(response.headers);
    });
 */
    const sgMail = require("@sendgrid/mail");
    sgMail.setApiKey(process.env.SENDGRID_API_KEY);
    const msg = {
        to: to,
        from: "gabrrrielll@gmail.com",
        subject: subject,
        text: "and easy to do anywhere, even with Node.js",
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
