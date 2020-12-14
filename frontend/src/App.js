import React,{Component} from "react";
import './App.css';
import Comp1 from './Comp1';
class App extends Component{
  render(){
    return (
      <div className="App">
        <h1>Data from app</h1>
        <Comp1 />
        <Comp1 />
      </div>
    );
  }
}
export default App;
