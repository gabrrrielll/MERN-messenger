import React, { Component } from "react";
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faUserTimes, faUserCheck } from '@fortawesome/free-solid-svg-icons';

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
                         <div className="alert-inform" >
                              <span role="img" aria-label="Notification" title="Notification">
                                   🔔
                              </span>
                              You have {this.props.state.friends_requests.length} friendship requests!  
                         </div>
                    ) : null}

{ this.props.state.me && this.props.state.friends_requests &&
          this.props.state.friends_requests.map(email => {
            return (
              <div
                className=" user user-alert request"
                onClick={() => this.props.display(email)}
                key={findUser(email)._id}
              >
                 <div  className="first"  >
                          <img src={findUser(email).photo}  alt={findUser(email).firstname} />
                          {
                             Date.now() - findUser( email ).last_activity < 180000 ?
                              (
                                <img id="active-bullet"
                                      src="https://upload.wikimedia.org/wikipedia/commons/thumb/3/31/Button_Icon_Green.svg/768px-Button_Icon_Green.svg.png"
                                      alt=" Active Now"
                                      title=" Active Now"
                                />
                              
                              ) : null
                          }
                  </div>
                  <div  className="middle"  >
                      <div className="user-name">{findUser(email).firstname} {findUser(email).lastname}  </div>
                     
                  </div>
                
                <button
                      className="addFriend"
                      onClick={() => this.props.acceptFriendRequest(email)}
                      name="Accept friend "
                      title="Accept friendship request "
                      style={{ backgroundColor: this.props.state.me.color+"cc" }}
                >
                   ? <FontAwesomeIcon icon={ faUserCheck } />
                </button>
                <button
                  className="addFriend"
                  onClick={() => this.props.deniedFriendRequest(email)}
                  name="Denied friendship request"
                  title="Denied friendship request"
                  style={{ backgroundColor: this.props.state.me.color+"cc" }}
                >
                  ? <FontAwesomeIcon icon={ faUserTimes } />
                </button>
              </div>
            );
          })}


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
                    { user && user.tel ?
                    <div className="tel">Phone: { user.tel}</div> :
                    null }
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
                              user.friends && this.props.state.users &&
                              user.friends
                                   .filter(em => em !== this.props.state.me.email)
                                   .map((email, index) => {
                                        if ( ! findUser(email)  ){
                                             return null
                                        }
                                       return (
                                             <div className="user" onClick={() => this.props.display(email)} key={index}>
                                                  <div className="first">
                                                       <img className="friend-photo" src={findUser(email).photo} alt={findUser(email).firstname} />
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
