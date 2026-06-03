# ShieldPay Presentation Outline

This outline is prepared for the provided slide template and is meant to make deck production faster.

## Core Message

ShieldPay makes private payroll understandable as a product experience.

It connects:

- payroll operations for employers
- private claiming for employees
- visible compliance controls for regulators

without forcing the audience to understand raw protocol details first.

## Recommended Slide Flow

### Slide 1 — Title

**ShieldPay**

Private payroll on Stellar with one shared workflow for employers, employees, and regulators.

### Slide 2 — Problem

Payroll privacy and compliance are usually in tension.

- employees do not want salary details exposed
- employers still need a manageable payroll workflow
- compliance teams still need visible policy controls and auditability

### Slide 3 — Our Thesis

Private payroll should feel like a usable product, not just a cryptography demo.

- privacy for salaries
- clarity for operators
- reviewability for compliance teams

### Slide 4 — Product Overview

ShieldPay is a role-based workspace with three connected views:

- Employer prepares the batch
- Employee claims privately
- Regulator verifies policy

### Slide 5 — Employer Flow

What the employer can do:

- import payroll CSV
- review employee rows and totals
- prepare proof-backed distribution
- distribute employee secrets

Suggested screenshot:

- employer overview + batch intake + proof status

### Slide 6 — Employee Flow

What the employee can do:

- enter a short employee secret
- validate claim readiness
- view protected withdrawal details
- complete the withdrawal flow

Suggested screenshot:

- employee secret entry + withdrawal state

### Slide 7 — Regulator Flow

What the regulator can do:

- allow or block addresses
- track audit events
- export compliance history

Suggested screenshot:

- regulator timeline + allow/block actions

### Slide 8 — Why Stellar

Why this belongs on Stellar:

- testnet-ready wallet flow
- payments-oriented ecosystem
- good fit for regulated financial product experiments
- extensible path toward on-chain policy and proof integrations

### Slide 9 — UX Differentiation

What makes ShieldPay memorable:

- bright, premium, customer-facing interface
- role-aware experience instead of one generic dashboard
- interactive widgets and motion with product purpose
- a full lifecycle shown in one product story

### Slide 10 — Current State

What is already working:

- customer-facing homepage
- employer / employee / regulator flows
- role switching and lifecycle navigation
- exportable compliance timeline

### Slide 11 — What Comes Next

Near-term improvements:

- stronger production-grade on-chain submission path
- clearer live vs fallback state handling
- deeper proof verification integration
- polished GitHub repository and public demo materials

### Slide 12 — Closing

ShieldPay shows how private payroll can be:

- easier to explain
- easier to demo
- easier to trust

## Presenter Notes

### Opening

Start with the product problem, not the cryptography.

Say:

"We wanted private payroll to feel like a real operational product, not a protocol prototype."

### Demo Order

Use this live sequence:

1. Employer
2. Employee
3. Regulator

That order is the clearest for the audience.

### What To Avoid Saying

- avoid starting with low-level proof jargon
- avoid calling the interface a "demo" too early
- avoid over-explaining fallback internals unless asked

### If Asked About Technical Depth

Shift from UX to architecture:

- employee-specific secrets
- protected commitments
- Stellar testnet wallet integration
- policy controls and audit logging

## Asset Checklist

Before building the deck, collect:

- homepage hero screenshot
- employer screen screenshot
- employee claim screen screenshot
- regulator timeline screenshot
- optional architecture diagram

## Best One-Line Pitch

ShieldPay turns private payroll on Stellar into a product experience that employers can run, employees can trust, and regulators can review.
