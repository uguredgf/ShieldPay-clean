import { Download } from "lucide-react";

const DEMO_CSV = `name,stellar_address,amount,department
Alex Rivera,GA3KQX9F8HJ7M2N5RBC4LP6WTY8VEK1JZ9XHFCSAQ7Z,5500,Engineering
Priya Sharma,GBHV4N2KP8LMRZ7Y3XCQE6JF1WAUDS9TB5HMVNXKZ7,4200,Product
Tomas Vega,GCD9KX2HFM3L7VWAY5ZQERTPN8JBSC1HUFCQAB7Z3X,3800,Marketing
Hana Ito,GDQ7XBF9JN4PRMWYK2VCAE6LZHST5UDB1HMFNXKQA3,4950,Engineering
Liam O'Brien,GE1XHF34ZBJK8NVRBC2PMQ5YLW7DSTAU9HMFCQNX3K,3150,Operations
Zara Mostafa,GFK3JH7M2N5RBC4LP6WTY8VEK1JZ9XHFCSAQ7ZGA8,6100,Finance
`;

export default function DemoCsvButton() {
  const handleDownload = () => {
    const blob = new Blob([DEMO_CSV], { type: "text/csv;charset=utf-8" });
    const url = URL.createObjectURL(blob);
    const anchor = document.createElement("a");
    anchor.href = url;
    anchor.download = "shieldpay_sample_payroll.csv";
    document.body.appendChild(anchor);
    anchor.click();
    document.body.removeChild(anchor);
    setTimeout(() => URL.revokeObjectURL(url), 500);
  };

  return (
    <button
      data-testid="download-demo-csv-btn"
      onClick={handleDownload}
      className="inline-flex items-center gap-2 rounded-full border border-[color:var(--line)] bg-white px-4 py-2 text-sm font-medium text-slate-700 shadow-soft transition hover:border-slate-300"
    >
      <Download className="h-4 w-4 text-[color:var(--brand)]" />
      Sample CSV
    </button>
  );
}
