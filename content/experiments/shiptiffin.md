---
id: "shiptiffin"
title: "ShipTiffin"
slug: "shiptiffin"
description: "An open-source platform that runs your apps, databases, auth, files and jobs on one server you own, with a CLI, MCP server and dashboard."
publishDate: "2026-10-13T12:00:00-07:00"
status: "published"
heroImage: "shiptiffin-hero"
---

You can check out this experiment [here](https://shiptiffin.com). The source is on [GitHub](https://github.com/shiptiffin/tiffin).

Shipping a small app comes with a surprisingly long shopping list. Hosting. A database. Sign-in. File storage. Background jobs. Analytics. Then you build another app and do the wiring again.

ShipTiffin is my attempt to pack that into one box. All your apps on one Linux server you own, with the services they need already there. You run it through a dashboard, the tiffin CLI, or your coding agent.

## What goes in the box

Each project gets Postgres, Redis-compatible KV, S3-compatible files and Better Auth for sign-in. The box also handles queues, cron jobs, workflows, cookieless analytics, Sentry-compatible error tracking, logs and backups. Email goes through your own SMTP provider; until you connect one, messages land in a test inbox.

Next.js is the starting point, with starters for Hono, FastAPI, SvelteKit, Nuxt, React Router, TanStack Start, Astro and static sites. You can also bring a Dockerfile. GitHub pushes deploy, pull requests get previews with their own database copies, and you can roll back a deployment.

Service settings reach your app as environment variables. You don't have to carry credentials from one dashboard to another every time you add a database or a bucket.

## Built for coding agents

ShipTiffin exposes the same operations through its CLI, HTTP API and MCP server. An agent can inspect the box, configure services and deploy an app through one interface.

Changes follow a plan-and-apply flow. The agent asks for a plan, you can inspect the steps and their risks, and applying it requires that plan's hash. Each agent can have its own scoped key. The activity log records who changed what and why, and reversible changes can be undone.

Run tiffin init in an app's folder and it writes the project config, AGENTS.md and an agent skill. Then: tiffin plan, tiffin apply and tiffin deploy.

## Your server, your bill

You can self-host on Hetzner or an Ubuntu server. The software is free; you pay for the machine. The platform is AGPL-3.0-only, while the SDK and starters are Apache-2.0.

The managed option builds the box in your own Hetzner account and adds updates, external monitoring, encrypted off-server backups and support. As of October 2026, it's $19 a month per box plus Hetzner's server bill (about $10 before VAT for the smallest setup). There's no ShipTiffin per-project or per-request charge. Server capacity and Hetzner's traffic allowance still apply.

Projects can have CPU and memory limits, so you can give each experiment a budget within the box. If you cancel the managed service, your server and apps keep running; the managed extras stop.

## The limits

It's one server. If that machine goes down, so do the apps on it. ShipTiffin is also pre-1.0, and interfaces may change. It suits side projects, prototypes and small products that can accept that tradeoff.

Self-hosted backups need an off-server destination configured if you want them to survive losing the box.

[Quickstart](https://shiptiffin.com/docs/quickstart) · [What works today](https://shiptiffin.com/docs/limits) · [Security model](https://shiptiffin.com/security)
