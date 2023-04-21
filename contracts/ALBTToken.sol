pragma solidity >=0.5.0;

contract ALBTToken{
    
    uint256 public totalSupply = 0; 
    mapping(address => uint) public balanceOf;

    string public name = "ALBT Token";
    string public symbol = "ALBT";
    string public standard = "AlBt Token v1.0";
    
    //The indexed keyword allows to filter the logs to find wanted data 
    event Transfer( 
        address indexed _from, 
        address indexed _to,
        uint256 _value
    ); 

    constructor(uint256 _initialSupply) public{
        balanceOf[msg.sender] = _initialSupply; //msg.sender is the address of the account that calls this function i.e. creates an instance of this token. 
                                                //i.e. the account that deploys this contract
                                                //By default, truffle uses the first account (that can be seen on Ganache), hence the test is written in that particular way on test/ALBTToken.js
                                                //Solidity allows meta data to be passed to this function as well as the initial parameters, i.e. _initialSupply 
                                                //when for example calling the function token.transfer(web3.eth.getAccounts[1], 1, { from: web3.eth.getAccounts[0] },
                                                //you are passing the msg.sender here as the metadata, which is where the transfer is happening from)
        totalSupply = _initialSupply;
    }

    function transfer(address _to, uint256 _value) public returns (bool success){
        require (balanceOf[msg.sender] >= _value); //require in Solidity requires the condition to be met to continue executing the function, else an error will be thrown 
                                                   //This transaction uses gas (as it writes to the Blockchain). If the require condition is not met, the gas that would be used up by the rest of the function is refunded
                                                   //since the rest of the function never got executed 
        balanceOf[msg.sender] -= _value; 
        balanceOf[_to] += _value;
        emit Transfer(msg.sender, _to, _value);
        return true; 
    }
}