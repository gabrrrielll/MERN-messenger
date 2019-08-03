import React, { Component } from "react";


class Users extends Component {
  state = {
    query: '',
    results: []
  }

  
 handleInputChange = () => {
  this.setState({
    query: this.search.value.toLowerCase()
  })
}

  render() {
    if ( !this.props.state.me ) {

      return<h4><center>Loading...</center></h4>
    }
 
   
    var findUser = ( y ) =>{
          if( this.props.state.users ){
                var user =  this.props.state.users.find( el => el.email === y  ) ;
               // console.log(" find user->", user)
                return user
          }
    }

    var setClass = email => {
      if (  this &&
            this.props.state.data &&
            //check if the fragment is in the data list
            this.props.state.data.find(el => el.userEmail === email) &&
            // check if message is from from partener 
            this.props.state.data.find( el => el.userEmail === email ).message.email === email  && 
            //  check if is seen from me
            ( this.props.state.data.find(el => el.userEmail === email).message.time >
            this.props.state.data.find(el => el.userEmail === email).seenTime )
      ) {
        return "user-alert";
      } else {
        return "user";
      }
    };

    var extractFragment = email => {
     //check if the fragment is in the data list
      if ( this.props.state.data &&
          this.props.state.data.find(el => el.userEmail === email ) ) {  // console.log(" this.props.state.data", this.props.state.data)
              // check if message is from from partener 
              if( this.props.state.data.find( el => el.userEmail === email ).message.email !== email ){
                // this fragment is from me
                return(<div id="normal">
                              You: { this.props.state.data.find(el => el.userEmail === email).message.text}
                            </div>  )
              } else {
                     // this fragment is from partener, so check if is seen from me
                    if( this.props.state.data.find(el => el.userEmail === email).message.time >
                    this.props.state.data.find(el => el.userEmail === email).seenTime ){
                      // the message was not see, so make it bold
                      return(<div id="bold">
                       { this.props.state.data.find(el => el.userEmail === email).message.text}
                    </div>  )
                    } else {
                      // the message was see, so make it normal
                      return (<div id="normal">
                      { this.props.state.data.find(el => el.userEmail === email).message.text}
                    </div>  )
                    }
                
              }
            
      } else {
        //the fragment is not in the list
        return "";
      }
    };

    return (
      <div className="users">
        <input
          placeholder=" 🔍   Search for users..."
          ref={input => this.search = input}
          onChange={this.handleInputChange}
          style={{width: "100%", padding:"4px 5px", backgroundColor: this.props.state.me.color+"52" }}
        />
        
        <div className="title">Friends </div>
        { this.props.state.me && this.props.state.friends_requests &&
          this.props.state.show &&
          this.props.state.friends_requests.map(email => {
            return (
              <div
                className="user request"
                onClick={() => this.props.display(email)}
                key={findUser(email)._id}
              >
                 <div  className="first"  >
                          <img src={findUser(email).photo}  alt={findUser(email).username} />
                  </div>
                  <div  className="middle"  >
                      <div className="user-name">{findUser(email).firstname} {findUser(email).lastname}  </div>
                      <div  className="message_fragment"  >  {extractFragment(email)}  </div>
                  </div>
                
                <button
                      className="addFriend"
                      onClick={() => this.props.acceptFriendRequest(email)}
                      name="Accept friend "
                      title="Accept friendship request "
                      style={{ backgroundColor: this.props.state.me.color+"cc" }}
                >
                  <span role="img" aria-label="Check">
                    ✅ ?
                  </span>
                </button>
                <button
                  className="addFriend"
                  onClick={() => this.props.deniedFriendRequest(email)}
                  name="Denied friendship request"
                  title="Denied friendship request"
                  style={{ backgroundColor: this.props.state.me.color+"cc" }}
                >
                  <span role="img" aria-label="Delete">
                    ❌
                  </span>
                  ?
                </button>
              </div>
            );
          })}
          
        {/*  { console.log( "test deoarece exista intarzieri de intrare a datelor la  this.props.state.friends",  this.props.state.friends)} */}
         { this && this.props.state.users &&
          this.props.state.friends && 
          this.props.state.friends.length > 0  ? (
                    this.props.state.friends.map(  user => {
                            if (( user.firstname && user.firstname.toLowerCase().includes( this.state.query )) ||
                            (user.lastname && user.lastname.toLowerCase().includes( this.state.query ) )){
                                return (
                                    <div  className={setClass(user.email)} 
                                        onClick={() => this.props.display(user.email)}
                                        key={user._id}
                                    >
                                      <div  className="first"  >
                                                <img src={user.photo} alt={user.username} />
                                        </div>
                                        <div  className="middle"  >
                                            <div className="user-name">{user.firstname} {user.lastname} </div>
                                            <div  className="message_fragment"  >  {extractFragment(user.email)}  </div>
                                        </div>
                                      <button className="addFriend"
                                          title="Remove friend"
                                          onClick={() => this.props.removeFriend(user.email)}
                                          style={{ backgroundColor: this.props.state.me.color+"cc" }}
                                      >
                                        <span role="img" aria-label="Delete">
                                          ❌
                                        </span>
                                      </button>
                                    </div>
                                      ); } else return null
                    })
         ) : (
             <center> You don't have friends yet </center>
          ) } 

        <div className="title">Sugestions</div>
         { this &&
          this.props.state.sugestions &&
          this.props.state.sugestions.map( user => {
            if (user.firstname.toLowerCase().includes( this.state.query ) ||
                 user.lastname.toLowerCase().includes( this.state.query ) ){
              return (
            
                <div  className="user"
                        onClick={() => this.props.display(user.email)}
                        key={user._id}>
                         
                              <div  className="first"  >
                                      <img src={user.photo} alt={user.username} />
                              </div>
                              <div  className="middle"  >
                                  <div className="user-name">{user.firstname} {user.lastname} </div>
                                  <div  className="message_fragment"  >  {extractFragment(user.email)}  </div>
                              </div>
  
                              { !this.props.state.me.requests_sent
                              .some( el => el === user.email ) ? 
                              (
                                <button
                                        className="addFriend"
                                        title="Send friendship request"
                                        onClick={() => this.props.sendFriendRequest(user.email)}
                                        style={{ backgroundColor: this.props.state.me.color+"cc" }}>
                                        Send
                                </button>
                              ) : (
                                <button
                                        className="addFriend"
                                        title="Revoke friendship request"
                                        onClick={() => this.props.revokeFriendRequest(user.email)}
                                        style={{ backgroundColor: this.props.state.me.color+"cc" }} >
                                        x
                                </button>
                      )}
              </div>
                )
            } else return null;
           

                })
                
          } 
      </div>
    );
  }
}

export default Users;
