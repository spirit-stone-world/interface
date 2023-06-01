import './App.css';
import { useState, useEffect } from "react"
import { connect } from "get-starknet"
import contractAbi from "./abis/spirit_stone"
import { Contract } from "starknet"

const contractAddress = "0x02d04cb0baacbc24f32534da4516e0cb4e47e9bb696a2f0b4ba01338878de064"

function App() {
  const [provider, setProvider] = useState('')
  const [address, setAddress] = useState('')
  const [availableMintCount, setAvailableMintCount] = useState(0)
  const [blockReward, setBlockReward] = useState(0)
  const [totalSupply, setTotalSupply] = useState(0)
  const [mintCount, setMintCount] = useState(0)
  const [isConnected, setIsConnected] = useState(false)

  // Create interval on component mount and clear on component unmount
  useEffect(() => {
    if (!provider) return;  // If `provider` is not set, do nothing
    updateTokenInfo();
    const interval = setInterval(() => {
      updateTokenInfo();
    }, 10000);  // Updates every 10 seconds

    return () => {
      clearInterval(interval);
    };
  }, [provider]);  // Only re-run effect if `provider` changes

  const connectWallet = async() => {
    try{
      // allows a user to pick a wallet on button click
      const starknet = await connect()
      // connect to the wallet
      await starknet?.enable({ starknetVersion: "v4" })
      // set account provider to provider state
      setProvider(starknet.account)
      // set user address to address state
      setAddress(starknet.selectedAddress)
      // set connection status
      setIsConnected(true) 
    }
    catch(error){
      alert(error.message)
    }
  }

  const mint = async() => {
    try{
      // initialize contract using abi, address and provider
      const contract = new Contract(contractAbi, contractAddress, provider)
      // make contract call
      await contract.mint()
      alert("You've send transaction to network, please wait for confirmation")
   }
   catch(error){
      console.log(error)
      alert(error.message)
   } 
  }

  const updateTokenInfo = async () => {
    try {
      // initialize contract using abi, address and provider
      const contract = new Contract(contractAbi, contractAddress, provider)
      const decimal = (await contract.call('decimals'))[0]
      const factor = 10 ** decimal
      // make contract call
      const availableMintCount = await contract.call('available_mint_count')
      setAvailableMintCount(availableMintCount[0].toString())
      const blockReward = (await contract.call('block_reward'))[0] / factor
      setBlockReward(blockReward.toString())
      const totalSupply = (await contract.call('totalSupply')) / factor
      setTotalSupply(totalSupply.toString())
      const mintCount = await contract.call('mint_count')
      setMintCount(mintCount[0].toString())  
    }
    catch (error) {
      console.log(error)
      alert(error.message)
    }
  }

  return (
    <div className="App">
      <header className="App-header">
        <main className="main">
          <h1 className="title">
            <a href="https://spiritstone.world"> Spirit Stone</a>  {/* Use actual link */}
          </h1>
          {
            isConnected ?
              <button className="connect">{address.slice(0, 5)}...{address.slice(60)}</button> :
              <button className="connect" onClick={() => connectWallet()}>Connect wallet</button>
          }

          <div className="description">
            <p>Spirit Stone is an ERC-20 contract in Starknet, it features the following characteristics:</p>
            <ul>
              <li>There is no initial allocation, all tokens are generated through minting.</li>
              <li>Anyone can call the mint function of the contract.</li>
              <li>A block can be minted every 50 seconds.</li>
              <li>The reward for each block is fixed and will be halved after every 400,000 blocks.</li>
              <li>Minting will stop when the total number of tokens reaches 8,000,000,000.</li>
            </ul>
          </div>

          <div className="grid">
            <div className="card">
              <h2>Mint Your Free Tokens Now</h2>
              <div className="cardForm">
                <input type="submit" className="button" value="Mint" onClick={() => mint()} />
              </div>

              <hr />

              <h2>Token Stats:</h2>
              <p>Available Mint Count: {availableMintCount}</p>
              <p>Block Reward: {blockReward}</p>
              <p>Total Supply: {totalSupply}</p>
              <p>Mint Count: {mintCount}</p>

            </div>
          </div>
        </main>
      </header>
      <footer className="footer">
        <a href="https://github.com/spirit-stone-world/token-core" target="_blank" rel="noopener noreferrer">GitHub</a>
      </footer>
    </div>
  );
}

export default App;
