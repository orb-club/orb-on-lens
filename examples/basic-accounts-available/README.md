# Basic Accounts Available

A minimal Next.js example that queries the Lens API for accounts available by address.

## Quick Start

```bash
bun install
bun dev
```

## Usage

Query accounts by address:

```bash
curl "http://localhost:3000/api/accounts?address=0x..."
```

## Example Response

```json
{
  "data": {
    "accountsAvailable": {
      "items": [
        {
          "account": {
            "address": "0x...",
            "username": { "localName": "example" },
            "metadata": {
              "name": "Display Name",
              "bio": "User bio",
              "picture": "https://..."
            }
          }
        }
      ]
    }
  }
}
```

## API Reference

- **Endpoint:** `GET /api/accounts`
- **Query Parameter:** `address` (required) - Ethereum address to query
- **Returns:** Accounts owned or managed by the given address
