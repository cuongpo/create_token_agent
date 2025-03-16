// Script to create and deploy a token directly from the command line
const { ethers } = require("hardhat");
require('dotenv').config();

async function main() {
  // Get command line arguments
  const args = process.argv.slice(2);
  
  // Check if arguments are provided
  if (args.length < 3) {
    console.log("Usage: node scripts/create-token.js <tokenName> <tokenSymbol> <initialSupply>");
    console.log("Example: node scripts/create-token.js \"My Token\" MTK 1000000");
    process.exit(1);
  }
  
  const tokenName = args[0];
  const tokenSymbol = args[1];
  const initialSupply = parseInt(args[2]); // Parse as integer to ensure proper handling
  
  console.log(`Creating token with the following parameters:`);
  console.log(`- Name: ${tokenName}`);
  console.log(`- Symbol: ${tokenSymbol}`);
  console.log(`- Initial Supply: ${initialSupply}`);
  
  // Get the deployer account
  const [deployer] = await ethers.getSigners();
  console.log(`Deploying with account: ${deployer.address}`);
  console.log(`Account balance: ${ethers.utils.formatEther(await deployer.getBalance())} MATIC`);
  
  // Deploy the token contract
  const MyToken = await ethers.getContractFactory("MyToken");
  const token = await MyToken.deploy(
    tokenName,
    tokenSymbol,
    initialSupply,
    deployer.address
  );
  
  await token.deployed();
  
  console.log(`Token deployed successfully!`);
  console.log(`- Name: ${tokenName}`);
  console.log(`- Symbol: ${tokenSymbol}`);
  console.log(`- Initial Supply: ${initialSupply}`);
  console.log(`- Contract Address: ${token.address}`);
  console.log(`- Network: Polygon Amoy Testnet`);
  console.log(`- Explorer URL: https://www.oklink.com/amoy/address/${token.address}`);
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });
