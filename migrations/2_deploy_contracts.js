const NzouaToken = artifacts.require("NzouaToken");
const NzouaTokenSale = artifacts.require("NzouaTokenSale");

module.exports = async function (deployer, network, accounts) {

    // Pass initial supply as argument of the deployer.
    await deployer.deploy(NzouaToken, 1000000); // 1000000 NZT tokens

    // pass the ERC20 Token contract address to the crowd sale deployer, along with the token price
    await deployer.deploy(NzouaTokenSale, NzouaToken.address, 1000000000000000);


};