const { assert } = require("chai");

var ALBTToken = artifacts.require("./ALBTToken.sol");

contract("ALBTToken", (accounts) => {
    before(async() => {
        this.ALBTTokenDeployed = await ALBTToken.deployed();
    })
    it('deploys successfully', async() => {
        const address = await this.ALBTTokenDeployed.address;
        assert.notEqual(address, 0x0);
        assert.notEqual(address, '');
        assert.notEqual(address, null);
        assert.notEqual(address, undefined);
    })
    it('sets the total supply correctly upon deployment', async() => {
        const taskCount = await this.ALBTTokenDeployed.totalSupply();
        assert.equal(taskCount, 1000000);
    })
})