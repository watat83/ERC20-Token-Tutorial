var NzouaToken = artifacts.require('./NzouaToken');

contract('NzouaToken', async (accounts) => {


    it('Initializes the contract with the appropriate attributes', async () => {
            const token = await NzouaToken.deployed();
            let name = await token.name();
            let symbol = await token.symbol();
            assert.equal(name, "Nzouat Token", 'Nzouat Token has the correct name.');
            assert.equal(symbol, "NZT", 'Nzouat Token has the correct symbol.');
        }),
        it('Sets the total supply on deployment', async () => {
            const token = await NzouaToken.deployed();
            let totalSupply = await token.totalSupply();
            totalSupply = totalSupply.toNumber();
            assert.equal(totalSupply, 1000000, 'Total supply set correctly to 1,000,000')

        }),
        it('Allocates the total supply to Contract Owner', async () => {
            const token = await NzouaToken.deployed();
            let ownerBalance = await token.balanceOf(accounts[0]);
            ownerBalance = ownerBalance.toNumber();
            assert.equal(ownerBalance, 1000000, 'Total supply allocated correctly to account ' + accounts[0] + '.');
        }),

        it('Transfers tokens', async () => {

            try {
                const token = await NzouaToken.deployed();
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
                const balanceAccount0 = await token.balanceOf(accounts[0])
                const balanceAccount1 = await token.balanceOf(accounts[1])

                // Checking that balances were updated
                assert.equal(balanceAccount0.toNumber(), 750000, 'debits account ' + accounts[0] + ' the amount of ' + balanceAccount0.toNumber() + '.')
                assert.equal(balanceAccount1.toNumber(), 250000, 'credits account ' + accounts[1] + ' the amount of ' + balanceAccount1.toNumber() + '.')

            } catch (error) {
                assert(error.message.indexOf('revert') >= 0, 'error must contain the term revert');
            }

        })

});