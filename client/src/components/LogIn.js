import React from "react";
const LogIn = props => {
    return (
        <div className="wrapper fadeInDown">
            <div id="formContent">
                <div className="fadeIn first">
                    <i className="fa fa-user"> Login</i>
                </div>
                <input type="email" id="myEmail" className="fadeIn second" name="Email" placeholder="demo@demo.com" onChange={props.updateData} value={props.myEmail} />
                <input type="password" id="password" className="fadeIn third" name="password" placeholder="demo" onChange={props.updateData} value={props.password} />
                <input type="submit" id="submit" className="fadeIn fourth" value="Log In" onClick={props.tryLogin} />
                <br />
                {props.state.inform ? <label id="inform">{props.state.inform}</label> : null}
                <div id="formFooter">
                    <p className="underlineHover" onClick={props.changeForm}>
                        You don't have a count? <b>Register!</b>
                    </p>
                </div>
            </div>
        </div>
    );
};

export default LogIn;
