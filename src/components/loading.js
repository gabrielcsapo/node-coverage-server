import React from 'react';

class Loading extends React.Component {
  render() {
    return (<div className="coverage text-center" style={{ border: "1px solid #dedede", position: "relative", height: "300px" }}>
      <div style={{width:"100%",position: "absolute",top: "50%",transform: "translateY(-50%)"}}>
        <div className="spinner spinner-black"></div>
      </div>
    </div>);
  }
}

export default Loading;
