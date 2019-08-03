import React, { Component } from "react";
//import { ColorPicker } from 'react-input-color';

class Profile extends Component {
     render() {
          if (!this.props.state.me)
               return (
                    <h4>
                         <center>Loading...</center>
                    </h4>
               );
          if (this.props.state.users) {
               var user = this.props.state.users.find(el => el.email === this.props.state.display);
          }
          /*   if (user === undefined) {
           
            if(  this && this.props.state.sugestions  &&  this.props.state.friends.length === 0){
              user= this.props.state.sugestions[0]
             // this.props.display( this.props.state.sugestions[0].email);
              // console.log("111user in profil:----------", user )
              }
              if( this && this.props.state.friends && this.props.state.friends.length > 0 ){
                 user = this.props.state.friends[0]
                // console.log("2222user in profil:----------", user )
              }
                // return <h3>Please select a user</h3>
        } */

          function convertUNIX(input) {
               var time = new Date(input);
               var options = { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' };
               return /* time.toLocaleDateString('en-EN', options) + "\n" + */ time.toLocaleTimeString('en-EN', options);
          }

          var findUser = y => {
               if (this.props.state.users) {
                    var user = this.props.state.users.find(el => el.email === y);
                    // console.log(" find user->", user)
                    return user;
               }
          };
          //console.log("user selected------>", user)
          return (
               <div className="profile">
                    {this.props.state.friends_requests && this.props.state.friends_requests.length > 0 ? (
                         <div className="alert-inform" onClick={this.props.showProfile}>
                              <span role="img" aria-label="Notification" title="Notification">
                                   🔔
                              </span>
                              You have {this.props.state.friends_requests.length} friendship requests! <br />
                              Click to view
                         </div>
                    ) : null}
                    <div className="title">Profile</div>

                    {user && user.last_activity && Date.now() - user.last_activity < 120000 ? (
                         <div className="last-activity">
                              <span id="online-bullet">
                                   <img
                                        src="https://upload.wikimedia.org/wikipedia/commons/thumb/3/31/Button_Icon_Green.svg/768px-Button_Icon_Green.svg.png"
                                        alt="Online"
                                        title="Online"
                                   />
                              </span>
                              Online
                         </div>
                    ) : (
                         <div className="last-activity">Last activity: <br/><b>{user && convertUNIX(user.last_activity)} </b></div>
                    )}

                    <div className="name">
                         {user && user.firstname} {user && user.lastname}
                    </div>

                    <img src={user && user.photo} alt={user && user.email} />
                    <div className="tel">Phone: {user && user.tel}</div>
                    <div className="email">Email: {user && user.email}</div>

                    {this.props.state.display === this.props.state.me.email ? (
                         <div>
                              <h6>Click and select your favorite color: </h6>
                              <input
                                   type="color"
                                   style={{ width: " 30px", height: " 30px", borderRadius: "50%", display: "inline" }}
                                   name="favcolor"
                                   id="favcolor"
                                   defaultValue={this.props.state.color}
                                   onChange={this.props.updateData}
                              />
                              <input
                                   type="submit"
                                   value="Save"
                                   onClick={this.props.setColor}
                                   style={{
                                        backgroundColor: this.props.state.me.color,
                                        padding: " 4px 12px",
                                        display: "inline",
                                        position: "relative",
                                        top: "-5px"
                                   }}
                              />
                         </div>
                    ) : null}

                    <div className="his-friends">
                         <div className="title">User's friends</div>
                         {user &&
                              user.friends &&
                              user.friends
                                   .filter(em => em !== this.props.state.me.email)
                                   .map(email => {
                                        return (
                                             <div className="user" onClick={() => this.props.display(email)} key={findUser(email)._id}>
                                                  <div className="first">
                                                       <img className="friend-photo" src={findUser(email).photo} alt={findUser(email).username} />
                                                  </div>
                                                  <div className="middle">
                                                       <div className="user-name" style={{ top: "18px" }}>
                                                            {findUser(email).firstname} {findUser(email).lastname}
                                                       </div>
                                                  </div>

                                                  {this.props.state.me.requests_sent.some(el => el === email) ||
                                                  this.props.state.me.friends.some(elem => elem === email) ? (
                                                       <button
                                                            className="addFriend"
                                                            title="Revoke friendship request"
                                                            onClick={() => this.props.revokeFriendRequest(email)}
                                                            style={{ backgroundColor: this.props.state.me.color + "cc" }}
                                                       >
                                                            x
                                                       </button>
                                                  ) : (
                                                       <button
                                                            className="addFriend"
                                                            title="Send friendship request"
                                                            onClick={() => this.props.sendFriendRequest(email)}
                                                            style={{ backgroundColor: this.props.state.me.color + "cc" }}
                                                       >
                                                            Send
                                                       </button>
                                                  )}
                                             </div>
                                        );
                                   })}
                    </div>
               </div>
          );
     }
}

export default Profile;
