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
        {accountRinaTokenBalance !== null && <div>
          <span className='font-bold'>RT Balance: </span>  
          <span>{accountRinaTokenBalance}</span>  
        </div>}
        <input type="number" className="border border-slate-600" value={buyAmount} onChange={e => setBuyAmount(e.target.value)}/>
        <button onClick={async () => await buyTokens()} className="h-10 w-36 px-2 rounded-2xl bg-blue-400 text-white font-semibold mt-5">Buy</button>
      </div>
    </div>
  );
}

export default App;
