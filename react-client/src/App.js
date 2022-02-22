import logo from './logo.svg';
import './App.css';
import { ethers } from 'ethers';
import { useEffect, useState } from 'react';
import { TokenAbi, CrowdsaleAbi } from './abis';

const provider = new ethers.providers.Web3Provider(window.ethereum)

const RinaTokenAddress = '0x5FbDB2315678afecb367f032d93F642f64180aa3';
const TokenSaleAddress = '0xe7f1725E7734CE288F8367e1Bb143E90bb3F0512';

function App() {
  const [signer, setSigner] = useState(null);
  const [accountBalance, setAccountBalance] = useState(null);
  const [accountRinaTokenBalance, setAccountRinaTokenBalance] = useState(null);
  const [signerAddress, setSignerAddress] = useState(null);
  const [rinaToken, setRinaToken] = useState(null);
  const [tokenSale, setTokenSale] = useState(null);
  const [buyAmount, setBuyAmount] = useState(0);

  useEffect(() => {
    const token = new ethers.Contract(RinaTokenAddress, TokenAbi, provider);
    setRinaToken(token);
  }, []);

  const onConnectWallet = async () => {
    await provider.send("eth_requestAccounts", []);
    const s = provider.getSigner();
    const address = await s.getAddress();
    setSignerAddress(address);
    setSigner(s);
    await getAccountBalance(address);
    await getAccountRinaTokenBalance(address);

    const ts = new ethers.Contract(TokenSaleAddress, CrowdsaleAbi, s);
    setTokenSale(ts);
  }

  const getAccountBalance = async (accountNumber) => {
    const result = await provider.getBalance(accountNumber);
    setAccountBalance(parseFloat(ethers.utils.formatEther(result)).toFixed(4));
  }

  const getAccountRinaTokenBalance = async (accountNumber) => {
    const result = await rinaToken.balanceOf(accountNumber);
    setAccountRinaTokenBalance(ethers.utils.formatEther(result));
  }

  const buyTokens = async () => {
    const tx = await tokenSale.buyTokens(signerAddress, {
      value: ethers.utils.parseEther(buyAmount)
    });
    console.log('transaction sent', tx);
    console.log('waiting...');
    const res = await tx.wait();
    console.log('transaction receipt', res);
  }

  const addToMetaMask = async () => {
    const wasAdded = await window.ethereum.request({
      method: 'wallet_watchAsset',
      params: {
        type: 'ERC20', // Initially only supports ERC20, but eventually more!
        options: {
          address: RinaTokenAddress, // The address that the token is at.
          symbol: 'RAT', // A ticker symbol or shorthand, up to 5 chars.
          decimals: 18, // The number of decimals in the token
          image: 'data:image/png;base64,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', // A string url of the token logo
        },
      },
    });
  }

  return (
    <div className="flex justify-center h-full items-center">
      <div className="flex flex-col items-center">
        {true && <button onClick={async () => await onConnectWallet()} className="h-10 w-36 px-2 rounded-2xl bg-blue-400 text-white font-semibold mb-5">Connect wallet</button>}
        {accountBalance !== null && <div>
          <span className='font-bold'>Address: </span>  
          <span>{signerAddress}</span>  
        </div>}
        {accountBalance !== null && <div>
          <span className='font-bold'>ETH Balance: </span>  
          <span>{accountBalance}</span>  
        </div>}
        {accountRinaTokenBalance !== null && (
        <div className='flex flex-col items-center'>
          <span className='font-bold'>RT Balance: </span>  
          <span>{accountRinaTokenBalance}</span>
          <button onClick={async () => await addToMetaMask()} className="h-10 w-48 px-2 rounded-2xl bg-blue-400 text-white font-semibold mb-5">Add to MetaMask</button>  
        </div>)}
        <input type="number" className="border border-slate-600" value={buyAmount} onChange={e => setBuyAmount(e.target.value)}/>
        <button onClick={async () => await buyTokens()} className="h-10 w-36 px-2 rounded-2xl bg-blue-400 text-white font-semibold mt-5">Buy</button>
      </div>
    </div>
  );
}

export default App;
