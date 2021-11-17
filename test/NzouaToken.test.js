var NzouaToken = artifacts.require('./NzouaToken');

contract('NzouaToken', async (accounts) => {


    it('Initializes the contract with the appropriate attributes', async () => {
        const token = await NzouaToken.deployed();
        let name = await token.name();
        let symbol = await token.symbol();
        assert.equal(name, "Nzouat Token", 'Nzouat Token has the correct name.');
        assert.equal(symbol, "NZT", 'Nzouat Token has the correct symbol.');
    });
    it('Sets the total supply on deployment', async () => {
        const token = await NzouaToken.deployed();
        let totalSupply = await token.totalSupply();
        totalSupply = totalSupply.toNumber();
        assert.equal(totalSupply, 1000000, 'Total supply set correctly to 1,000,000')

    });
    it('Allocates the total supply to Contract Owner', async () => {
        const token = await NzouaToken.deployed();
        let ownerBalance = await token.balanceOf(accounts[0]);
        ownerBalance = ownerBalance.toNumber();
        assert.equal(ownerBalance, 1000000, 'Total supply allocated correctly to account ' + accounts[0] + '.');
    });

    it('Transfers tokens', async () => {

        const token = await NzouaToken.deployed();
        try {
            await token.transfer(accounts[1], 1000000000);
            const balAcct1 = await token.balanceOf(accounts[1])
            assert.equal(balAcct1, 1000000000, 'The account does not have enough funds to make the transfer to account ' + accounts[1] + '.');

            // Transfer from accounts[0] to accounts[1]
            const receipt = await token.transfer(accounts[1], 250000, {
                from: accounts[0]
            });

            // Verify transaction logs
            assert.equal(receipt.logs.length, 1, 'triggers one event');
            assert.equal(receipt.logs[0].event, 'Transfer', 'should be the "Transfer()" event');
            assert.equal(receipt.logs[0].args._from, accounts[0], 'logs the account the tokens are transferred from');
            assert.equal(receipt.logs[0].args._to, accounts[1], 'logs the account the tokens are transferred to');
            assert.equal(receipt.logs[0].args._value.toNumber(), 250000, 'logs the transfer amount');

            // grabbing each balances
            const balanceAccount0 = await token.balanceOf(accounts[0]);
            const balanceAccount1 = await token.balanceOf(accounts[1]);

            // Checking that balances were updated
            assert.equal(balanceAccount0.toNumber(), 750000, 'debits account ' + accounts[0] + ' the amount of ' + balanceAccount0.toNumber() + '.');
            assert.equal(balanceAccount1.toNumber(), 250000, 'credits account ' + accounts[1] + ' the amount of ' + balanceAccount1.toNumber() + '.');

        } catch (error) {
            assert(error.message.indexOf('revert') >= 0, 'error must contain the term revert');
        }

    });

    it('Approves tokens for delegated tranfers', async () => {

        const token = await NzouaToken.deployed();
        let approved = await token.approve.call(accounts[1], 100);
        assert.equal(approved, true, 'it returns true');


        // Test the Approval() Event
        let receipt = await token.approve(accounts[1], 100, {
            from: accounts[0]
        });

        // Verify transaction logs
        assert.equal(receipt.logs.length, 1, 'triggers one event');
        assert.equal(receipt.logs[0].event, 'Approval', 'should be the "Approval()" event');
        assert.equal(receipt.logs[0].args._owner, accounts[0], 'logs the account the tokens/funds are authorized by');
        assert.equal(receipt.logs[0].args._spender, accounts[1], 'logs the account the tokens/funds are authorized to');
        assert.equal(receipt.logs[0].args._value.toNumber(), 100, 'logs the transfer amount');


        // Test the allowance() function
        let allowance = await token.allowance(accounts[0], accounts[1]);

        // Verify transaction logs
        assert.equal(allowance.toNumber(), 100, 'stores the allowance for delegated transfer');

    });
    it('Handles delegated NZT tranfers', async () => {

        // Get a deployed instance of the token
        const token = await NzouaToken.deployed();

        // Set account variables
        adminAccount = accounts[0]; // The Admin
        fromAccount = accounts[2]; // The Owner of the account
        toAccount = accounts[3]; // The Recipient of the funds
        spendingAccount = accounts[4]; // The delegate Spender of the funds

        // Transfer 100 NZT tokens to fromAccount so it can spend
        transferReceipt = await token.transfer(fromAccount, 100, {
            from: adminAccount
        });
        assert.equal(transferReceipt.logs[0].args._value.toNumber(), 100, 'transfers 100 NZT to fromAccount for spending')

        // Approve spendingAccount to spend 10 NZT tokens on behalf of fromAccount
        approvalReceipt = await token.approve(spendingAccount, 10, {
            from: fromAccount
        })
        assert.equal(approvalReceipt.logs[0].args._value.toNumber(), 10, '10 NZT Tokens were approved by fromAccount for spendingAccount to spend')

        //  Ensure that spender cannot spend more than the current balance inside fromAccount and catch the error if anything
        try {
            failReceipt = await token.transferFrom.call(fromAccount, toAccount, 9999, {
                from: spendingAccount
            });
            assert.equal(failReceipt, true, 'Spender CAN spend more than their balance.');
        } catch (error) {
            assert(error.message.indexOf('revert') >= 0, 'Cannot transfer funds larger than balance');
        }

        //  Ensure that spender cannot spend more than the allowance amount
        try {
            failReceipt2 = await token.transferFrom.call(fromAccount, toAccount, 20, {
                from: spendingAccount
            });
            assert.equal(failReceipt2, true, 'Spender CAN spend more than the approved amount.');
        } catch (error) {
            assert(error.message.indexOf('revert') >= 0, 'Cannot spend funds larger than approved amount');
        }

        //  Ensure that spender can spend the right allowance amount
        try {
            successResult = await token.transferFrom.call(fromAccount, toAccount, 10, {
                from: spendingAccount
            });
            assert.equal(successResult, true, 'Spender CAN spend up to the approved amount.');
        } catch (error) {
            assert(error.message.indexOf('revert') >= 0, 'Cannot spend funds larger than approved amount');
        }

        //  Inspect the transaction logs of a valid transaction
        logsReceipt = await token.transferFrom(fromAccount, toAccount, 10, {
            from: spendingAccount
        });

        // Verify transaction logs
        assert.equal(logsReceipt.logs.length, 1, 'triggers one event');
        assert.equal(logsReceipt.logs[0].event, 'Transfer', 'should be the "Transfer()" event');
        assert.equal(logsReceipt.logs[0].args._from, fromAccount, 'logs the account the tokens are transferred from');
        assert.equal(logsReceipt.logs[0].args._to, toAccount, 'logs the account the tokens are transferred to');
        assert.equal(logsReceipt.logs[0].args._value.toNumber(), 10, 'logs the transfer amount');

        // Verify Account Balances are updated accordingly
        fromBalance = await token.balanceOf(fromAccount);
        toBalance = await token.balanceOf(toAccount);

        assert.equal(fromBalance.toNumber(), 90, 'fromAccount was debited 10 NZT Tokens and its new balance is 90')
        assert.equal(toBalance.toNumber(), 10, 'toAccount was credited with 10 NZT Tokens and its new balance is 10')


        // get the allowance and assert it is the right amount
        allowanceAmount = await token.allowance(fromAccount, spendingAccount)
        assert.equal(allowanceAmount.toNumber(), 0, 'The amount was successfully deducted from the allowance')

    });

});