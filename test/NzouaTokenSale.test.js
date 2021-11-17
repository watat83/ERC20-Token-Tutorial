var NzouaToken = artifacts.require('./NzouaToken');
var NzouaTokenSale = artifacts.require('./NzouaTokenSale');

contract('NzouaTokenSale', async (accounts) => {
    let tokenSale;
    let token;
    let tokenPrice = 1000000000000000; // in wei
    const adminAccount = accounts[0];
    const buyerAccount = accounts[1];

    beforeEach("setup all contracts", async () => {
        token = await NzouaToken.deployed();
        tokenSale = await NzouaTokenSale.deployed();
    });


    describe('Contract Attributes', async () => {
        it('Initializes the contract with the correct values', async () => {
            // tokenSale = await NzouaTokenSale.deployed();
            assert.notEqual(tokenSale.address, 0x0, 'The smart contract address was set')
        });
        it('References the ERC20 Token Contract', async () => {
            // tokenSale = await NzouaTokenSale.deployed();
            assert.notEqual(await tokenSale.tokenContract(), 0x0, 'The token contract is referenced')
        });
        it('Sets the price of ERC20 Token Correctly', async () => {
            // tokenSale = await NzouaTokenSale.deployed();
            let price = await tokenSale.tokenPrice();
            assert.equal(price.toNumber(), tokenPrice, 'The token price is set correctly')
        });
        // it('Sets the admin of the Crowd Sale', async () => {
        //     tokenSale = await NzouaTokenSale.deployed();
        //     assert.equal(await tokenSale.getAdmin(), accounts[0], 'The admin account was set')
        // });
    })

    describe('Facilitates Token Buying', async () => {
        it('Keeps track of token sold', async () => {
            // tokenSale = await NzouaTokenSale.deployed();
            const numberOfTokens = 10;
            let valueOfTokens = numberOfTokens * tokenPrice;
            try {
                let receipt = await tokenSale.buyTokens(numberOfTokens, {
                    from: buyerAccount,
                    value: valueOfTokens
                });
                let amountSold = await tokenSale.tokensSold();
                assert.equal(amountSold.toNumber(), numberOfTokens, 'increments the number of token sold')

            } catch (error) {
                assert(error.message.indexOf('revert') >= 0);
            }
        });

        it('Triggers the Sell() Event', async () => {
            // tokenSale = await NzouaTokenSale.deployed();
            const numberOfTokens = 10;
            let valueOfTokens = numberOfTokens * tokenPrice;
            try {
                let receipt = await tokenSale.buyTokens(numberOfTokens, {
                    from: buyerAccount,
                    value: valueOfTokens
                });

                // Verify transaction logs for Events
                assert.equal(receipt.logs.length, 1, 'triggers one event');
                assert.equal(receipt.logs[0].event, 'Sell', 'should be the "Sell()" event');
                assert.equal(receipt.logs[0].args._buyer, buyerAccount, 'logs the account that purchased the tokens');
                assert.equal(receipt.logs[0].args._amount, numberOfTokens, 'logs the number of tokens purchased');
            } catch (error) {
                assert(error.message.indexOf('revert') >= 0);
            }


        });

        it('Requires that msg.value is equal to tokens to buy', async () => {
            // tokenSale = await NzouaTokenSale.deployed();
            const numberOfTokens = 10;
            let valueOfTokens = numberOfTokens * tokenPrice;


            try {
                let receipt = await tokenSale.buyTokens.call(numberOfTokens, {
                    from: buyerAccount,
                    value: 1 // Trying to buy 10 NZT tokens for 1 Wei
                });
                assert.notEqual(receipt, true, 'Buyer CAN underpay or overpay 10 NZTs for 1 Wei');
            } catch (error) {
                assert(error.message.indexOf('revert') >= 0, 'msg.value should equal the number of tokens in wei');
                return true;
            }

        });

        it('Ensures contract has enough tokens', async () => {
            // token = await NzouaToken.deployed();
            // tokenSale = await NzouaTokenSale.deployed();

            const numberOfTokens = 10;
            // let valueOfTokens = numberOfTokens * tokenPrice;

            // 75% of the total supply 
            // will be llocated to the token sale
            const tokensAvailable = 750000;
            let receipt = await token.transfer(tokenSale.address, tokensAvailable, {
                from: adminAccount
            })

            let tokenSaleBalance = await token.balanceOf(tokenSale.address);
            assert.equal(tokenSaleBalance.toNumber(), tokensAvailable, 'Contract received funds.')

            // Trying to buy 800000 NZT tokens 
            // Which is more than the available balance of 750000 NZT
            try {
                let failedReceipt = await tokenSale.buyTokens.call(800000, {
                    from: buyerAccount,
                    value: numberOfTokens * tokenPrice
                });
                assert.equal(failedReceipt, true, 'Buyer CAN buy more token than the available balance');
            } catch (error) {
                // console.log(error.message)
                assert(error.message.indexOf('revert') >= 0, 'Buyer cannot buy more than available tokens');
            }

        });



        // let adminBal = await token.balanceOf(adminAccount)
        // adminBal = adminBal.toNumber()
        // assert.equal(adminBal, 250000, 'AdminAccount was updated successfully')

        // Transfer tokens to token sale


    })


});
contract('NzouaTokenSale - Successful Transfer', async (accounts) => {
    let tokenSale;
    let token;
    let tokenPrice = 1000000000000000; // in wei
    const adminAccount = accounts[0];
    const buyerAccount = accounts[1];

    beforeEach("setup all contracts", async () => {
        token = await NzouaToken.deployed();
        tokenSale = await NzouaTokenSale.deployed();
    });

    it('Required a successful Transfer of Tokens', async () => {
        let tokenSaleBalance;
        let buyerBalance;
        // adminAccount = await tokenSale.getAdmin();

        const numberOfTokens = 10;


        const tokensAvailable = 750000;

        await token.transfer(tokenSale.address, (tokensAvailable), {
            from: adminAccount
        })

        tokenSaleBalance = await token.balanceOf(tokenSale.address);
        assert.equal(tokenSaleBalance.toNumber(), tokensAvailable, 'Contract received funds.')

        await tokenSale.buyTokens(numberOfTokens, {
            from: buyerAccount,
            value: numberOfTokens * tokenPrice
        });

        // Grab the new balance of the buyerAccount
        buyerBalance = await token.balanceOf(buyerAccount);
        buyerBalance = buyerBalance.toNumber();
        assert.equal(buyerBalance, numberOfTokens, 'Buyer Balance updated');

        // Grab the new balance of the Token Sale Contract
        tokenSaleBalance = await token.balanceOf(tokenSale.address);
        tokenSaleBalance = tokenSaleBalance.toNumber();
        assert.equal(tokenSaleBalance, Number(tokensAvailable - numberOfTokens), 'Token Sale Balance updated');

    });
})

