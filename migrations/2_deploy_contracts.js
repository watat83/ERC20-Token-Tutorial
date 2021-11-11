const NzouaToken = artifacts.require("NzouaToken");

module.exports = async function (deployer, network, accounts) {
    await deployer.deploy(NzouaToken);
    const Instance = await NzouaToken.deployed();
    // console.log(Instance)
};