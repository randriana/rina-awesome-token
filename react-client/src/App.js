import logo from './logo.svg';
import './App.css';
import { ethers } from 'ethers';
import { useEffect, useState } from 'react';
import { TokenAbi, CrowdsaleAbi } from './abis';
import AWEC from './assets/awesome-coin-logo.png';
import LOGO from './assets/AWESOME_COIN.png';
import WalletList from './components/wallet-list';
import ConfirmationModal from './components/confirmation-modal';
import SubmittedModal from './components/submitted-modal';

const provider = new ethers.providers.Web3Provider(window.ethereum)

const RinaTokenAddress = '0x5fbdb2315678afecb367f032d93f642f64180aa3';
const TokenSaleAddress = '0xe7f1725e7734ce288f8367e1bb143e90bb3f0512';

function App() {
  const [signer, setSigner] = useState(null);
  const [accountBalance, setAccountBalance] = useState(null);
  const [accountRinaTokenBalance, setAccountRinaTokenBalance] = useState(null);
  const [signerAddress, setSignerAddress] = useState(null);
  const [rinaToken, setRinaToken] = useState(null);
  const [tokenSale, setTokenSale] = useState(null);
  const [buyAmount, setBuyAmount] = useState(0);
  const [connected, setConnected] = useState(false);
  const [successModal, setSuccessModal] = useState(false);
  const [submittedModal, setSubmittedModal] = useState(false);
  const [rate, setRate] = useState(null);

  useEffect(() => {
    const token = new ethers.Contract(RinaTokenAddress, TokenAbi, provider);
    setRinaToken(token);
  }, []);

  const onConnectWallet = async () => {
    await provider.send("eth_requestAccounts", [])
    const s = provider.getSigner();
    const address = await s.getAddress();
    setSignerAddress(address);
    setSigner(s);
    await getAccountBalance(address);
    await getAccountRinaTokenBalance(address);

    const ts = new ethers.Contract(TokenSaleAddress, CrowdsaleAbi, s);
    setTokenSale(ts);

    const r = await ts.getRate();
    setRate(ethers.utils.formatEther(r));

    setConnected(true);
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
    
    setSubmittedModal(true);
    await tx.wait();
    console.log('hahah')

    await getAccountBalance(signerAddress);
    await getAccountRinaTokenBalance(signerAddress);

    setSuccessModal(true);
  }

  const addToMetaMask = async () => {
    await window.ethereum.request({
      method: 'wallet_watchAsset',
      params: {
        type: 'ERC20', // Initially only supports ERC20, but eventually more!
        options: {
          address: RinaTokenAddress, // The address that the token is at.
          symbol: 'RISC', // A ticker symbol or shorthand, up to 5 chars.
          decimals: 18, // The number of decimals in the token
          image: 'data:image/png;base64,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', // A string url of the token logo
        },
      },
    });
  }


  const formattedAddress = (addr) => {
    if (addr === null) return '';
    const formatted = addr.slice().split('');
    formatted.splice(6, 32, '...');
    return formatted.join('');
  };

  const onChangeAmount = (v) => {
    setBuyAmount(v);
  }

  return (
    <div className="flex flex-col justify-center h-full items-center bg-gradient-to-r from-silverfox to-whiteish">
      <div className="mb-24">
        <img src={LOGO} className='w-80' alt="" />
      </div>
      <div className='flex flex-col rounded-2xl border-2 border-stone-700 p-3'>
        <div>
          {!connected ? <WalletList onClick={onConnectWallet} /> :
            (
              <><div className='flex'>
                <span className='mr-7 font-bold flex items-center'>{formattedAddress(signerAddress)}</span>
                <div className='flex items-center border-2 border-stone-600 rounded-lg px-2 py-1'>
                  <img src="https://upload.wikimedia.org/wikipedia/commons/thumb/0/05/Ethereum_logo_2014.svg/628px-Ethereum_logo_2014.svg.png" className='w-3 mr-1' />
                  <span className=''>
                    {accountBalance} ETH
                  </span>
                </div>
                <button onClick={addToMetaMask} className='flex items-center border-2 border-stone-600 rounded-lg px-2 py-1 ml-2 hover:bg-slate-200'>
                  <img src={AWEC} className='w-4 mr-1' />
                  <span className=''>
                    {accountRinaTokenBalance} RISC
                  </span>
                </button>
              </div>
                <div className='pt-3'>
                  <div>
                    <div className='flex justify-between px-4 w-full border-2 border-stone-500 rounded-2xl h-12 bg-white relative'>
                      <input type="text" className='relative rounded-2xl appearance-none outline-0 text-2xl' onChange={e => onChangeAmount(e.target.value)} value={buyAmount} />
                      <span className='flex items-center font-semibold text-2xl text-stone-800'>ETH</span>
                    </div>
                    {buyAmount > 0 && <span className='pl-2 text-sm font-bold'>= {rate*buyAmount} RISC</span>} 
                  </div>                  
                  <button onClick={async () => await buyTokens()} className="h-10 w-36 px-2 rounded-2xl text-white bg-persimmon border-2 font-bold mt-5">BUY</button>
                </div></>
            )}
        </div>
      </div>
      <ConfirmationModal tokenBalance={accountRinaTokenBalance} isOpen={successModal && !submittedModal} closeModal={() => setSuccessModal(false)} />
      <SubmittedModal isOpen={submittedModal} closeModal={() => setSubmittedModal(false)}/>
    </div>
  );
}

export default App;