const NzouaToken = artifacts.require("NzouaToken");

module.exports = async function (deployer, network, accounts) {
    await deployer.deploy(NzouaToken, 1000000); // Pass initial supply as argument of the deployer.
    const Instance = await NzouaToken.deployed();
};