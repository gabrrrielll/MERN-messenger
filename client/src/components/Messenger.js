import React, { Component } from "react";
import Users from "./Users";
import Profile from "./Profile";
import Message from "./Message";
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faUser, faArrowLeft, faSignOutAlt } from '@fortawesome/free-solid-svg-icons';

class Messenger extends Component {
    

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
                                         Date.now() - this.findUser(this.props.state.display).last_activity < 180000 ? (
                                                  <div className="last-activity">
                                                       <span id="online-bullet">
                                                            <img
                                                                 src="data:image/png;base64,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"
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
                                             onKeyDown={this.props.keyEnter}
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
                                   deniedFriendRequest={this.props.deniedFriendRequest}
                                   acceptFriendRequest={this.props.acceptFriendRequest}
                                   sendEmailRequest={this.props.sendEmailRequest}
                              />
                         </div>
                    </div>
               </div>
          );
     }
}

export default Messenger;
