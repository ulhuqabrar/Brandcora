[Introducing the Polar Startup Program](https://polar.sh/startup-program)

- Features
- Docs
- [Pricing](https://polar.sh/#pricing)
- [Blog](https://polar.sh/blog)
- [Company](https://polar.sh/company)

Sign in

Get Started

Toggle Sidebar

[Overview](https://polar.sh/) [Documentation](https://polar.sh/docs) [Pricing](https://polar.sh/#pricing) [Blog](https://polar.sh/blog) [Company](https://polar.sh/company) [Open Source](https://github.com/polarsource) [Polar on X](https://x.com/polar_sh)

[Login](https://polar.sh/#)

# Turn Usage  Into Revenue

A billing platform for the intelligence era

Get Started

[Speakeasy Logo\\
\\
Speakeasy Logo](https://speakeasy.com/) [Speakeasy Logo\\
\\
Speakeasy Logo](https://speakeasy.com/)

[Speakeasy Logo\\
\\
Speakeasy Logo](https://speakeasy.com/)

IngestIngest usage & inference on behalf of your users.

AggregateTransform raw signals into aggregated units.

ChargeGenerate charges & collect payments automatically.

## Ship any pricing model in an afternoon

###### Subscriptions, usage, seats, credits, trials, and discounts. Compose them however your product charges.

[Usage Billing\\
\\
Meter tokens, API calls, compute, storage. Bill with precision down to the event.](https://polar.sh/features/usage-billing) [Subscriptions\\
\\
Recurring plans with trials, upgrades, proration, and dunning built in.](https://polar.sh/features/subscriptions) [Seats\\
\\
Pricing that scales with your customer's teams. Add, remove, prorate automatically.](https://polar.sh/features/seats) [Credits\\
\\
Prepay and draw down over time, like a wallet for your API.](https://polar.sh/features/credits) [Trials\\
\\
Free or paid trials with automatic conversion, reminders, and grace periods.](https://polar.sh/features/trials) [Discounts\\
\\
Coupons, promo codes, and volume tiers. Applied automatically at checkout.](https://polar.sh/features/discounts)

## Know your unit economics

###### Revenue, costs & margins in one overview. The unit economics every AI startup needs to scale with confidence.

![Polar dashboard](https://polar.sh/_next/image?url=%2Fassets%2Flanding%2Fdashboard.jpg&w=3840&q=75)

## Your power users cost you money

###### Polar breaks down LLM spend customer by customer, so you catch the ones bleeding your margins before they bleed your runway.

Customer

Revenue

LLM cost

Gross margin

Jane Doe

Enterprise · 4.1M tokens

$4,200

$294

+93%

John Doe

Growth · 3.3M tokens

$1,800

$234

+87%

Emily Carter

Growth · 2.6M tokens

$920

$184

+80%

Michael Chen

Hobby · 5.5M tokens

$480

$389

+19%

Sarah Müller

Hobby · 8.7M tokens

$90

$612

-580%

## Turn any AI workload into revenue

###### From token-metered APIs to autonomous agents and GPU workloads. Polar fits how modern AI products actually charge.

completions.tsagents.tsgpu.ts

### AI completions

###### Wrap any model from the Vercel AI SDK with the Polar LLMStrategy. Token usage is metered and billed automatically on every call.

[Read the docs](https://polar.sh/docs/features/usage-based-billing/ingestion-strategies/llm-strategy)

```
import { Ingestion } from '@polar-sh/ingestion'
import { LLMStrategy } from '@polar-sh/ingestion/strategies/LLM'
import { generateText } from 'ai'
import { openai } from '@ai-sdk/openai'

const llm = Ingestion({ accessToken: process.env.POLAR_ACCESS_TOKEN })
  .strategy(new LLMStrategy(openai('gpt-4o')))
  .ingest('openai-usage')

const { text } = await generateText({
  model: llm.client({ customerId: user.id }),
  prompt,
})
```

## Everything between usage & revenue

###### Raw usage goes in. Revenue comes out. We handle everything in between.

![John Doe](https://polar.sh/assets/team/emil.png)

John Doe

Consumed 23,820 tokens

Polar

Customer invoiced automatically

LLM Usage Breakdown

Margins, Profits & Cashflow Metrics

Cost Anomalies & Insights

Tax Collection & Remittance

Payment Processing

Refunds & Chargebacks

Risk Analysis & Fraud

Merchant Payout

Acme Inc

$9,311

SEB \*\*\*\* 9128

Event-basedusagebilling.Checkoutsthatconvert.Realtimemetrics.Worldwidetaxhandled.

Polaristhefinanciallayerforanewgenerationofintelligentsoftware.

## What industry leaders think about Polar

###### From AI startups to infrastructure veterans, the teams building the future ship production billing on Polar in days, not weeks.

[Polar's Python SDK and Webhook infrastructure made our billing integration straightforward.\\
\\
It gave us production-ready billing in hours, not weeks.\\
\\
It's rare to find a vendor that moves this fast.\\
\\
Siavash GhorbaniStilla AI](https://polar.sh/customers/stilla-ai) [![Guillermo Rauch](https://polar.sh/assets/landing/testamonials/rauch.jpg)\\
\\
The speed at which Polar is executing on the financial infrastructure primitives the new world needs is very impressive.\\
\\
Guillermo RauchVercel](https://x.com/rauchg/status/1909810055622672851) [![Mitchell Hashimoto](https://polar.sh/assets/landing/testamonials/mitchell.jpg)\\
\\
I've joined Polar as an advisor!\\
\\
I think it benefits everyone for devs to have more options to get paid to work on their passions, to support upstreams, and for users to have more confidence/transparency in the software they're supporting/purchasing.\\
\\
Mitchell HashimotoGhostty](https://x.com/mitchellh/status/1775925951668552005) [Polar has been giving us the high attention support of a startup, with an enterprise-level product and service.\\
\\
Sebastián RamírezFastAPI](https://fastapicloud.com/) [![Alex Bass](https://polar.sh/assets/landing/testamonials/alex.jpg)\\
\\
We switched to @polar\_sh because of their killer API, UX, and product. Also love that it's Open-Source. Their team cares A LOT as well. Worth the minor fee difference.\\
\\
Alex BassEfficient](https://x.com/alexhbass/status/1895688367066747251) [![Pontus Abrahamsson](https://polar.sh/assets/landing/testamonials/pontus.jpg)\\
\\
You can tell @polar\_sh is building DX first\\
\\
Pontus AbrahamssonMidday](https://x.com/pontusab/status/1886140577634463870)

## Built to scale with you.

###### Start free. Upgrade as you grow. Enterprise needs? Let's talk.

Get Started

[Contact Sales](mailto:support@polar.sh)

### Starter

Free to start validating ideas.

Free

Fees

- 5.00% + 50¢ per transaction


Features

- All features to sell

- Standard support


### Pro

For builders & early teams.

$20/month

Fees

- 3.80% + 40¢ per transaction


Features

- All features on Starter

- Preview access to new features

- Prioritized support


### Growth

For scaling startups.

$100/month

Fees

- 3.60% + 35¢ per transaction


Features

- All features on Pro

- Preview access to new features

- Prioritized support


### Scale

For fast growing businesses.

$400/month

Fees

- 3.40% + 30¢ per transaction


Features

- All features on Growth

- Preview access to new features

- Shared Slack channel

- P1 Support


### Startup Program

A year on our most generous plan.

Freefor 12 months

Fees

- 3.40% + 30¢ per transaction


Features

- Everything on Scale


[Apply now](https://polar.sh/startup-program)

[Join Polar today](https://polar.sh/signup) © Polar Software, Inc. 2026

### Features

[Usage Billing](https://polar.sh/features/usage-billing) [Subscriptions](https://polar.sh/features/subscriptions) [Seats](https://polar.sh/features/seats) [Credits](https://polar.sh/features/credits) [Trials](https://polar.sh/features/trials) [Discounts](https://polar.sh/features/discounts) [Cost Insights](https://polar.sh/features/cost-insights) [Finance](https://polar.sh/features/finance) [Merchant of Record](https://polar.sh/features/merchant-of-record)

### Resources

[Why Polar](https://polar.sh/resources/why) [Merchant of Record](https://polar.sh/resources/merchant-of-record) [Pricing](https://polar.sh/resources/pricing) [Downloads](https://polar.sh/downloads)

### Company

[About Polar](https://polar.sh/company) [GitHub](https://github.com/polarsource) [X / Twitter](https://x.com/polar_sh) [Brand Assets](https://polar.sh/assets/brand/polar_brand.zip) [Legal](https://polar.sh/legal) Cookie Preferences

### Support

[Docs](https://polar.sh/docs) [Contact](mailto:support@polar.sh) [Service Status](https://status.polar.sh/)