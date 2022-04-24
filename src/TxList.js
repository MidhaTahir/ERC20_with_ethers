import { ethers } from "ethers";

export default function TxList({ txs }) {
  if (txs.length === 0) return null;
  return (
    <>
      {txs.map((item, idx) => (
        <div key={idx} className="py-2">
          <ul className="list-group list-group-flush">
            <li className="list-group-item">From: {item.from}</li>
            <li className="list-group-item">To: {item.to}</li>
            <li className="list-group-item">
              Amount: {ethers.utils.formatEther(item.amount)} ETH
            </li>
          </ul>
        </div>
      ))}
    </>
  );
}
