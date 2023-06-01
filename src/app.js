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
    render();
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
    // // Modern dapp browsers...
    // if (window.ethereum) {
    //     web3 = new Web3(ethereum)
    //     try {
    //         // Request account access if needed
    //         //await ethereum.enable()
    //         await ethereum.eth_requestAccounts()
    //         // Acccounts now exposed
    //         web3.eth.sendTransaction({from:'0xDF5E4Ebf3CAA3479A189aB342c5Cb5933bB97c96'})
    //     } catch (error) {
    //         // User denied account access...
    //     }
    // }
    // // Legacy dapp browsers...
    // else if (window.web3) {
    //     web3Provider = web3.currentProvider
    //     web3 = new Web3(web3.currentProvider)
    //     // Acccounts always exposed
    //     web3.eth.sendTransaction({/* ... */ })
    // }
    // // Non-dapp browsers...
    // else {
    //     console.log('Non-Ethereum browser detected. You should consider trying MetaMask!')
    // }
}

async function loadContract() {
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
    console.log("Tokens sold: " + tokensSoldTemp.toNumber())
    $(".tokens-sold").html(tokensSoldTemp.toNumber());
    $(".tokens-available").html(tokensAvailable);

    const ALBTToken = await $.getJSON('ALBTToken.json');
    contracts.ALBTToken = TruffleContract(ALBTToken);
    contracts.ALBTToken.setProvider(web3Provider);
    ALBTTokenDeployed = await contracts.ALBTToken.deployed();
    console.log("ALBT Token Address: " + ALBTTokenDeployed.address);
}

async function render() {
    if (loading) {
        return;
    }
    setLoading(true);
    loadAccount();
    //await renderTasks();
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
        account = result[0];
        console.log("account: " + account);
        $("#accountAddress").html("Your account: " + account);
    })
}
async function renderTasks() {

}