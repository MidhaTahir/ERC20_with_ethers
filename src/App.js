import { useState, useEffect } from "react";
import { Contract, providers, ethers } from "ethers";
import Token20Abi from "./contractsData/TOKEN20.json";
import TOKEN20Address from "./contractsData/TOKEN20-address.json";
import "./App.css";

function App() {
  const [txs, setTxs] = useState([]);
  const [contractListened, setContractListened] = useState();
  const [isWalletInstalled, setIsWalletInstalled] = useState(false);
  const [account, setAccount] = useState(null);
  const [contractInfo, setContractInfo] = useState({
    address: "",
    tokenName: "",
    tokenSymbol: "",
    totalSupply: "",
  });
  const [balanceInfo, setBalanceInfo] = useState({
    address: "",
    balance: "",
  });

  //for wallet connection
  useEffect(() => {
    if (window.ethereum) {
      setIsWalletInstalled(true);
    }
  }, []);

  async function connectWallet() {
    window.ethereum
      .request({
        method: "eth_requestAccounts",
      })
      .then((accounts) => {
        setAccount(accounts[0]);
      })
      .catch((error) => {
        alert("Something went wrong");
      });
  }

  //to get contract details
  const handleSubmit = async (e) => {
    e.preventDefault();
    const data = new FormData(e.target);
    const provider = new ethers.providers.Web3Provider(window.ethereum);

    const filledContractAddress = data.get("address");

    const erc20 = new ethers.Contract(
      filledContractAddress,
      Token20Abi.abi,
      provider
    );

    const tokenName = await erc20.name();
    const tokenSymbol = await erc20.symbol();
    const totalSupply = await erc20.totalSupply();

    setContractInfo({
      address: filledContractAddress,
      tokenName,
      tokenSymbol,
      totalSupply,
    });
  };

  //get balance info
  const getBalance = async () => {
    const provider = new ethers.providers.Web3Provider(window.ethereum);
    await provider.send("eth_requestAccounts", []);
    const erc20 = new ethers.Contract(
      contractInfo.address,
      Token20Abi.abi,
      provider
    );

    const signer = provider.getSigner();
    const signerAddress = await signer.getAddress(); // to confirm (it's same as address then why we reqd it separately)
    const balance = await erc20.balanceOf(signerAddress);
    setBalanceInfo({
      address: signerAddress,
      balance: ethers.utils.formatEther(String(balance)),
    });
  };

  //transfer method implementation
  useEffect(() => {
    if (contractInfo.address !== "-") {
      const provider = new ethers.providers.Web3Provider(window.ethereum);
      const erc20 = new ethers.Contract(
        contractInfo.address,
        Token20Abi.abi,
        provider
      );

      erc20.on("Transfer", (from, to, amount, event) => {
        // console.log({ from, to, amount, event });
        setTxs((currentTxs) => [
          ...currentTxs,
          {
            txHash: event.transactionHash,
            from,
            to,
            amount: String(amount),
          },
        ]);
        setContractListened(erc20);
        return () => {
          contractListened.removeAllListeners();
        };
      });
    }
  }, [contractInfo.address]);

  const handleTransfer = async (e) => {
    e.preventDefault();
    const data = new FormData(e.target);
    const provider = new ethers.providers.Web3Provider(window.ethereum);
    await provider.send("eth_requestAccounts", []);
    const signer = provider.getSigner();
    const erc20 = new ethers.Contract(
      contractInfo.address,
      Token20Abi.abi,
      signer
    );
    await erc20.transfer(
      data.get("recipient"),
      ethers.utils.parseEther(data.get("amount"))
    );
  };

  const handleTransferFrom = async (e) => {
    e.preventDefault();
    const data = new FormData(e.target);
    const provider = new ethers.providers.Web3Provider(window.ethereum);
    await provider.send("eth_requestAccounts", []);
    const signer = provider.getSigner();
    const erc20 = new ethers.Contract(
      contractInfo.address,
      Token20Abi.abi,
      signer
    );

    let options = {
      gasLimit: 60000,
      gasPrice: ethers.utils.parseUnits("100", "gwei"),
    };

    // address spender, uint256 amount
    await erc20.approve(account, ethers.utils.parseEther(data.get("amount-2")));

    await erc20.transferFrom(
      account,
      data.get("recipient-2"),
      ethers.utils.parseEther(data.get("amount-2")),
      options
    );
  };

  if (account === null) {
    return (
      <div className="App">
        {/* if metamask is installed but not connection */}
        {isWalletInstalled ? (
          <button onClick={connectWallet}>Connect Wallet</button>
        ) : (
          // if metamask is not installed
          <p>Install Metamask wallet</p>
        )}
      </div>
    );
  }

  return (
    <div className="App">
      {/* metamask is installed and connected */}
      <p>Connected as: {account}</p>

      {/* Get contract details section */}
      <form onSubmit={handleSubmit}>
        <div>
          <input
            type="text"
            name="address"
            placeholder="Enter ERC20 contract address"
          />
        </div>
        <button
          type="submit"
          className="btn btn-primary submit-button focus:ring focus:outline-none w-full"
        >
          Get token info
        </button>
      </form>
      <div>
        <table>
          <thead>
            <tr>
              <th>Name</th>
              <th>Symbol</th>
              <th>Total supply</th>
            </tr>
          </thead>
          <tbody>
            <tr>
              <th>{contractInfo.tokenName}</th>
              <td>{contractInfo.tokenSymbol}</td>
              <td>{String(contractInfo.totalSupply)}</td>
            </tr>
          </tbody>
        </table>
      </div>

      {/* Get My Balance Section */}
      <div className="p-4">
        <button onClick={getBalance} type="submit">
          Get my balance
        </button>
      </div>
      <div className="overflow-x-auto">
        <table className="table w-full">
          <thead>
            <tr>
              <th>Address</th>
              <th>Balance</th>
            </tr>
          </thead>
          <tbody>
            <tr>
              <th>{balanceInfo.address}</th>
              <td>{balanceInfo.balance} ETH</td>
            </tr>
          </tbody>
        </table>
      </div>

      <div>
        <h1>Transfer</h1>
        <form onSubmit={handleTransfer}>
          <div>
            <input
              type="text"
              name="recipient"
              placeholder="Recipient address"
            />
          </div>
          <div>
            <input type="text" name="amount" placeholder="Amount to transfer" />
          </div>
          <footer>
            <button type="submit">Transfer</button>
          </footer>
        </form>
      </div>

      <div>
        <h1>Transfer From</h1>
        <form onSubmit={handleTransferFrom}>
          {/* <div>
            <input type="text" name="trader" placeholder="Trader address" />
          </div> */}
          <div>
            <input
              type="text"
              name="recipient-2"
              placeholder="Recipient address"
            />
          </div>
          <div>
            <input
              type="text"
              name="amount-2"
              placeholder="Amount to transfer"
            />
          </div>
          <footer>
            <button type="submit">Transfer</button>
          </footer>
        </form>
      </div>
    </div>
  );
}

export default App;
