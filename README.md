# ShieldPay

ShieldPay is a private payroll workspace built around three connected roles:

- `Employer` prepares a payroll batch and distributes employee secrets
- `Employee` claims funds with a short employee secret
- `Regulator` reviews policy actions and the audit trail

The project is currently positioned as a product demo for privacy-preserving payroll on Stellar Testnet, with a premium customer-facing interface and role-specific flows.

## Product Story

ShieldPay is designed to answer one simple product question:

`How can payroll stay private for employees while still remaining operationally clear for companies and reviewable for compliance teams?`

The current experience focuses on:

- private payroll batch preparation
- employee-specific claim access
- visible compliance controls
- a single shared lifecycle across all roles

## Demo Flow

### 1. Employer

- Upload or use a sample payroll CSV
- Review rows and totals
- Generate the protected payroll batch
- Reveal employee secrets for distribution

### 2. Employee

- Enter the employee secret
- Verify that the secret matches a saved payroll batch
- Open the withdrawal flow
- Complete the withdrawal or preview

### 3. Regulator

- Allow or block wallet addresses
- Review timeline entries
- Export the compliance timeline as JSON

## Repository Structure

```text
ShieldPay-clean/
├─ frontend/                   React application and UI flows
├─ contracts/
│  ├─ asp_contract/
│  ├─ pool_contract/
│  └─ verifier_contract/
├─ stellar-private-payments/   Privacy and protocol reference code
├─ PRESENTATION_OUTLINE.md
├─ README.md
└─ .gitignore
```

## Frontend Stack

- React
- CRACO / Create React App
- Framer Motion
- Lucide icons
- Stellar SDK
- Freighter wallet integration
- local persisted browser state for demo continuity

## Run Locally

### Prerequisites

- Node.js 18+
- npm
- Freighter wallet for the testnet-connected flows

### Install

```bash
cd frontend
npm install
```

### Start

```bash
npm start
```

### Build

```bash
npm run build
```

## Notes

- The UI is customer-facing and presentation-ready.
- Some blockchain interactions still use local fallback behavior when a full on-chain path is unavailable.
- The product currently targets `Stellar Testnet`.

## Suggested Demo Narrative

If you are presenting ShieldPay live, the cleanest order is:

1. Open the `Employer` view and load the payroll batch
2. Show the proof and secret distribution readiness
3. Switch to `Employee` and complete a claim with an employee secret
4. Switch to `Regulator` and show the policy timeline and export
