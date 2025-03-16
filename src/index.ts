import { z } from 'zod'
import { Agent } from '@openserv-labs/sdk'
import 'dotenv/config'
import { exec } from 'child_process'
import { promisify } from 'util'
import * as fs from 'fs'

const execPromise = promisify(exec)

// Create the agent
const agent = new Agent({
  systemPrompt: 'You are an agent that creates and deploys ERC20 tokens on Polygon Amoy testnet'
})

// Add token creation capability
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
    try {
      // Update .env file with token parameters
      const envPath = './.env'
      let envContent = ''
      
      try {
        envContent = fs.readFileSync(envPath, 'utf8')
      } catch (error) {
        console.error('Error reading .env file:', error)
        return 'Error: Could not read .env file. Please make sure it exists.'
      }

      // Update or add token configuration
      const envLines = envContent.split('\n')
      const tokenNameLine = envLines.findIndex(line => line.startsWith('TOKEN_NAME='))
      const tokenSymbolLine = envLines.findIndex(line => line.startsWith('TOKEN_SYMBOL='))
      const initialSupplyLine = envLines.findIndex(line => line.startsWith('INITIAL_SUPPLY='))
      
      if (tokenNameLine >= 0) {
        envLines[tokenNameLine] = `TOKEN_NAME=${args.tokenName}`
      } else {
        envLines.push(`TOKEN_NAME=${args.tokenName}`)
      }
      
      if (tokenSymbolLine >= 0) {
        envLines[tokenSymbolLine] = `TOKEN_SYMBOL=${args.tokenSymbol}`
      } else {
        envLines.push(`TOKEN_SYMBOL=${args.tokenSymbol}`)
      }
      
      if (initialSupplyLine >= 0) {
        envLines[initialSupplyLine] = `INITIAL_SUPPLY=${args.initialSupply}`
      } else {
        envLines.push(`INITIAL_SUPPLY=${args.initialSupply}`)
      }
      
      // Write updated .env file
      fs.writeFileSync(envPath, envLines.join('\n'))
      
      // Check if private key is set
      if (!process.env.PRIVATE_KEY || process.env.PRIVATE_KEY === 'your_wallet_private_key_here') {
        return 'Error: Please set your PRIVATE_KEY in the .env file before deploying a token.'
      }
      
      // Check if RPC URL is set
      if (!process.env.POLYGON_AMOY_RPC_URL) {
        return 'Error: Please set your POLYGON_AMOY_RPC_URL in the .env file before deploying a token.'
      }

      // Compile contracts
      console.log('Compiling contracts...')
      const { stdout: compileOutput, stderr: compileError } = await execPromise('npx hardhat compile')
      
      if (compileError) {
        console.error('Compilation error:', compileError)
        return `Error compiling contracts: ${compileError}`
      }
      
      console.log('Compilation output:', compileOutput)
      
      // Deploy token to Polygon Amoy
      console.log('Deploying token to Polygon Amoy...')
      const { stdout: deployOutput, stderr: deployError } = await execPromise('npx hardhat run scripts/deploy.js --network polygonAmoy')
      
      if (deployError) {
        console.error('Deployment error:', deployError)
        return `Error deploying token: ${deployError}`
      }
      
      console.log('Deployment output:', deployOutput)
      
      // Extract token address from deployment output
      const addressMatch = deployOutput.match(/Token deployed to: (0x[a-fA-F0-9]{40})/)
      const tokenAddress = addressMatch ? addressMatch[1] : 'Address not found in output'
      
      return `
Token deployment successful!

Token Details:
- Name: ${args.tokenName}
- Symbol: ${args.tokenSymbol}
- Initial Supply: ${args.initialSupply}
- Contract Address: ${tokenAddress}
- Network: Polygon Amoy Testnet

You can view your token on the Polygon Amoy Explorer:
https://www.oklink.com/amoy/address/${tokenAddress}
`
    } catch (error: any) {
      console.error('Error in createToken capability:', error)
      return `Error creating token: ${error.message || String(error)}`
    }
  }
})

// Keep the sum capability for backward compatibility
agent.addCapability({
  name: 'sum',
  description: 'Sums two numbers',
  schema: z.object({
    a: z.number(),
    b: z.number()
  }),
  async run({ args }) {
    return `${args.a} + ${args.b} = ${args.a + args.b}`
  }
})

// Start the agent's HTTP server
agent.start()

async function main() {
  // Example of using the agent to create a token (commented out for safety)
  /*
  const tokenCreation = await agent.process({
    messages: [
      {
        role: 'user',
        content: 'create a token called "OpenServToken" with symbol "OST" and initial supply of 1000000'
      }
    ]
  })

  console.log('Token Creation:', tokenCreation.choices[0].message.content)
  */
  
  console.log('Agent started successfully. You can now use the createToken capability to deploy tokens on Polygon Amoy.')
}

main().catch(console.error)
