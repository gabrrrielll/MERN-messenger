import React from "react";

const Register = props => {
     return (
          <div className="wrapper fadeInDown">
               <div id="formContent">
                    <div className="fadeIn first">
                         <i className="fa fa-user"> Register</i>
                    </div>
                    <table>
                         <tbody>
                              <tr>
                                   <td>
                                        <input
                                             type="text"
                                             id="username"
                                             className="fadeIn second"
                                             name="username"
                                             placeholder="Username"
                                             onChange={props.updateData}
                                        />
                                   </td>
                                   <td>
                                        <input
                                             type="text"
                                             id="email"
                                             className="fadeIn second"
                                             name="email"
                                             placeholder="Email"
                                             onChange={props.updateData}
                                        />
                                   </td>
                              </tr>
                              <tr>
                                   <td>
                                        <input
                                             type="text"
                                             id="firstname"
                                             className="fadeIn second"
                                             name="firstname"
                                             placeholder="Firstname"
                                             onChange={props.updateData}
                                        />
                                   </td>
                                   <td>
                                        <input
                                             type="text"
                                             id="lastname"
                                             className="fadeIn second"
                                             name="lastname"
                                             placeholder="Lastname"
                                             onChange={props.updateData}
                                        />
                                   </td>
                              </tr>
                              <tr>
                                   <td>
                                        <input
                                             type="text"
                                             id="password"
                                             className="fadeIn second"
                                             name="password"
                                             placeholder="Password"
                                             onChange={props.updateData}
                                        />
                                   </td>
                                   <td>
                                        <input
                                             type="text"
                                             id="rpassword"
                                             className="fadeIn second"
                                             name="rpassword"
                                             placeholder="Repeat password"
                                             onChange={props.updateData}
                                        />
                                   </td>
                              </tr>
                              <tr>
                                   <td>
                                        <input
                                             type="text"
                                             id="tel"
                                             className="fadeIn second"
                                             name="tel"
                                             placeholder="Phone"
                                             onChange={props.updateData}
                                        />
                                   </td>
                                   <td>
                                        <input
                                             type="text"
                                             id="photo"
                                             className="fadeIn second"
                                             name="photo"
                                             placeholder="Photo"
                                             onChange={props.updateData}
                                        />
                                   </td>
                              </tr>
                         </tbody>
                    </table>
                    <input type="submit" className="fadeIn fourth" onClick={props.tryRegister} value="Register" /> <br />
                    {props.state.inform ? <label id="inform">{props.state.inform}</label> : null}
                    <div id="formFooter">
                         <p className="underlineHover" onClick={props.changeForm}>
                              Do you have a count?<b>Login!</b>{" "}
                         </p>
                    </div>
               </div>
          </div>
     );
};

export default Register;
