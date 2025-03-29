import { z } from 'zod'
import { Agent } from '@openserv-labs/sdk'
import 'dotenv/config'
import { exec } from 'child_process'
import { promisify } from 'util'
import * as fs from 'fs'

const execPromise = promisify(exec)

// Create a function to handle token creation
async function createTokenImpl(args: {
  tokenName: string;
  tokenSymbol: string;
  initialSupply: number;
  ownerAddress?: string;
}) {
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
    console.error('Error in createToken function:', error)
    return `Error creating token: ${error.message || String(error)}`
  }
}

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
    return createTokenImpl(args);
  }
})

// Add task handling capability
agent.addCapability({
  name: 'handleTask',
  description: 'Handles tasks with human assistance requests',
  schema: z.object({
    description: z.string().describe('Task description'),
    humanResponse: z.string().optional().describe('Human response to a question'),
    taskDetails: z.any().optional().describe('Any additional task details')
  }),
  async run({ args }) {
    try {
      console.log('Handling task:', args.description);
      
      // Parse human response if available
      if (args.humanResponse) {
        console.log('Human response received:', args.humanResponse);
        
        // Extract token details from human response
        const lines = args.humanResponse.split('\n');
        let tokenName = '';
        let tokenSymbol = '';
        let initialSupply = 0;
        let ownerAddress = '';
        
        for (const line of lines) {
          if (line.toLowerCase().includes('token name')) {
            tokenName = line.split(':')[1]?.trim() || '';
          } else if (line.toLowerCase().includes('token symbol')) {
            tokenSymbol = line.split(':')[1]?.trim() || '';
          } else if (line.toLowerCase().includes('total supply') || line.toLowerCase().includes('initial supply')) {
            const supplyText = line.split(':')[1]?.trim() || '';
            // Convert text like "1 billion" to a number
            if (supplyText.toLowerCase().includes('billion')) {
              initialSupply = 1000000000;
            } else if (supplyText.toLowerCase().includes('million')) {
              initialSupply = 1000000;
            } else {
              // Try to parse as a number
              const parsedNumber = parseInt(supplyText.replace(/[^0-9]/g, ''));
              if (!isNaN(parsedNumber)) {
                initialSupply = parsedNumber;
              }
            }
          } else if (line.toLowerCase().includes('owner address')) {
            ownerAddress = line.split(':')[1]?.trim() || '';
          }
        }
        
        // Create token with extracted details
        if (tokenName && tokenSymbol && initialSupply > 0) {
          const createTokenArgs = {
            tokenName,
            tokenSymbol,
            initialSupply,
            ownerAddress: ownerAddress || undefined
          };
          
          console.log('Creating token with args:', createTokenArgs);
          
          // Use the createToken implementation directly
          return await createTokenImpl(createTokenArgs);
        } else {
          return 'Error: Could not extract all required token details from the human response.';
        }
      }
      
      // If no human response yet, return a message asking for token details
      return 'Please provide the token details: Token Name, Token Symbol, Total Supply, and Owner Address (optional).';
    } catch (error: any) {
      console.error('Error in handleTask capability:', error);
      return `Error handling task: ${error.message || String(error)}`;
    }
  }
})

// Add a capability to handle the specific task structure from the error
agent.addCapability({
  name: 'processTask',
  description: 'Process a task with human assistance requests in the format from the error',
  schema: z.object({
    task: z.object({
      description: z.string().optional(),
      humanAssistanceRequests: z.array(
        z.object({
          question: z.any(), // Accept any type for question to avoid the error
          humanResponse: z.string().optional()
        })
      ).optional()
    }).optional()
  }),
  async run({ args }) {
    try {
      console.log('Processing task with complex structure');
      
      // Extract the task description
      const taskDescription = args.task?.description || 'Token creation task';
      
      // Extract human response if available
      let humanResponse = '';
      if (args.task?.humanAssistanceRequests && args.task.humanAssistanceRequests.length > 0) {
        humanResponse = args.task.humanAssistanceRequests[0].humanResponse || '';
      }
      
      // Use the handleTask capability logic
      if (humanResponse) {
        // Extract token details from human response
        const lines = humanResponse.split('\n');
        let tokenName = '';
        let tokenSymbol = '';
        let initialSupply = 0;
        let ownerAddress = '';
        
        for (const line of lines) {
          if (line.toLowerCase().includes('token name')) {
            tokenName = line.split(':')[1]?.trim() || '';
          } else if (line.toLowerCase().includes('token symbol')) {
            tokenSymbol = line.split(':')[1]?.trim() || '';
          } else if (line.toLowerCase().includes('total supply') || line.toLowerCase().includes('initial supply')) {
            const supplyText = line.split(':')[1]?.trim() || '';
            // Convert text like "1 billion" to a number
            if (supplyText.toLowerCase().includes('billion')) {
              initialSupply = 1000000000;
            } else if (supplyText.toLowerCase().includes('million')) {
              initialSupply = 1000000;
            } else {
              // Try to parse as a number
              const parsedNumber = parseInt(supplyText.replace(/[^0-9]/g, ''));
              if (!isNaN(parsedNumber)) {
                initialSupply = parsedNumber;
              }
            }
          } else if (line.toLowerCase().includes('owner address')) {
            ownerAddress = line.split(':')[1]?.trim() || '';
          }
        }
        
        // Create token with extracted details
        if (tokenName && tokenSymbol && initialSupply > 0) {
          const createTokenArgs = {
            tokenName,
            tokenSymbol,
            initialSupply,
            ownerAddress: ownerAddress || undefined
          };
          
          console.log('Creating token with args:', createTokenArgs);
          
          // Use the createToken implementation directly
          return await createTokenImpl(createTokenArgs);
        } else {
          return 'Error: Could not extract all required token details from the human response.';
        }
      }
      
      // If no human response yet, return a message asking for token details
      return 'Please provide the token details: Token Name, Token Symbol, Total Supply, and Owner Address (optional).';
    } catch (error: any) {
      console.error('Error in processTask capability:', error);
      return `Error processing task: ${error.message || String(error)}`;
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
  console.log('Agent started successfully. You can now use the createToken capability to deploy tokens on Polygon Amoy.')
}

main().catch(console.error)
