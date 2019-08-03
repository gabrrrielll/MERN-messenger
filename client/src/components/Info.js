import React from "react";

const Info = props => {
     return (
          <div className="wrapper fadeInDown">
               <div id="formContent">
                    <div className="fadeIn first">
                         <i className="fa fa-user"> Info</i>
                    </div>
                    <h5>Conversation are allowed only between friends.</h5>
                    <h5>
                         So, make some friends...
                         <span role="img" aria-label="Check">
                              🤝
                         </span>
                    </h5>
                    {props.state.inform ? <label id="inform">{props.state.inform}</label> : null}

                    <div id="formFooter" />
               </div>
          </div>
     );
};

export default Info;
