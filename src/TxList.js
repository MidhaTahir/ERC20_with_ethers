import { ethers } from "ethers";

export default function TxList({ txs }) {
  if (txs.length === 0) return null;
  return (
    <>
      {txs.map((item, idx) => (
        <div key={idx}>
          <div>
            <p>From: {item.from}</p>
            <p>To: {item.to}</p>
            <p>Amount: {ethers.utils.formatEther(item.amount)} ETH</p>
          </div>
        </div>
      ))}
    </>
  );
}
