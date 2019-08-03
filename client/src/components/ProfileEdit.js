import React from 'react';

const ProfileEdit = ( props ) =>{
    return (
        <div className="wrapper fadeInDown">
            <div id="formContent" >
              <div className="fadeIn first">
              <i className="fa fa-user"> Edit your profile</i>
              </div>
                  <table>
                  <tbody> 
                      <tr>
                          <td>
                              <input type="text" id="firstname" className="fadeIn second" name="firstname" placeholder="Firstname"
                                onChange={props.updateData} defaultValue={props.state.me.firstname} />
                          </td>
                          <td>
                            <input type="text" id="lastname" className="fadeIn second" name="lastname" placeholder="Lastname"
                                onChange={props.updateData}  defaultValue={props.state.me.lastname}/>
                          </td>
                      </tr>
                      <tr>
                          <td>
                              <input type="text" id="password" className="fadeIn second" name="password"  placeholder="Old password"
                              onChange={props.updateData} />
                          </td>
                          <td>
                              <input type="text" id="rpassword" className="fadeIn second" name="rpassword"  placeholder="New password"
                                onChange={props.updateData} />
                          </td>
                      </tr>
                      <tr>
                        <td>
                            <input type="text" id="tel" className="fadeIn second" name="tel" placeholder="Phone"
                            onChange={props.updateData}  defaultValue={props.state.me.tel}/>
                        </td>
                        <td>
                              <input type="text" id="photo" className="fadeIn second" name="photo" placeholder="Photo"
                                onChange={props.updateData} defaultValue={props.state.me.photo}/>
                        </td>
                      </tr>
                  </tbody>
              </table>
                  <input type="submit" className="fadeIn fourth" onClick={props.profileChange} value="Submit"  /> <br/>  

                   { props.state.inform ?
                  <label id="inform">{props.state.inform}</label>  :
                  null  }  
                
              
        </div>
      </div>
    );
}

export default ProfileEdit;