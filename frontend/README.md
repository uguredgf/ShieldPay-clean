# ShieldPay Frontend

This folder contains the customer-facing React application for ShieldPay.

## Main Views

- `Employer` — prepare payroll batches and distribute employee secrets
- `Employee` — validate a secret and continue the claim flow
- `Regulator` — manage policy actions and review the audit timeline

## Tech

- React
- CRACO
- Framer Motion
- Stellar SDK
- Freighter integration

## Scripts

### Start development server

```bash
npm start
```

### Create production build

```bash
npm run build
```

### Run tests

```bash
npm test
```

## Notes

- The UI is designed for Stellar Testnet flows.
- Some flows can continue with local fallback behavior when a full on-chain route is unavailable.