contract('NzouaTokenSale - End Token Sale', async (accounts) => {
    let tokenSale;
    let token;
    let tokenPrice = 1000000000000000; // in wei
    const adminAccount = accounts[0];
    const buyerAccount = accounts[1];
    const tokensAvailable = 750000;

    beforeEach("setup all contracts", async () => {
        token = await NzouaToken.deployed();
        tokenSale = await NzouaTokenSale.deployed();
    });

    it('Cannot end token sale from account other than admin', async () => {
        try {
            const receipt = await tokenSale.endSale({
                from: buyerAccount
            })
            assert.equal(receipt, false, 'Buyer can end the crowd sale')

        } catch (error) {
            // console.log(error.message)
            assert(error.message.indexOf('revert') >= 0, 'Buyer cannot end the crowd sale');
        }
    })
    it('Ends the token sale from Admin', async () => {
        const receipt = await tokenSale.endSale.call({
            from: adminAccount
        })
        assert(receipt, 'Buyer can end the crowd sale')

    })
    it('Sends remaining tokens back to Admin', async () => {
        let tokenSaleBalance;
        let adminBalance;

        const numberOfTokens = 10;
        const tokensAvailable = 750000;

        // Provisions Token Sale Contracts with Funds
        await token.transfer(tokenSale.address, (tokensAvailable), {
            from: adminAccount
        })

        // Simulate buyTokens() by a Buyer
        await tokenSale.buyTokens(numberOfTokens, {
            from: buyerAccount,
            value: numberOfTokens * tokenPrice
        });

        // End the token sale
        await tokenSale.endSale({
            from: adminAccount
        })

        // Grab the new balance of the adminAccount
        adminBalance = await token.balanceOf(adminAccount);
        adminBalance = adminBalance.toNumber();


        // Confirm the unsold tokens were returned to the admin
        assert.equal(adminBalance, 999990, 'Returns unsold tokens');
    })
    // it('Disables the token sale contract', async () => {

    //     // Provisions Token Sale Contracts with Funds
    //     await token.transfer(tokenSale.address, (tokensAvailable), {
    //         from: adminAccount
    //     })

    //     // End the token sale
    //     await tokenSale.endSale({
    //         from: adminAccount
    //     })

    //     // Get the current balance of the token sale contract
    //     newBalance = await token.balanceOf(tokenSale.address);

    //     // Confirm that the balance of the contract was reset after deactivation
    //     assert.equal(newBalance.toNumber(), 0, 'Balance was reset. Contract is disabled')
    // })

})

contract('NzouaTokenSale - Deactivation', async (accounts) => {
    let tokenSale;
    let token;
    const adminAccount = accounts[0];
    const tokensAvailable = 750000;

    beforeEach("setup all contracts", async () => {
        token = await NzouaToken.deployed();
        tokenSale = await NzouaTokenSale.deployed();
    });

    it('Disables the token sale contract', async () => {

        // Provisions Token Sale Contracts with Funds
        await token.transfer(tokenSale.address, (tokensAvailable), {
            from: adminAccount
        })

        // Get the old balance of the token sale contract
        oldBalance = await token.balanceOf(tokenSale.address);

        // End the token sale
        await tokenSale.endSale({
            from: adminAccount
        })

        // Get the new balance of the token sale contract
        newBalance = await token.balanceOf(tokenSale.address);

        // Confirm that both old and new balances of the contract have different values
        assert.notEqual(oldBalance.toNumber(), newBalance.toNumber(), 'Both balances are not equal')

        // Confirm that the balance of the contract was reset after deactivation
        assert.equal(newBalance.toNumber(), 0, 'Balance was reset. Contract is disabled')
    })
})