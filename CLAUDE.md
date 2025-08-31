# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

This is a web-based ordering system for a local Cub Scouts pack to manage mums (chrysanthemum) sales. The system prioritizes simplicity, accessibility, and zero-cost solutions.

## Project Constraints

- **Must be free**: Use only free services and hosting options
- **Browser-based**: All functionality must work in web browsers on both desktop and mobile
- **Simple authentication**: Secure but not burdensome login system
- **Maintainable**: Should be manageable by people with basic computer knowledge
- **Friendly UI**: Fun and approachable design for scouts and parents

## Core Features

### User Features
- Welcome screen with admin-editable notices and instructions
- Place orders for mums with:
  - Order name
  - Customer contact information (phone, first/last name, email, physical address)
  - Product quantities
  - Optional comments
- Form features:
  - Auto-populate fields where possible
  - Save previous answers for repeatable items
  - Real-time price calculation during order entry
- Payment via Venmo or similar peer-to-peer payment services
- View available products with title, picture, and price

### Admin Features
- Edit welcome screen notices and instructions
- Configure available mums catalog
- Mark products as "no longer available"
- Receive notifications for new orders
- View order list with names, quantities, and total prices
- Print-friendly order summaries

## Technical Approach

When implementing this system, consider:
- **Google Sheets integration** as a potential backend for data storage
- **Static site generators** for the frontend if using free hosting
- **Google Forms** or similar for order collection
- **Email notifications** for admin alerts
- **Responsive design** for mobile and desktop compatibility

## Development Guidelines

- Prioritize simplicity over complex features
- Ensure all solutions are completely free to deploy and maintain
- Test on both mobile and desktop browsers
- Make admin tasks as straightforward as possible
- Include clear documentation for non-technical administrators