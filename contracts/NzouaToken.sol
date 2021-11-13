// Define the version of Solidity to use for this Smart Contract
// SPDX-License-Identifier: MIT
pragma solidity >=0.7.0;

// Define your Smart Contract with the "Contract" keyword and an empty constructor
contract NzouaToken {

    string public name = "Nzouat Token";
    string public symbol = "NZT";
    uint256 public totalSupply;

    // Transfer() event declaration
    event Transfer(
        address indexed _from,
        address indexed _to,
        uint256 _value
    );

    // Approval() event declaration
    event Approval(
      address indexed _owner, 
      address indexed _spender,
      uint256 _value
    );

    // mapping of Balances
    mapping(address => uint256) public balanceOf;

    // mapping allowances
    mapping(address => mapping(address => uint256)) public allowance;


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

    function approve(address _spender, uint256 _value) public returns(bool success) {

        allowance[msg.sender][_spender] = _value;

        emit Approval(msg.sender, _spender, _value);
        
        return true;
    }

    function transferFrom(address _from, address _to, uint256 _value) public returns (bool success){

        // require _from has enough NZT
        require(_value <= balanceOf[_from]);

        // require allowance to have enough NZT funds
        require(_value <= allowance[_from][msg.sender]);

        // update balances
        balanceOf[_from] -= _value;
        balanceOf[_to] += _value;

        // Update allowance
        allowance[_from][msg.sender] -= _value;

       // Emit a Transfer Event
        emit Transfer(_from, _to, _value);

        // return a boolean
        return true;
    }
}


