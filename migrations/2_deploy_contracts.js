const ALBTToken = artifacts.require("./ALBTToken.sol");

module.exports = function(deployer) {
  deployer.deploy(ALBTToken, 1000000); //Here we are deploying the contract and setting the _initialSupply as 1000000
};
