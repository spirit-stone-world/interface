import './App.css';
import { useState, useEffect } from "react"
import { connect, disconnect } from "get-starknet"
import contractAbi from "./abis/spirit_stone"
import claimAbi from "./abis/whitelist"
import { Contract } from "starknet"

const contractAddress = "0x06182278e63816ff4080ed07d668f991df6773fd13db0ea10971096033411b11"
const claimAddress = "0x00630eb5544172af8716956ff6b8f382b17b8d67f11bf1d8e9e7c8e10e31a2ac"

function App() {
  const [provider, setProvider] = useState('')
  const [address, setAddress] = useState('')
  const [availableMintCount, setAvailableMintCount] = useState(0)
  const [blockReward, setBlockReward] = useState(0)
  const [totalSupply, setTotalSupply] = useState(0)
  const [mintCount, setMintCount] = useState(0)
  const [claimCount, setClaimCount] = useState(0)
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
      console.log('connect wallet')
      // allows a user to pick a wallet on button click
      const starknet = await connect({modalMode: 'alwaysAsk', modalTheme: 'dark'})
      // connect to the wallet
      await starknet?.enable({ starknetVersion: "v4" })
      // check if mainnet
      if (starknet.provider.chainId !== '0x534e5f4d41494e') {
        alert('You connect with wrong network, please swith to mainnet and connect again')
        disconnectWallet()
        return
      }
      // set account provider to provider state
      setProvider(starknet.account)
      // set user address to address state
      setAddress(starknet.selectedAddress)
      // set connection status
      setIsConnected(true) 
    }
    catch(error){
      alert(error.message)
      console.log(error)
    }
  }

  const disconnectWallet = async() => {
    try {
      console.log('disconnect wallet')
      await disconnect()
      setProvider(null)
      // set user address to address state
      setAddress('')
      // set connection status
      setIsConnected(false) 
    } catch(error) {
      console.log(error)
    }
  }

  const apply_mint = async() => {
    try{
      if (isConnected == false) {
        alert("not connect wallet yet")
        return
      }
      // initialize contract using abi, address and provider
      const contract = new Contract(contractAbi, contractAddress, provider)
      // make contract call
      await contract.apply_mint()
      alert("You've send transaction to network, please wait for confirmation")
   }
   catch(error){
      console.log(error)
      alert(error.message)
   } 
  }

  const setTokenAddress = async() => {
    try{
      if (isConnected == false) {
        alert("not connect wallet yet")
        return
      }
      // initialize contract using abi, address and provider
      const contract = new Contract(claimAbi, claimAddress, provider)
      // make contract call
      await contract.set_token_address(claimAddress)
      alert("You've send transaction to network, please wait for confirmation")
   }
   catch(error){
      console.log(error)
      alert(error.message)
   } 
  }

  const claim = async() => {
    try{
      if (isConnected == false) {
        alert("not connect wallet yet")
        return
      }
      // initialize contract using abi, address and provider
      const contract = new Contract(claimAbi, claimAddress, provider)
      // make contract call
      await contract.claim()
      alert("You've send transaction to network, please wait for confirmation")
   }
   catch(error){
      console.log(error)
      alert(error.message)
   } 
  }

  const updateClaimInfo = async (factor) => {
    try {
      const contract = new Contract(claimAbi, claimAddress, provider)
      const value = await contract.call('airdrop_amount', [address, ])
      setClaimCount((value / factor).toString())
    } catch (error) {
      console.log(error)
      //alert(error.message)
    }
  }

  const updateTokenInfo = async () => {
    try {
      // initialize contract using abi, address and provider
      const contract = new Contract(contractAbi, contractAddress, provider)
      //const decimal = (await contract.call('decimals'))[0]
      const factor = BigInt(10 ** 18)
      // make contract call
      const availableMintCount = await contract.call('available_mint_count')
      setAvailableMintCount(availableMintCount.toString())
      const blockReward = (await contract.call('block_reward')) / factor
      setBlockReward(blockReward.toString())
      const totalSupply = (await contract.call('totalSupply')) / factor
      setTotalSupply(totalSupply.toString())
      const mintCount = await contract.call('mint_count')
      setMintCount(mintCount.toString())  

      await updateClaimInfo(factor)
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
          <div className="header-content">
            <div className="logo-title">
              <h1 className="title">
                <a> Spirit Stone V2</a>
              </h1>
            </div>
            {
              isConnected ?
                <button className="connect" onClick={() => disconnectWallet()}>{address.slice(0, 5)}...{address.slice(60)}</button> :
                <button className="connect" onClick={() => connectWallet()}>Connect Wallet</button>
            }
          </div>
          <img src="spirit_stone.jpg" className="logo" /> 

          <div className="description">
            <p>Spirit Stone is an ERC-20 contract in Starknet, it features the following characteristics:</p>
            <ul>
              <li>There is no initial allocation, all tokens are generated through minting.</li>
              <li>Anyone can call the apply_mint function of the contract for free.</li>
              <li>A mint can be available every 50 seconds.</li>
              <li>The reward for each mint is fixed and will be halved after every 400,000 mints.</li>
              <li>Minting will stop when the total number of tokens reaches 8,000,000,000.</li>
            </ul>
          </div>

          <div className="grid">
            <div className="card">
              <h2>Mint Your Free Tokens Now</h2>
              <div className="cardForm">
                <input type="submit" className="button" value="Apply Mint" onClick={() => apply_mint()} />
              </div>

              <hr />

              <h2>Token Stats:</h2>
              <p>Contract Address:&nbsp;
                <a href={`https://starkscan.co/contract/${contractAddress}`} target="_blank" rel="noopener noreferrer">
                  {contractAddress.slice(0, 5)}...{contractAddress.slice(60)}
                </a>
              </p>
              <p>Available Mint Count: {availableMintCount}</p>
              <p>Mint Reward: {blockReward}</p>
              <p>Total Supply: {totalSupply}</p>
              <p>Mint Count: {mintCount}</p>

              <hr />
              <h2> Token Claim:</h2>
              <p>Can Claim: {claimCount}</p>
              <div className="cardForm">
                <input type="submit" className="button" value="Claim" onClick={() => claim()} />
              </div>

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
