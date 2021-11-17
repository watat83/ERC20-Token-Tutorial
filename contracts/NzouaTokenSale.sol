// Define the version of Solidity to use for this Smart Contract
// SPDX-License-Identifier: MIT
pragma solidity >=0.7.0;

// Import the ERC20 Token contract
import "./NzouaToken.sol";

// Define your Smart Contract with the "Contract" keyword and an empty constructor
contract NzouaTokenSale {

    // Declare an admin variable which will have super priviledge over the smart contract
    address admin;

    // Declaring the ERC20 token contract variable
    NzouaToken public tokenContract;

    // Declare tokenPrice state variable
    uint256 public tokenPrice;

    // Declaring a tokensSold variable
    uint256 public tokensSold;

    // Declaring the Sell() Event
    event Sell(address _buyer, uint256 _amount);

    constructor(NzouaToken _tokenContract, uint256 _tokenPrice) {

        // Assign an admin, which is an external address that will have special
        // priviledge other accounts won't have (e.g. End the token sale)
        admin = msg.sender;

        // Assign Token Contract to the crowd sale
        tokenContract = _tokenContract;


        // Set Token Price: How much Eth will it costs to sell our token
        tokenPrice = _tokenPrice;
    }

        // This function will ensure a safe mathematical operation 
    // and prevent variable overflow
    function multiply(uint x, uint y) internal pure returns(uint z){
        require(y == 0 || (z = x * y) / y == x);
    }

    // Buying tokens. This function is payable 
    // because we want users to send ETH using this function
    function buyTokens(uint256 _numberOfTokens) public payable{
        // Require that the msg.value sent by the buyer 
        // is equal to the amount of NZT token they want to buy
        require(msg.value == multiply(_numberOfTokens, tokenPrice));

        // Require crowd sale contract to have enough token in balance
        require(tokenContract.balanceOf(address(this)) >= _numberOfTokens);

        // Require a successful transfer of tokens 
        require(tokenContract.transfer(msg.sender, _numberOfTokens));

        // Keep track of tokensSold
        tokensSold += _numberOfTokens;


        // Emit/Trigger the Sell() event
        emit Sell(msg.sender, _numberOfTokens);

    }

    // Ending the NzouaTokenSale sale
    function endSale() public {

        // Require only admin can end the sale
        require(msg.sender == admin, 'Only Admin can end the sale');

        // Transfer remaining tokens back to admin
        require(tokenContract.transfer(admin, tokenContract.balanceOf(address(this))));

        // Destroy/Deactivate the contract
        // selfdestruct(payable(admin));

    }


    // Function to get address of admin
    // function getAdmin() public view returns (address) {    
    //     return admin;
    // }
}
