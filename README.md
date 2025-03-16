# ERC20 Token Creation Agent / OpenServ SDK

A specialized agent built with the [OpenServ SDK](https://github.com/openserv-labs/sdk) that creates and deploys ERC20 tokens on the Polygon Amoy testnet. This agent provides a simple interface for token creation without requiring deep blockchain knowledge, making it accessible to both developers and non-technical users.

## Features

- **Easy Token Creation**: Create and deploy custom ERC20 tokens on Polygon Amoy testnet with just a few parameters
- **Flexible Configuration**: Specify token name, symbol, and initial supply through environment variables or direct input
- **Multiple Deployment Methods**: Deploy tokens through the agent interface or directly via command line
- **Secure Implementation**: Built with OpenZeppelin's audited and secure token standards
- **Developer-Friendly**: Simple interface that abstracts away blockchain complexity while providing full control
- **Detailed Deployment Information**: Get comprehensive information about your deployed token, including contract address and explorer links

## Prerequisites

- Basic knowledge of JavaScript/TypeScript
- Node.js installed on your computer
- An OpenServ account (create one at [platform.openserv.ai](https://platform.openserv.ai))
- An OpenAI API key for local testing
- A wallet with MATIC tokens on Polygon Amoy testnet (for gas fees)
- Private key for your Polygon Amoy wallet

## Getting Started

### 1. Set Up Your Project

First, clone this repository to get a pre-configured token creation agent:

```bash
git clone https://github.com/openserv-labs/agent-starter.git
cd agent-starter
npm install
```

### 2. Configure Your Environment

Copy the example environment file and update it with your credentials:

```bash
cp .env.example .env
```

Edit the `.env` file to add:

**API Keys and Network Configuration:**
- `OPENSERV_API_KEY`: Your OpenServ API key (required for platform integration)
- `OPENAI_API_KEY`: Your OpenAI API key (for local testing)
- `PORT`: The port for your agent's server (default: 7378)
- `POLYGON_AMOY_RPC_URL`: RPC URL for Polygon Amoy (default is provided)
- `PRIVATE_KEY`: Your wallet's private key (required for deploying tokens) - **KEEP THIS SECURE!**

**Token Configuration:**
- `TOKEN_NAME`: Default name for your token (e.g., "Openserv test")
- `TOKEN_SYMBOL`: Default symbol for your token (e.g., "GGG") - typically 3-4 characters
- `INITIAL_SUPPLY`: Default initial supply (e.g., 1000000000) - this will be multiplied by 10^18 for token decimals

These token parameters can be overridden when creating tokens through the agent or command line.

### 3. Understand the Project Structure

The token creation agent has the following structure:

```
agent-starter/
├── src/
│   └── index.ts       # Your agent's core logic and server setup
├── contracts/
│   └── MyToken.sol    # ERC20 token contract template
├── scripts/
│   └── deploy.js      # Deployment script for the token contract
├── .env               # Environment variables
├── hardhat.config.js  # Hardhat configuration for Polygon Amoy
├── package.json       # Project dependencies
└── tsconfig.json      # TypeScript configuration
```

This structure separates the blockchain components (contracts and deployment scripts) from the agent logic, making it easier to understand and modify.

## Token Creation Agent Capabilities

The token creation agent is built with the OpenServ SDK and provides a specialized capability for deploying ERC20 tokens on the Polygon Amoy testnet. Let's examine how it works:

### Key Components of the Agent

1. **Agent Creation**: 
   ```typescript
   const agent = new Agent({
     systemPrompt: 'You are an agent that creates and deploys ERC20 tokens on Polygon Amoy testnet'
   })
   ```
   This creates a new agent with a system prompt that guides its behavior specifically for token creation.

2. **Token Creation Capability**: 
   ```typescript
   agent.addCapability({
     name: 'createToken',
     description: 'Creates and deploys an ERC20 token on Polygon Amoy testnet',
     schema: z.object({
       tokenName: z.string().describe('The name of the token'),
       tokenSymbol: z.string().describe('The symbol of the token'),
       initialSupply: z.number().describe('The initial supply of the token (will be multiplied by 10^18)'),
       ownerAddress: z.string().optional().describe('The address that will own the token (defaults to deployer)')
     }),
     async run({ args }) {
       // Token deployment logic
     }
   })
   ```
   This defines a capability named `createToken` that:
   - Takes parameters for token name, symbol, and initial supply
   - Updates the environment variables with these parameters
   - Compiles the smart contract using Hardhat
   - Deploys the token to Polygon Amoy testnet
   - Returns the deployment details including the token address

3. **Starting the Server**:
   ```typescript
   agent.start()
   ```
   This launches an HTTP server that handles requests from the OpenServ platform.

4. **Local Testing**:
   You can test the token creation agent locally by using the `process()` method with a prompt like "create a token called 'MyToken' with symbol 'MTK' and initial supply of 1000000".

## Token Creation Guide

### Setting Up Your Wallet for Polygon Amoy

1. **Get a wallet**: If you don't already have one, create an Ethereum wallet using MetaMask or another provider.

2. **Add Polygon Amoy to your wallet**:
   - Network Name: Polygon Amoy
   - RPC URL: https://rpc-amoy.polygon.technology/
   - Chain ID: 80002
   - Currency Symbol: MATIC
   - Block Explorer URL: https://www.oklink.com/amoy/

3. **Get testnet MATIC**:
   - Visit the Polygon Amoy faucet to get free testnet MATIC tokens
   - These tokens are needed to pay for gas fees when deploying your token

4. **Export your private key**:
   - In MetaMask, go to Account Details > Export Private Key
   - Copy this key to your `.env` file as `PRIVATE_KEY`
   - **IMPORTANT**: Never share your private key or commit it to version control

### Creating and Deploying Your Token

This agent provides two methods for creating and deploying ERC20 tokens: through the agent interface or directly via command line.

#### Method 1: Using the Agent Interface

1. **Start the agent server**:
   ```bash
   npm run dev
   ```

2. **Test token creation locally**:
   ```typescript
   async function main() {
     const tokenCreation = await agent.process({
       messages: [
         {
           role: 'user',
           content: 'create a token called "Openserv test" with symbol "GGG" and initial supply of 1000000000'
         }
       ]
     })
     
     console.log('Token Creation:', tokenCreation.choices[0].message.content)
   }
   ```

3. **Deploy through the OpenServ platform**:
   - After setting up tunneling (see below), you can use the OpenServ platform to interact with your agent
   - Simply ask it to create a token with your desired parameters, for example:
     - "Create a token called Openserv test with symbol GGG and initial supply of 1000000000"
   - The agent will handle the deployment process and return the token address and explorer link

#### Method 2: Using the Command Line (Recommended for Quick Deployments)

For a simpler approach, you can use the provided npm script to create tokens directly from the command line:

```bash
# Format: npm run create-token "<Token Name>" <Symbol> <Initial Supply>
npm run create-token "Openserv test" GGG 1000000000
```

This command will:
1. Create a token named "Openserv test" with symbol "GGG" and initial supply of 1,000,000,000 tokens
2. Deploy it to the Polygon Amoy testnet using your configured wallet
3. Output the token address and other deployment details

You can also run these commands separately:

```bash
# Compile the contracts
npm run compile

# Deploy using environment variables from .env file
npx hardhat run scripts/deploy.js --network polygonAmoy
```

#### Verifying Your Token

- Once deployed, you can view your token on the Polygon Amoy Explorer
- The deployment output will provide a direct link to your token's page (https://www.oklink.com/amoy/address/YOUR_TOKEN_ADDRESS)
- You can interact with your token using any wallet that supports the Polygon Amoy testnet

## Troubleshooting

### Common Issues and Solutions

#### Token Deployment Issues

1. **Environment Variables Not Being Used**
   - **Problem**: Token deploys with default values instead of values from .env file
   - **Solution**: Make sure your .env file is properly formatted and that you're running the script with dotenv support. The deployment script now explicitly loads environment variables using `require('dotenv').config()`.

2. **Insufficient Gas Fees**
   - **Problem**: Deployment fails with "insufficient funds" error
   - **Solution**: Make sure your wallet has enough MATIC tokens on Polygon Amoy testnet. You can get free testnet MATIC from the [Polygon Amoy Faucet](https://amoy.polygon.technology/).

3. **Incorrect Network Configuration**
   - **Problem**: Cannot connect to Polygon Amoy
   - **Solution**: Verify your `POLYGON_AMOY_RPC_URL` in the .env file. The default URL should work, but if you're experiencing issues, try using an alternative RPC provider.

4. **Token Parameters Parsing**
   - **Problem**: Initial supply not being correctly applied
   - **Solution**: Make sure the initial supply is parsed as an integer. The scripts now use `parseInt()` to ensure proper handling of numeric values.

#### Agent Interface Issues

1. **Agent Not Responding**
   - **Problem**: Agent doesn't respond to token creation requests
   - **Solution**: Check that your OpenAI API key is valid and that you've started the agent server with `npm run dev`.

2. **OpenServ Platform Connection**
   - **Problem**: Cannot connect to OpenServ platform
   - **Solution**: Verify your tunneling setup and make sure your agent is registered correctly on the platform.

### Debugging Tips

1. **Check Logs**: The deployment scripts now include detailed logging of environment variables and deployment parameters.
2. **Test Locally**: Before deploying to Polygon Amoy, test your token creation locally using Hardhat's local network.
3. **Verify Contract**: After deployment, verify your contract on the Polygon Amoy Explorer to ensure it was deployed correctly.

## Exposing Your Local Server with Tunneling

During development, OpenServ needs to reach your agent running on your computer. Since your development machine typically doesn't have a public internet address, we'll use a tunneling tool.

### What is Tunneling?

Tunneling creates a temporary secure pathway from the internet to your local development environment, allowing OpenServ to send requests to your agent while you're developing it. Think of it as creating a secure "tunnel" from OpenServ to your local machine.

### Tunneling Options

Choose a tunneling tool:

- [ngrok](https://ngrok.com/) (recommended for beginners)
  - Easy setup with graphical and command-line interfaces
  - Generous free tier with 1 concurrent connection
  - Web interface to inspect requests

- [localtunnel](https://github.com/localtunnel/localtunnel) (open source option)
  - Completely free and open source
  - Simple command-line interface
  - No account required

#### Quick Setup with ngrok

1. [Download and install ngrok](https://ngrok.com/download)
2. Open your terminal and run:

```bash
ngrok http 7378  # Use your actual port number if different
```

3. Look for a line like `Forwarding https://abc123.ngrok-free.app -> http://localhost:7378`
4. Copy the https URL (e.g., `https://abc123.ngrok-free.app`) - you'll need this for the next steps

## Integration with the OpenServ Platform

The `agent.start()` function in your code starts the HTTP server that communicates with the OpenServ platform. When the platform sends a request to your agent:

1. The server receives the request
2. The SDK parses the request and determines which capability to use
3. It executes the capability's `run` function
4. It formats and returns the response to the platform

### Testing on the Platform

To test your agent on the OpenServ platform:

1. **Start your local server**:
   ```bash
   npm run dev
   ```
   or 
  
   ```bash
   npm start
   ```

2. **Expose your server** with a tunneling tool as described in the previous section

3. **Register your agent** on the OpenServ platform:
   - Go to Developer → Add Agent
   - Enter your agent name and capabilities
   - Set the Agent Endpoint to your tunneling tool URL
   - Create a Secret Key and update your `.env` file

4. **Create a project** on the platform:
   - Projects → Create New Project
   - Add your agent to the project
   - Interact with your agent through the platform

## Advanced Capabilities

As you get more comfortable with the SDK, you can leverage more advanced methods and features such as file operations, task management, user interaction via chat and messaging. Check the methods in the [API Reference](https://github.com/openserv-labs/sdk?tab=readme-ov-file#api-reference).

## Production Deployment

When your agent is all set for production, it’s time to get it out there! Just deploy it to a hosting service so that it can be available 24/7 for users to enjoy.

1. **Build your project**:
   ```bash
   npm run build
   ```

2. **Deploy to a hosting service** like (from simplest to most advanced):

    **Serverless** (Beginner-friendly)
      - [Vercel](https://vercel.com/) - Free tier available, easy deployment from GitHub
      - [Netlify Functions](https://www.netlify.com/products/functions/) - Similar to Vercel with a generous free tier
      - [AWS Lambda](https://aws.amazon.com/lambda/) - More complex but very scalable

    **Container-based** (More control)
      - [Render](https://render.com/) - Easy Docker deployment with free tier
      - [Railway](https://railway.app/) - Developer-friendly platform
      - [Fly.io](https://fly.io/) - Global deployment with generous free tier

    **Open source self-hosted** (Maximum freedom)
      - [OpenFaaS](https://www.openfaas.com/) - Functions as a Service for Docker and Kubernetes
      - [Dokku](https://dokku.com/) - Lightweight PaaS you can install on any virtual machine

3. **Update your agent endpoint** on the OpenServ platform with your production endpoint URL

4. **Submit for review** through the Developer dashboard

---

Happy building! We're excited to see what you will create with the OpenServ SDK.
