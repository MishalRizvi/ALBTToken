const { assert, Assertion } = require("chai");

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
            assert.fail();
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
        assert.equal(transferReceipt.logs[0].event, 'Transfer', 'should be the Transfer event'); 
        assert.equal(transferEvent._from, accounts[0]); 
        assert.equal(transferEvent._to, accountOne); 
        assert.equal(transferEvent._value, 250000); 
        const accountZeroBalance = await this.ALBTTokenDeployed.balanceOf(accounts[0]); 
        const accountOneBalance = await this.ALBTTokenDeployed.balanceOf(accounts[1]); 
        assert.equal(accountZeroBalance, 750000, 'deducts the amount of tokens transferred from the sending account'); 
        assert.equal(accountOneBalance, 250000, 'adds the amount of tokens transferred to the receiving account'); 
    })

    it('approves tokens for delegated transfer', async() => {
        const approved = await this.ALBTTokenDeployed.approve.call(accounts[1], 100, { from: accounts[0] }); //approving account one to spend 100 tokens on our behalf 
        assert.equal(approved, true); 
        const approvedReceipt = await this.ALBTTokenDeployed.approve(accounts[1], 100, { from: accounts[0] }); 
        const approvedEvent = await approvedReceipt.logs[0].args;
        assert.equal(approvedReceipt.logs.length, 1, 'triggers one event'); 
        assert.equal(approvedReceipt.logs[0].event, 'Approval', 'should be the Approval event'); 
        assert.equal(approvedEvent._owner, accounts[0]); 
        assert.equal(approvedEvent._spender, accounts[1]); 
        assert.equal(approvedEvent._value, 100);
        const allowance = await this.ALBTTokenDeployed.allowance(accounts[0], accounts[1]); //accounts[0] is the admin account, keeping track of the transactions approved, stored in the allowance variable in the contract 
        assert.equal(allowance, 100, 'stores the allowance for delegated transfer'); 
    })
    it('handles delegated token transfers', async() => {
        const fromAccount = accounts[2]; 
        const toAccount = accounts[3]; 
        const spendingAccount = accounts[4]; 
        const transferReceipt = await this.ALBTTokenDeployed.transfer(fromAccount, 100, { from: accounts[0] }); //Transfer some tokens to fromAccount 
        assert.equal(transferReceipt.logs[0].event, 'Transfer', 'should be the Transfer event'); 
        const approvedReceipt = await this.ALBTTokenDeployed.approve(spendingAccount, 10, {from: fromAccount }); //Allow spendingAccount to spend tokens from fromAccount
        assert.equal(approvedReceipt.logs[0].event, 'Approval', 'should be the Approval event'); 

        try {
            const transferFromReceipt = await this.ALBTTokenDeployed.transferFrom(fromAccount, toAccount, 9999, { from: spendingAccount }); 
            assert.fail();
        }
        catch(error) {
            const revertMessage = error.message.search('revert') >= 0; 
            assert(revertMessage, 'cannot transfer value greater than balance'); 
        }
        try {
            const transferFromReceipt = await this.ALBTTokenDeployed.transferFrom(fromAccount, toAccount, 20, { from: spendingAccount }); 
            assert.fail();
        }
        catch(error) {
            const revertMessage = error.message.search('revert') >= 0; 
            assert(revertMessage, 'cannot transfer value greater than approved amount'); 
        }
        const transferFrom = await this.ALBTTokenDeployed.transferFrom.call(fromAccount, toAccount, 10, { from: spendingAccount }); 
        assert.equal(transferFrom, true); 
        const transferFromReceipt = await this.ALBTTokenDeployed.transferFrom(fromAccount, toAccount, 10, { from: spendingAccount }); 
        const transferFromEvent = await transferFromReceipt.logs[0].args;
        assert.equal(transferFromReceipt.logs.length, 1, 'triggers one event'); 
        assert.equal(transferFromReceipt.logs[0].event, 'Transfer', 'should be the Transfer event'); 
        assert.equal(transferFromEvent._from, fromAccount, 'logs the account the tokens are transferred from'); 
        assert.equal(transferFromEvent._to, toAccount, 'logs the account the tokens are transferred to'); 
        assert.equal(transferFromEvent._value, 10, 'logs the transfer amount');

        const fromAccountBal = await this.ALBTTokenDeployed.balanceOf(fromAccount); 
        assert.equal(fromAccountBal, 90, 'deducts the amount from the sending account');
        const toAccountBal = await this.ALBTTokenDeployed.balanceOf(toAccount); 
        assert.equal(toAccountBal, 10, 'adds the amount to the recieiving account');

        const allowance = await this.ALBTTokenDeployed.allowance(fromAccount, spendingAccount); 
        assert.equal(allowance, 0, 'deducts the amount from the allowance');
    })
})