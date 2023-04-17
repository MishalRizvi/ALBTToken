const ALBTToken = artifacts.require("./ALBTToken.sol");

module.exports = function(deployer) {
  deployer.deploy(ALBTToken);
};
