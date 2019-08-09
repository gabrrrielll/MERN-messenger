import React, { Component } from "react";
import Users from "./Users";
import Profile from "./Profile";
import Message from "./Message";
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faUser, faArrowLeft, faSignOutAlt } from '@fortawesome/free-solid-svg-icons';

class Messenger extends Component {
     keyEnter = e => {
          //  function for set enter key on submit messages
          if (e.charCode === 13 || e.keyCode === 13) {
               this.props.sendMessage();
          }
     };

      findUser = ( y ) =>{
          if( this.props.state.users ){
                var user =  this.props.state.users.find( el => el.email === y  ) ;
               // console.log(" find user->", user)
                return user
          }
    }
    displayUser=()=>{
     var left = document.getElementById("left");
     var center = document.getElementById("center");
     var right = document.getElementById("right");
     
        if ( center.style.display === "block"  ) {
               left.style.display = "none";
               center.style.display = "none";
               right.style.display = "block";
           } 
     }
     render() { 
          function convertUNIX(input) {  
               if ( (  Date.now() - input) <  3600000 ){
                    return ((Date.now() - input) / 60000).toFixed(0)  + " min. ago"
               } else if (   3600000 < (  Date.now() - input )  &&  (  Date.now() - input ) < 86400000 ){
                    return ((Date.now() - input) /  3600000 ).toFixed(0)  + " h. ago"
               } else if (   86400000 <(  Date.now() - input ) && (  Date.now() - input ) < 864000000 ){
                    return ((Date.now() - input) /  86400000 ).toFixed(0)  + " d. ago"
               } else  {
                    var time = new Date(input);
                    var options = { year: 'numeric', month: 'numeric', day: 'numeric' };
                    return  time.toLocaleTimeString('en-EN', options);
               }   
          }
          return (
               <div id="block">
                    <div className="head" style={{ backgroundColor: this.props.state.me.color }}>
                         { window.innerWidth < 768 ? 
                               (< >
                               <FontAwesomeIcon
                                        className="arrow" icon={ faArrowLeft }
                                        onClick={this.props.showMobileBack} />

                                        { this.props.state.display &&
                                          this.props.state.show ?
                                        (<>
                                        <img className="header-photo" 
                                                  src={this.findUser(this.props.state.display).photo} 
                                                  alt={this.findUser(this.props.state.display).username}
                                                  onClick={ this.displayUser } /> 
                                        <div className="user-name"
                                                   style={{ top: "10px", left: "80px", color: "#fff", cursor: "pointer" }}
                                                   onClick={ this.displayUser } >
                                                   {this.findUser(this.props.state.display).firstname}
                                                    {this.findUser(this.props.state.display).lastname}
                                        </div>

                                        {this.findUser(this.props.state.display) &&
                                         this.findUser(this.props.state.display).last_activity && 
                                         Date.now() - this.findUser(this.props.state.display).last_activity < 60000 ? (
                                                  <div className="last-activity">
                                                       <span id="online-bullet">
                                                            <img
                                                                 src="https://upload.wikimedia.org/wikipedia/commons/thumb/3/31/Button_Icon_Green.svg/768px-Button_Icon_Green.svg.png"
                                                                 alt=" Active Now"
                                                                 title=" Active Now"
                                                            />
                                                       </span>
                                                       Active Now
                                                  </div>
                                             ) : (
                                                  <div className="last-activity">
                                                       {this.findUser(this.props.state.display) && 
                                                            convertUNIX(this.findUser(this.props.state.display).last_activity)} 
                                                  </div>
                                             )}

                                        </>): null }
                                        
                                        </>) :
                                        null}
                               <table className="right-side">
                              <tbody>
                                   <tr>
                                        <td>
                                             <span
                                                  title="Edit your profile"
                                                  id="edit-profile"
                                                  onClick={this.props.editProfile}
                                             >
                                               <FontAwesomeIcon icon={ faUser } />
                                              
                                                       {
                                                       this.props.state.me && 
                                                       this.props.state.me.friends_requests &&
                                                       this.props.state.me.friends_requests.length > 0 ? 
                                                         ( <span id="counter" title="Friends requests">
                                                                 {this.props.state.me.friends_requests.length}
                                                            </span> 
                                                       ) : null
                                                       }
                                                  
                                             </span>
                                        </td>
                                    
                                        <td> 
                                             <FontAwesomeIcon   id="logout" icon={ faSignOutAlt }
                                                  onClick={this.props.logout}/>
                                        </td>
                                   </tr>
                              </tbody>
                         </table>
                    </div>
                    <div className="box">
                         <div id="left">
                              <Users
                                   display={this.props.display}
                                   state={this.props.state}
                                   sendFriendRequest={this.props.sendFriendRequest}
                                   revokeFriendRequest={this.props.revokeFriendRequest}
                                   deniedFriendRequest={this.props.deniedFriendRequest}
                                   acceptFriendRequest={this.props.acceptFriendRequest}
                                   removeFriend={this.props.removeFriend}
                              />
                         </div>
                         <div id="center" >
                              <Message
                                   state={this && this.props.state}
                                   updateData={this.props.updateData}
                                   scrollUP={this.props.scrollUP}
                                   profileChange={this.props.profileChange}
                              />

                              {
                              this.props.state.me &&
                              this.props.state.me.friends &&
                              this.props.state.me.friends.some(el => el === this.props.state.display) ? (
                                   <div id="inputMessage" style={{ backgroundColor: this.props.state.me.color + "52" }}>
                                        {this.props.state.info ? <label id="inform">{this.props.state.info}</label> : null}

                                        <input
                                             type="text"
                                             placeholder="Your message"
                                             onChange={this.props.updateData}
                                             id="message"
                                             name="message"
                                             autoComplete="off"
                                             value={this.props.state.message}
                                             onKeyDown={this.keyEnter}
                                        />

                                        <span>
                                             <input
                                                  type="submit"
                                                  style={{ backgroundColor: this.props.state.me.color }}
                                                  id="message-submit"
                                                  value="Send"
                                                  onClick={this.props.sendMessage}
                                             />
                                        </span>
                                   </div>
                              ) : null}
                         </div>
                         <div id="right">
                              <Profile
                                   state={this.props.state}
                                   showMobileBack={this.props.showMobileBack}
                                   display={this.props.display}
                                   setColor={this.props.setColor}
                                   updateData={this.props.updateData}
                                   sendFriendRequest={this.props.sendFriendRequest}
                                   revokeFriendRequest={this.props.revokeFriendRequest}
                              />
                         </div>
                    </div>
               </div>
          );
     }
}

export default Messenger;
