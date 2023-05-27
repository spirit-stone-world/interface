import './App.css';
import { useState, useEffect } from "react"
import { connect } from "get-starknet"
import contractAbi from "./abis/spirit_stone"
import { Contract } from "starknet"
import { feltToString } from './utils/utils'

const contractAddress = "0x02d04cb0baacbc24f32534da4516e0cb4e47e9bb696a2f0b4ba01338878de064"

function App() {
  const [provider, setProvider] = useState('')
  const [address, setAddress] = useState('')
  const [availableMintCount, setAvailableMintCount] = useState(0)
  const [blockReward, setBlockReward] = useState(0)
  const [totalSupply, setTotalSupply] = useState(0)
  const [mintCount, setMintCount] = useState(0)
  const [isConnected, setIsConnected] = useState(false)

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
            Starknet<a href="#"> Spirit Stone</a>
          </h1>
          {
            isConnected ? 
            <button className="connect">{address.slice(0, 5)}...{address.slice(60)}</button> :
            <button className="connect" onClick={() => connectWallet()}>Connect wallet</button>
          }

          <p className="description">
            This demo app demonstrates the use of starknet.js to interact with starknet contracts
          </p>

          <div className="grid">
            <div href="#" className="card">
              <h2>Ensure to connect to Mainnet! &rarr;</h2>
              <p>Input the address of receiver.</p>

              <div className="cardForm">
                <input type="submit" className="button" value="Mint" onClick={() => mint()} />
              </div>

              <hr />

              <p>Token contract infomation.</p>
              <div className="cardForm">
                <input type="submit" className="button" value="Refresh" onClick={() => updateTokenInfo()} />
              </div>
              <p>Available Mint Count: {availableMintCount}</p>
              <p>Block Reward: {blockReward}</p>
              <p>Total Supply: {totalSupply}</p>
              <p>Mint Count: {mintCount}</p>
            </div>
          </div>
        </main>
      </header>
    </div>
  );
}

export default App;
