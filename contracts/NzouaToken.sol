// Define the version of Solidity to use for this Smart Contract
// SPDX-License-Identifier: MIT
pragma solidity >=0.7.0;

// Define your Smart Contract with the "Contract" keyword and an empty constructor
contract NzouaToken {

    string public name = "Nzouat Token";
    string public symbol = "NZT";
    uint256 public totalSupply;

    event Transfer(
        address indexed _from,
        address indexed _to,
        uint256 _value
    );

    mapping(address => uint256) public balanceOf;

    constructor(uint256 _initialSupply) {
        balanceOf[msg.sender] = _initialSupply;
        totalSupply = _initialSupply;
    }

    function transfer(address _to, uint256 _value) public returns(bool success){
        // Throw an exception if sender has low funds
        require(balanceOf[msg.sender] >= _value, 'The account has low funds');

        // Implement the Debit & Credit feature
        balanceOf[msg.sender] -= _value;
        balanceOf[_to] += _value;

        // Emit a transfer Event
        emit Transfer(msg.sender, _to, _value);

        // Return a Boolean
        return true;
    }
}
