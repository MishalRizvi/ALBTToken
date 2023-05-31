const ALBTToken = artifacts.require("./ALBTToken.sol");
const ALBTTokenSale = artifacts.require("./ALBTTokenSale.sol");

module.exports = function(deployer) {
  deployer.deploy(ALBTToken, 1000000).then(function() {
    // Token price is 0.001 Ether
    var tokenPrice = 1000000000000000;
    return deployer.deploy(ALBTTokenSale, ALBTToken.address, tokenPrice);
  });
};
