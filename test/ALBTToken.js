const { assert } = require("chai");

var ALBTToken = artifacts.require("./ALBTToken.sol");

contract("ALBTToken", (accounts) => { //All of the accounts from ganache
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
    it('initialises the contract with correct values', async() => {
        const contractName = await this.ALBTTokenDeployed.name(); 
        assert.equal(contractName, 'ALBT Token'); 
        const contractSymbol = await this.ALBTTokenDeployed.symbol();
        assert.equal(contractSymbol, 'ALBT');
        const contractStandard = await this.ALBTTokenDeployed.standard(); 
        assert.equal(contractStandard, "AlBt Token v1.0"); 
    })
    it('allocates the total supply of tokens correctly upon deployment', async() => {
        const taskCount = await this.ALBTTokenDeployed.totalSupply();
        assert.equal(taskCount, 1000000);
    })
    it('allocates initial supply of tokens to the admin account', async() => {
        const adminBalance = await this.ALBTTokenDeployed.balanceOf(accounts[0]);
        assert.equal(adminBalance, 1000000);
    })
    it('transfers tokens as required', async() => {
        const accountOne = accounts[1]; 
        try {
            await this.ALBTTokenDeployed.transfer.call(accountOne, 9999999999); //.transfer.call does not actually trigger the transaction/method 'transfer', whereas .transfer does
        }
        catch(error) {
            const revertMessage = error.message.search('revert') >= 0; 
            assert(revertMessage, 'error message must contain revert'); 
        }
        const transferCallReceipt = await this.ALBTTokenDeployed.transfer.call(accountOne, 250000, { from: accounts[0] });
        assert.equal(transferCallReceipt, true);
        const transferReceipt = await this.ALBTTokenDeployed.transfer(accountOne, 250000, { from: accounts[0] });
        const transferEvent = await transferReceipt.logs[0].args; 
        assert.equal(transferReceipt.logs.length, 1, 'triggers one event'); 
        console.log(transferReceipt.logs);
        //assert.equal(transferReceipt.logs.args, 'Transfer', 'should be the Transfer event'); 
        assert.equal(transferEvent._from, accounts[0]); 
        assert.equal(transferEvent._to, accountOne); 
        assert.equal(transferEvent._value, 250000); 
        const accountZeroBalance = await this.ALBTTokenDeployed.balanceOf(accounts[0]); 
        const accountOneBalance = await this.ALBTTokenDeployed.balanceOf(accounts[1]); 
        assert.equal(accountZeroBalance, 750000, 'deducts the amount of tokens transferred from the sending account'); 
        assert.equal(accountOneBalance, 250000, 'adds the amount of tokens transferred to the receiving account'); 
    })
})