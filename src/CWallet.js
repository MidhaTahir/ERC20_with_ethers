import { useState, useEffect } from "react";
import { ethers } from "ethers";
import Jazzicon, { jsNumberForAddress } from "react-jazzicon";
import { Tab, Tabs } from "react-bootstrap";
import { NonceManager } from "@ethersproject/experimental";
import Token20Abi from "./contractsData/TOKEN20.json";
// import TOKEN20Address from "./contractsData/TOKEN20-address.json";
import TxList from "./TxList";
import "./App.css";

let options = {
  gasLimit: 60000,
  gasPrice: ethers.utils.parseUnits("100", "gwei"),
};

function CWallet() {
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
    if (contractInfo.address !== "") {
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
    const managedSigner = new NonceManager(signer);
    // console.log(managedSigner);
    console.log(signer);
    const erc20 = new ethers.Contract(
      contractInfo.address,
      Token20Abi.abi,
      managedSigner
    );
    await erc20.transfer(
      data.get("recipient"),
      ethers.utils.parseEther(data.get("amount")),
      options
    );
  };

  const handleTransferFrom = async (e) => {
    e.preventDefault();
    const data = new FormData(e.target);
    const provider = new ethers.providers.Web3Provider(window.ethereum);
    await provider.send("eth_requestAccounts", []);
    const signer = provider.getSigner();
    const managedSigner = new NonceManager(signer);
    const erc20 = new ethers.Contract(
      contractInfo.address,
      Token20Abi.abi,
      managedSigner
    );

    const signerAddress = await signer.getAddress();
    // address spender, uint256 amount
    await erc20.approve(
      signerAddress,
      ethers.utils.parseEther(data.get("amount-2"))
    );

    await erc20.transferFrom(
      signerAddress,
      data.get("recipient-2"),
      ethers.utils.parseEther(data.get("amount-2")),
      options
    );
  };

  if (account === null) {
    return (
      <div className="centre-screen">
        {/* if metamask is installed but not connection */}
        {isWalletInstalled ? (
          <div className="card border-light mb-3">
            <div className="card-header">Connect your wallet</div>
            <div className="card-body">
              <p className="card-title mb-3">
                To begin, please connect your MetaMask wallet.
              </p>
              <button onClick={connectWallet} className="btn btn-secondary">
                Connect Wallet
              </button>
            </div>
          </div>
        ) : (
          // if metamask is not installed (see why not working)
          <div className="card border-light mb-3">
            <div className="card-header">You need to Install a Wallet</div>
            <div className="card-body">
              <p className="card-title mb-3">We recommend Metamask wallet</p>
              <p className="card-text"></p>
              <a
                href="https://chrome.google.com/webstore/detail/metamask/nkbihfbeogaeaoehlefnkodbefgpgknn"
                className="btn btn-secondary"
              >
                Install Metamask wallet
              </a>
            </div>
          </div>
        )}
      </div>
    );
  }

  return (
    <div>
      {/* metamask is installed and connected */}

      <div className="mt-3 alert alert-dismissible alert-success">
        <strong>Well done!</strong> You've successfully connected your wallet{" "}
        <div>
          <p>
            Connected as:{" "}
            <Jazzicon diameter={20} seed={jsNumberForAddress(account)} />
            {account}
          </p>
        </div>
      </div>

      {/* Get contract details section */}
      <div className="card border-light mb-3">
        <div className="card-header">Contract Details</div>
        <div className="card-body">
          <form onSubmit={handleSubmit}>
            <div className="row align-items-center">
              <input
                type="text"
                name="address"
                placeholder="Enter ERC20 contract address"
                className="col form-control"
              />

              <button type="submit" className="col-4 btn btn-primary my-2">
                Get token info
              </button>
            </div>
          </form>
          <div>
            <table className="table table-hover">
              <thead>
                <tr className="table-dark">
                  <th>Name</th>
                  <th>Symbol</th>
                  <th>Total supply</th>
                </tr>
              </thead>
              <tbody>
                <tr className="table-secondary">
                  <th>{contractInfo.tokenName}</th>
                  <td>{contractInfo.tokenSymbol}</td>
                  <td>{String(contractInfo.totalSupply)}</td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>
      </div>

      {/* Get My Balance Section */}
      <div className="card border-light mb-3">
        <div className="card-header">Balance Details</div>
        <div className="card-body">
          <button
            onClick={getBalance}
            type="submit"
            className="w-100 mb-2 btn btn-primary"
          >
            Get my balance
          </button>

          <div>
            <table className="table table-hover">
              <thead>
                <tr className="table-dark">
                  <th>Address</th>
                  <th>Balance</th>
                </tr>
              </thead>
              <tbody>
                <tr className="table-secondary">
                  <th>{balanceInfo.address}</th>
                  <td>{balanceInfo.balance && `${balanceInfo.balance}ETH`}</td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>
      </div>

      <Tabs
        defaultActiveKey="transfer"
        id="uncontrolled-tab-example"
        className="mb-3"
      >
        <Tab eventKey="transfer" title="Transfer">
          <div>
            <h1>Transfer</h1>
            <form onSubmit={handleTransfer}>
              <div>
                <input
                  type="text"
                  name="recipient"
                  placeholder="Recipient address"
                  className="form-control"
                />
              </div>
              <div>
                <input
                  type="text"
                  name="amount"
                  placeholder="Amount to transfer"
                  className="form-control"
                />
              </div>
              <footer>
                <button type="submit" className="mt-2 btn btn-primary">
                  Transfer
                </button>
              </footer>
            </form>
          </div>
        </Tab>
        <Tab eventKey="transferFrom" title="TransferFrom">
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
                  className="form-control"
                />
              </div>
              <div>
                <input
                  type="text"
                  name="amount-2"
                  placeholder="Amount to transfer"
                  className="form-control"
                />
              </div>
              <footer>
                <button type="submit" className="mt-2 btn btn-primary">
                  Transfer
                </button>
              </footer>
            </form>
          </div>
        </Tab>
      </Tabs>

      <div className="mt-2">
        <h1>Recent transactions</h1>
        <TxList txs={txs} />
      </div>
    </div>
  );
}

export default CWallet;
