// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

interface IERC20 {
    function transfer(address recipient, uint256 amount) external returns (bool);
}

contract Airdrop {
    address public owner;

    event ETHTransferred(address indexed recipient, uint256 amount);
    event TokensTransferred(address indexed token, address indexed recipient, uint256 amount);

    modifier onlyOwner() {
        require(msg.sender == owner, "Caller is not the owner");
        _;
    }

    constructor() {
        owner = msg.sender;
    }

    function transferOwnership(address newOwner) public onlyOwner {
        require(newOwner != address(0), "New owner is the zero address");
        owner = newOwner;
    }

    function multiTransferETH(address[] memory recipients, uint256[] memory amounts) public payable onlyOwner {
        require(recipients.length == amounts.length, "Recipients and amounts arrays length mismatch");
        uint256 totalAmount = msg.value;
        for (uint256 i = 0; i < recipients.length; i++) {
            require(totalAmount >= amounts[i], "Insufficient ETH balance");
            totalAmount -= amounts[i];
            payable(recipients[i]).transfer(amounts[i]);
            emit ETHTransferred(recipients[i], amounts[i]);
        }
    }

    function multiTransferToken(address token, address[] memory recipients, uint256[] memory amounts) external onlyOwner {
        require(recipients.length == amounts.length, "Recipients and amounts arrays length mismatch");
        IERC20 tokenContract = IERC20(token);
        for (uint256 i = 0; i < recipients.length; i++) {
            require(tokenContract.transfer(recipients[i], amounts[i]), "Token transfer failed");
            emit TokensTransferred(token, recipients[i], amounts[i]);
        }
    }

    function recoverTokens(address token, uint256 amount) public onlyOwner {
        IERC20(token).transfer(owner, amount);
    }

    function recoverETH(uint256 amount) public onlyOwner {
        payable(owner).transfer(amount);
    }

    receive() external payable {}
}
