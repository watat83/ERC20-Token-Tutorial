// Define the version of Solidity to use for this Smart Contract
// SPDX-License-Identifier: MIT
pragma solidity >=0.7.0;

// Define your Smart Contract with the "Contract" keyword and an empty constructor
contract NzouaToken {

    uint256 public totalSupply;
    constructor() {
        totalSupply = 1000000; // 1 million Nzouat Tokens
    }
}
