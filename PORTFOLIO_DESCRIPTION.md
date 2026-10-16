# InsureFlow — Portfolio Listing

## Short description

A full-stack insurance operations dashboard built with React, TypeScript, Spring Boot, Spring Security, and JPA. It provides workflows for managing customer records, reviewing insurance applications, maintaining policies, and tracking upcoming renewals through a REST API and persistent database.

## Key features

- Responsive operational dashboard with live KPIs and renewal visibility.
- Customer CRUD workflows with validation and duplicate-email checks.
- Insurance application submission and underwriting status changes.
- Policy CRUD workflows with duplicate policy-number checks and expiry tracking.
- Authenticated REST endpoints and a sign-in/sign-out flow for the demo admin account.
- H2 local persistence with optional MariaDB through Docker Compose.
- Backend integration tests and GitHub Actions CI for backend tests and frontend production build.

## Technology stack

React · TypeScript · Vite · Java 21 · Spring Boot · Spring Security · Spring Data JPA · REST APIs · H2 · MariaDB · Docker Compose · JUnit 5 · MockMvc · GitHub Actions

## Suggested portfolio copy

**InsureFlow | Full-Stack Insurance Operations Dashboard**

Designed and built a full-stack insurance operations dashboard with a React/TypeScript frontend and a Java Spring Boot REST API. Implemented customer and policy CRUD workflows, insurance application status management, persistent database storage, renewal tracking, request validation, and authenticated API access. Added backend integration tests and a GitHub Actions workflow to automate backend tests and frontend builds. The project uses synthetic demo records and is intended as a portfolio demonstration, not a production insurance platform.

## Before publishing

- Run the backend tests and frontend production build locally or confirm both GitHub Actions jobs pass.
- Replace the local demo credentials before any deployment.
- Do not include `.env`, database files, real credentials, or personal customer data in Git.
- Be clear that the document center is a planned placeholder and that the authentication setup is a demonstration, not production-grade identity management.
