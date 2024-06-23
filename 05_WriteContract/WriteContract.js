// 声明只可写合约的规则：
// const contract = new ethers.Contract(address, abi, signer);
// 参数分别为合约地址`address`，合约ABI `abi`，Signer变量`signer`

import { ethers } from "ethers";
// playcode免费版不能安装ethers，用这条命令，需要从网络上import包（把上面这行注释掉）
// import { ethers } from "https://cdn-cors.ethers.io/lib/ethers-5.6.9.esm.min.js";

// 利用Alchemy的rpc节点连接以太坊网络
// 准备 alchemy API 可以参考https://github.com/AmazingAng/WTFSolidity/blob/main/Topics/Tools/TOOL04_Alchemy/readme.md
// const ALCHEMY_GOERLI_URL = 'https://eth-goerli.alchemyapi.io/v2/GlaeWuylnNM3uuOo-SAwJxuwTdqHaY5l';
// const provider = new ethers.JsonRpcProvider(ALCHEMY_GOERLI_URL);

// const ALCHEMY_SEPOLIA_URL = 'https://rpc.sepolia.org';
// const provider = new ethers.JsonRpcProvider(ALCHEMY_SEPOLIA_URL)
// const provider = new ethers.getDefaultProvider();

const provider = new ethers.JsonRpcProvider('https://sepolia.infura.io/v3/8a8a926cab7c4687a853bd32c526c17b')

// 利用私钥和provider创建wallet对象
const privateKey = 'a803fc8c4530f6e456cb5d28d116014639c3c610eb5fc251c78ea9c4247c3ab3'
const wallet = new ethers.Wallet(privateKey, provider)

// WETH的ABI
const abiWETH = [
    "function balanceOf(address) public view returns(uint)",
    "function deposit() public payable",
    "function transfer(address, uint) public returns (bool)",
    "function withdraw(uint) public",
];
// WETH合约地址（Goerli测试网）
// const addressWETH = '0xc02aaa39b223fe8d0a0e5c4f27ead9083c756cc2'
// WETH合约地址（sepolia测试网）
const addressWETH = '0xa04e0490AD3612C3d0CD470d317BFb3c4C41Af3F'
// WETH Contract

// 测试钱包地址
const testPrivateKey = 'c94116a1df75f74bfbacd86c7f2cda79bcb725efb746c7c555c583f2e28f6e97'
const testWallet = new ethers.Wallet(testPrivateKey, provider)
const testAddress = testWallet.getAddress()


// 声明可写合约
const contractWETH = new ethers.Contract(addressWETH, abiWETH, wallet)
// 也可以声明一个只读合约，再用connect(wallet)函数转换成可写合约。
// const contractWETH = new ethers.Contract(addressWETH, abiWETH, provider)
// contractWETH.connect(wallet)

const main = async () => {

    const address = await wallet.getAddress()
    // 1. 读取WETH合约的链上信息（WETH abi）
    console.log("\n1. 读取WETH余额")
    const balanceWETH = await contractWETH.balanceOf(address)
    console.log(`存款前WETH持仓: ${ethers.formatEther(balanceWETH)}\n`)
    //读取钱包内ETH余额
    const balanceETH = await provider.getBalance(wallet)
    console.log(`test: ${ethers.formatEther(balanceETH)}`);
    // 如果钱包ETH足够
    if (ethers.formatEther(balanceETH) > 0.001) {

        // 2. 调用deposit()函数，将0.001 ETH转为WETH
        console.log("\n2. 调用deposit()函数，存入0.001 ETH")
        // 发起交易
        const tx = await contractWETH.deposit({value: ethers.parseEther("0.001")})
        // 等待交易上链
        await tx.wait()
        console.log(`交易详情：`)
        console.log(tx)
        const balanceWETH_deposit = await contractWETH.balanceOf(address)
        console.log(`存款后WETH持仓: ${ethers.formatEther(balanceWETH_deposit)}\n`)

        // 3. 调用transfer()函数，将0.001 WETH转账给 vitalik
        console.log("\n3. 调用transfer()函数，给vitalik转账0.001 WETH")
        // 发起交易
        const tx2 = await contractWETH.transfer(testAddress, ethers.parseEther("0.0001"))
        // 等待交易上链
        await tx2.wait()
        const balanceWETH_transfer = await contractWETH.balanceOf(address)
        console.log(`转账后WETH持仓: ${ethers.formatEther(balanceWETH_transfer)}\n`)

    }else{
        // 如果ETH不足
        console.log("ETH不足，去水龙头领一些Goerli ETH")
        console.log("1. chainlink水龙头: https://faucets.chain.link/goerli")
        console.log("2. paradigm水龙头: https://faucet.paradigm.xyz/")
    }
}

main()
