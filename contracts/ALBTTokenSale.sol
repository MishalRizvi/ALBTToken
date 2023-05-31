pragma solidity >=0.6.0;
import "./ALBTToken.sol";

contract ALBTTokenSale {

    address admin;
    ALBTToken public tokenContract;
    uint256 public tokenPrice; 
    uint256 public tokensSold;

    event Sell (
       address _buyer, 
       uint256 _amount
    );

    event EndSale();


    constructor(address _tokenContract, uint256 _tokenPrice) public {
        admin = msg.sender; //The admin will be the person who calls this function, i.e. the one who deploys the contract
        tokenContract = ALBTToken(_tokenContract); 
        //tokenContract = _tokenContract;
        tokenPrice = _tokenPrice;
    }

    function multiply(uint x, uint y) internal pure returns (uint z) { //internal means function is not public, pure means there are no transactions taking place inside this function
                                                                       // i.e. not reading/writing to the blockchain
        require(y == 0 || (z = x * y) / y == x);
    }


    function buyTokens(uint256 _numberOfTokens) public payable { //payable means that the person who calls this function needs to send a number of wei in order to call it
        require(msg.value == multiply(_numberOfTokens, tokenPrice)); //using multiply function for safe maths, in case _numberOfTokens is not an int 
        require(tokenContract.balanceOf(address(this)) >= _numberOfTokens);
        require(tokenContract.transfer(msg.sender, _numberOfTokens));
        tokensSold += _numberOfTokens;
        emit Sell(msg.sender, _numberOfTokens);
    }   

    function endSale() public {
        require(msg.sender == admin); 
        require(tokenContract.transfer(admin, tokenContract.balanceOf(address(this))));
        address payable addr = payable(admin);
        emit EndSale(); 
        selfdestruct(addr);

    }


}