import React, { Component } from 'react';
import logo from './logo.svg';
import './App.css';
import Web3 from 'web3';
import _ from 'lodash';

var client = new Web3(new Web3.providers.HttpProvider("http://localhost:8545"));
var contractAbi = [{ "constant": true, "inputs": [], "name": "getAllowedNames", "outputs": [{ "name": "", "type": "bytes32[]" }], "payable": false, "stateMutability": "view", "type": "function" }, { "constant": true, "inputs": [{ "name": "", "type": "uint256" }], "name": "allowed", "outputs": [{ "name": "name", "type": "bytes32" }, { "name": "account", "type": "address" }], "payable": false, "stateMutability": "view", "type": "function" }, { "constant": true, "inputs": [{ "name": "_to", "type": "address" }], "name": "buySomething", "outputs": [{ "name": "", "type": "string" }], "payable": false, "stateMutability": "view", "type": "function" }, { "constant": false, "inputs": [{ "name": "_name", "type": "bytes32" }, { "name": "_account", "type": "address" }], "name": "addAllowed", "outputs": [{ "name": "_success", "type": "bool" }], "payable": false, "stateMutability": "nonpayable", "type": "function" }, { "constant": true, "inputs": [], "name": "getAllowedAddresses", "outputs": [{ "name": "", "type": "address[]" }], "payable": false, "stateMutability": "view", "type": "function" }, { "inputs": [], "payable": false, "stateMutability": "nonpayable", "type": "constructor" }];
var contractAddress = '0x27c791f7fa0ef587c305a44fea36f1453218ad76';
var contract = new client.eth.Contract(contractAbi, contractAddress);
var myAccount = '0x5549cdff21c528239219a3b20105809e54acfe21';

function canIBuy() {
  var address = document.getElementById('address-can-i-buy').value;
  var result = document.getElementById('result-address-can-i-buy');
  result.value = '';
  contract.methods.buySomething(address).call().then((promise) => {
    result.innerHTML = promise;
  });
}



class App extends Component {
  constructor(props) {
    super(props)
    this.state = {
      names: [],
      addresses: []
    }

    // ES6 React.Component doesn't auto bind methods to itself.
    // You need to bind them yourself in constructor.
    this.addAllowed = this.addAllowed.bind(this);
  }
  componentWillMount() {
    contract.methods.getAllowedNames().call().then((promise) => {
      this.setState({
        names: promise
      });
    });

    contract.methods.getAllowedAddresses().call().then((promise) => {
      this.setState({
        addresses: promise
      });
    });
  }

  addAllowed() {
    var name = client.utils.fromAscii(document.getElementById('name-add-allowed').value);
    var address = document.getElementById('account-add-allowed').value;
    contract.methods.addAllowed(name, address).send({ gas: 200000, from: myAccount, gasPrice: 1 }, function (er, promise) {
      console.log(er);
      console.log(promise);

      this.state.addresses.push(address);
      this.setState({ addresses: this.state.addresses })
      this.state.names.push(name);
      this.setState({ names: this.state.names })
    }.bind(this));
  }

  render() {
    var tableRows = [];
    _.each(this.state.names, (value, index) => {
      tableRows.push(<tr>
        <td>{client.utils.toAscii(this.state.names[index]).replace(/\u0000/g, '')}</td>
        <td>{this.state.addresses[index]}</td>
      </tr>
      )
    })
    return (
      <div className="App">
        <header className="App-header">
          <img src={logo} className="App-logo" alt="logo" />
          <h1 className="App-title">Welcome to Children Wallet DAPP</h1>
        </header>
        <div className="App-Content">
          <table>
            <thead>
              <tr>
                <th>Names</th>
                <th>Addresses</th>
              </tr>
            </thead>
            <tbody>
              {tableRows}
            </tbody>
          </table>
        </div>
        <div>
          <h1>Can I buy? </h1>
          <input placeholder="Address" id="address-can-i-buy" />
          <button onClick={canIBuy}>OK</button><br />
          <label id="result-address-can-i-buy"></label>
        </div>
        <div>
          <h1>Add allowed</h1>
          <input placeholder="Name" id="name-add-allowed" />
          <input placeholder="Account" id="account-add-allowed" />
          <button onClick={this.addAllowed}>ADD</button><br />
        </div>
      </div>
    );
  }
}

export default App;
