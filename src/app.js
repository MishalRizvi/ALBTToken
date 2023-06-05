// const { ALBTTokenDeployed } = require("../test/ALBTToken");

var web3 = '';
var web3Provider = '';
var contracts = {};
var ALBTTokenSaleDeployed = '';
var ALBTTokenDeployed = '';
var loading = false;
var account = '';
var tokenPrice = 0;
var tokensSold = 0;
var tokensAvailable = 750000;

$(document).ready(function() {
    console.log("App initialised");
    load();
})

function load() {
    connectToBlockchain();
    render(); //Load account here 
    loadContract();
}

async function connectToBlockchain() {
    if (typeof web3 !== 'undefined') {
        var currentProvider = new Web3.providers.HttpProvider('http://localhost:7545');
        web3Provider = currentProvider;
        web3 = new Web3(currentProvider);
    }
    else {
        window.alert("Please connect to Metamask.")
    }
    // Modern dapp browsers...
    if (window.ethereum) {
        web3 = new Web3(ethereum)
        try {
            // Request account access if needed
            //await ethereum.enable()
            await ethereum.eth_requestAccounts()
            // Acccounts now exposed
            //web3.eth.sendTransaction({from:'0xDF5E4Ebf3CAA3479A189aB342c5Cb5933bB97c96'})
        } catch (error) {
            // User denied account access...
        }
        window.ethereum.on('accountsChanged', function (accounts) {
            // Time to reload your interface with accounts[0]!
            load();
          })
    }
    // Legacy dapp browsers...
    else if (window.web3) {
        web3Provider = web3.currentProvider
        web3 = new Web3(web3.currentProvider)
        // Acccounts always exposed
        web3.eth.sendTransaction({/* ... */ })
    }
    // Non-dapp browsers...
    else {
        console.log('Non-Ethereum browser detected. You should consider trying MetaMask!')
    }
}

async function loadContract() {
    //Load token sale contract
    const ALBTTokenSale = await $.getJSON('ALBTTokenSale.json');
    contracts.ALBTTokenSale = TruffleContract(ALBTTokenSale);
    contracts.ALBTTokenSale.setProvider(web3Provider);
    ALBTTokenSaleDeployed = await contracts.ALBTTokenSale.deployed();
    console.log("ALBT Token Sale Address: " + ALBTTokenSaleDeployed.address);
    tokenPriceTemp = await ALBTTokenSaleDeployed.tokenPrice();
    console.log("Token price: " + tokenPriceTemp.toNumber())
    tokenPrice = tokenPriceTemp;
    $(".token-price").html(web3.utils.fromWei(tokenPrice, "ether"));
    tokensSoldTemp = await ALBTTokenSaleDeployed.tokensSold();
    tokensSold = tokensSoldTemp;
    console.log("Tokens sold: " + tokensSold)
    $(".tokens-sold").html(tokensSoldTemp.toNumber());
    $(".tokens-available").html(tokensAvailable);

    //Load token contract
    const ALBTToken = await $.getJSON('ALBTToken.json');
    contracts.ALBTToken = TruffleContract(ALBTToken);
    contracts.ALBTToken.setProvider(web3Provider);
    ALBTTokenDeployed = await contracts.ALBTToken.deployed();
    console.log("ALBT Token Address: " + ALBTTokenDeployed.address);
    balanceTemp = await ALBTTokenDeployed.balanceOf(account);
    balance = balanceTemp;
    console.log("balance: " + balance);
    $(".albt-balance").html(balance.toNumber());
    var progressPercent = tokensSold/tokensAvailable * 100;
    $("#progress").css('width', progressPercent + '%');
    setLoading(false);
}

async function render() {
    if (loading) {
        return;
    }
    setLoading(true);
    loadAccount();
    setLoading(false);
}

async function setLoading(bool) {
    const loader = $("#loader");
    const content = $("#content");
    if (loading) {
        loader.show();
        content.hide();
    }
    else {
        loader.hide();
        content.show();
    }
}

async function loadAccount() {
    web3.eth.getAccounts().then(function(result) {
        if (account != null) {
            account = result[0];
            $("#accountAddress").html("Your account: " + account);
            console.log("account: " + account);
        }
    })
}
async function buyTokens() {
    setLoading(true);
    const numberOfTokens = $("#numberOfTokens").val();
    console.log(numberOfTokens + "not");
    const buyTokensReciept = await ALBTTokenSaleDeployed.buyTokens(numberOfTokens, {from:account, value:numberOfTokens*tokenPrice, gas:500000});
    // console.log("Tokens brought");
    // buyTokensReciept.on('data', event => {
    //     console.log(res);
    //     buyTokensReciept.stopWatching();
    // })
    $("form").trigger("reset"); //Reset number of tokens in form
    window.location.reload();
}

// async function listenForEvents() {
//     buyTokens();
//     ALBTTokenSaleDeployed.({}, {fromBlock:0, toBlock:'latest'}).watch(function (error,event) {
//         console.log("Error triggered");
//         render();
//     })
// }