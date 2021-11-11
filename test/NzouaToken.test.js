var NzouaToken = artifacts.require('./NzouaToken');

contract('NzouaToken', async (accounts) => {
    it('Sets the total supply on deployment', async () => {
        const token = await NzouaToken.deployed();
        let totalSupply = await token.totalSupply();
        totalSupply = totalSupply.toNumber();
        assert.equal(totalSupply, 1000000, 'Total supply set correctly to 1,000,000')
    })
})