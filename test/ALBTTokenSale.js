const { assert } = require("chai");


var ALBTToken = artifacts.require("./ALBTToken.sol"); 
var ALBTTokenSale = artifacts.require("./ALBTTokenSale.sol"); 

contract("ALBTTokenSale", (accounts) => {
    var tokensAvailable = 750000;
    var admin = accounts[0]; //The admin account is the one which owns ALL of the tokens, i.e. ALBTToken.totalSupply()
    var buyer = accounts[1];
    var numberOfTokens;
    var tokenPrice = 1000000000000000; //in wei. In Solidity, wei = pence and ether = pounds kind of. 1000000000000000000 wei = 1 ether, so the current tokenPrice set is 0.001 ether 
    before(async() => {
        this.ALBTTokenDeployed = await ALBTToken.deployed();
        this.ALBTTokenSaleDeployed = await ALBTTokenSale.deployed();
    })
    it('initialises the contract with correct values', async() => {
        const tokenSaleAddress = await this.ALBTTokenSaleDeployed.address;
        assert.notEqual(tokenSaleAddress, 0x0);
        assert.notEqual(tokenSaleAddress, '');
        assert.notEqual(tokenSaleAddress, null);
        assert.notEqual(tokenSaleAddress, undefined); 
        const ALBTTokenContract = await this.ALBTTokenSaleDeployed.tokenContract(); 
        assert.notEqual(ALBTTokenContract, 0x0, 'has token contract address');
        const ALBTTokenPrice = await this.ALBTTokenSaleDeployed.tokenPrice(); 
        assert.equal(ALBTTokenPrice, 1000000000000000); 
    })
   it('facilitates token buying', async() => {
        numberOfTokens = 10;
        const tokenSaleAddress = await this.ALBTTokenSaleDeployed.address;
        const transferReceipt = await this.ALBTTokenDeployed.transfer(tokenSaleAddress, tokensAvailable, {from: admin}); //provisiono of 75% of total tokens to the token sale contract
        const buyTokensReceipt = await this.ALBTTokenSaleDeployed.buyTokens(numberOfTokens, {from: buyer, value: numberOfTokens * tokenPrice}); //as the buyTokens function is payable, have to pass the value of wei that you are sending when you call that function, AS WELL as the address of the msg.sender- in the metadata
        console.log(buyTokensReceipt);
        const buyTokensEvent = await buyTokensReceipt.logs[0].args;
        console.log(buyTokensReceipt);
        assert.equal(buyTokensReceipt.logs.length, 1, 'triggers one event'); 
        assert.equal(buyTokensReceipt.logs[0].event, 'Sell', 'should be the Sell event');
        assert.equal(buyTokensEvent._buyer, buyer, 'logs the number of tokens purchased');
        assert.equal(buyTokensEvent._amount, numberOfTokens, 'logs the number of tokens purchased');
        const tokensSold = await this.ALBTTokenSaleDeployed.tokensSold(); 
        assert.equal(tokensSold, 10, 'increments the number of tokens sold'); 
        const buyerBalance = await this.ALBTTokenDeployed.balanceOf(buyer); 
        assert.equal(buyerBalance, numberOfTokens); 
        const tokenSaleBalance = await this.ALBTTokenDeployed.balanceOf(tokenSaleAddress);
        assert.equal(tokenSaleBalance, tokensAvailable - numberOfTokens);
        try {
            const buyTokensReceiptWrongPrice = await this.ALBTTokenSaleDeployed.buyTokens.call(numberOfTokens, {from: buyer, value: 1}); //tries to buy tokens with 1 wei even though token price is 1000000000000000 wei
            assert.fail(); 
        }
        catch(error) {
            //console.log(error.message)
            const revertMessage = error.message.search('revert') >= 0;
            assert(revertMessage, 'msg.value must equal number of tokens * token price');
        }
        try {
            const buyTokensTooMany = await this.ALBTTokenSaleDeployed.buyTokens.call(800000, {from: buyer, value: numberOfTokens*tokenPrice});
            assert.fail();
        }
        catch(error) {
            //console.log(error.message)
            const revertMessage = error.message.search('revert') >= 0;
            assert(revertMessage, 'cannot purchase more tokens than available'); //remember the token sale contract only has 750000 tokens
        }
    })
    it('ends token sale', async() => {
        var admin = accounts[0]; //The admin account is the one which owns ALL of the tokens, i.e. ALBTToken.totalSupply()
        var buyer = accounts[1];
        try {
            const endSaleReceiptWrong = await this.ALBTTokenSaleDeployed.endSale({from: buyer}); 
            assert.fail(); 
        }
        catch(error) {
            //console.log(error.message);
            const revertMessage = error.message.search('revert') >= 0; 
            assert(revertMessage, 'must be admin to end token sale');
        }
        const endSaleReceipt = await this.ALBTTokenSaleDeployed.endSale({from: admin}); 
        console.log(endSaleReceipt);
        assert.equal(endSaleReceipt.logs[0].event, 'EndSale', 'should be the EndSale event');
        // const adminBalance = await this.ALBTTokenDeployed.balanceOf(admin);
        // assert.equal(adminBalance, 999990, 'returns all unsold ALBT Tokens to admin'); 
        // //Token price should then be reset when self destruct method is called - since the contract is deleted, you cannot actually access the tokenPrice hence this test will not work 
        // var tokenSaleTokenPrice = await this.ALBTTokenSaleDeployed.tokenPrice();
        // assert.equal(tokenSaleTokenPrice, 0, 'token price was reset'); 
    })

})