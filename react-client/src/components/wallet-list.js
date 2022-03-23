const WalletList = ({ onClick }) => {
    const options = [
        {
            title: 'MetaMask',
            logo: 'https://app.uniswap.org/static/media/metamask.02e3ec27.png'
        },
        {
            title: 'WalletConnect',
            logo: 'https://app.uniswap.org/static/media/walletConnectIcon.304e3277.svg'
        },
        {
            title: 'Coinbase Wallet',
            logo: 'https://app.uniswap.org/static/media/coinbaseWalletIcon.a3a7d7fd.svg'
        }
    ]

    return (
        <div className="">
            {options.map(o =>
            (
                <button key={o.title} onClick={onClick} className="h-16 w-96 px-5 rounded-2xl bg-slate-500 flex justify-between items-center mt-2">
                    <span className="font-bold text-xl text-white">{o.title}</span>
                    <img src={o.logo} alt={`logo for ${o.title}`} className="w-10" />
                </button>
            )
            )}
        </div>
    );
}

export default WalletList;