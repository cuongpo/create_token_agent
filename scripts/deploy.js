// We require the Hardhat Runtime Environment explicitly here. This is optional
// but useful for running the script in a standalone fashion through `node <script>`.
//
// When running the script with `npx hardhat run <script>` you'll find the Hardhat
// Runtime Environment's members available in the global scope.
const hre = require("hardhat");
const fs = require('fs');
const path = require('path');

// Explicitly load environment variables to ensure we get the latest values
require('dotenv').config();

// Read token configuration from file
function readTokenConfig() {
  try {
    const configPath = path.resolve('./token-config.json');
    if (fs.existsSync(configPath)) {
      const configData = fs.readFileSync(configPath, 'utf8');
      return JSON.parse(configData);
    }
  } catch (error) {
    console.error('Error reading token config file:', error);
  }
  return {};
}

async function main() {
  // Hardhat always runs the compile task when running scripts with its command
  // line interface.
  //
  // If this script is run directly using `node` you may want to call compile
  // manually to make sure everything is compiled
  // await hre.run('compile');

  const [deployer] = await hre.ethers.getSigners();
  console.log("Deploying contracts with the account:", deployer.address);
  
  // Get the contract factory
  const MyToken = await hre.ethers.getContractFactory("MyToken");
  
  // Read token config from file
  const tokenConfig = readTokenConfig();
  
  // Deploy with constructor parameters, prioritizing config file over env vars
  const tokenName = tokenConfig.tokenName || process.env.TOKEN_NAME || "MyToken";
  const tokenSymbol = tokenConfig.tokenSymbol || process.env.TOKEN_SYMBOL || "MTK";
  const initialSupply = parseInt(tokenConfig.initialSupply || process.env.INITIAL_SUPPLY) || 1000000; // Parse as integer
  const ownerAddress = tokenConfig.ownerAddress || deployer.address;
  
  console.log("\nUsing for deployment:");
  console.log("Token Name:", tokenName);
  console.log("Token Symbol:", tokenSymbol);
  console.log("Initial Supply:", initialSupply);
  console.log("Owner Address:", ownerAddress);
  
  const token = await MyToken.deploy(
    tokenName,
    tokenSymbol,
    initialSupply,
    ownerAddress
  );

  await token.deployed();

  console.log("Token deployed to:", token.address);
  console.log("Token Name:", tokenName);
  console.log("Token Symbol:", tokenSymbol);
  console.log("Initial Supply:", initialSupply);
}

// We recommend this pattern to be able to use async/await everywhere
// and properly handle errors.
main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });
