# Orb Polls API

## Overview

API for creating and managing polls on Orb platform with Lens Protocol integration.

## Base Configuration

- **Endpoint**: `https://orbapi.xyz`
- **Authentication**: Bearer token via `x-access-token` header
- **Token**: Your Lens access token

## Authentication

```
x-access-token: Bearer <LENS_ACCESS_TOKEN>
```

## Endpoints

### /create-post

Creates a new poll post on Orb.

**Request:**

```json
{
  "publicationType": "TEXT_ONLY",
  "content": "ath tomorrow?",
  "poll": {
    "endTimestamp": 1774453600000,
    "allowMultipleAnswers": true,
    "questions": ["yes", "no", "maybe"]
  }
}
```

**Fields:**

- `publicationType`: Post type (TEXT_ONLY for polls)
- `content`: Poll question text
- `groupId`: Optional - post to specific group
- `poll.endTimestamp`: Unix timestamp when poll closes (max 1 week)
- `poll.allowMultipleAnswers`: Whether users can select multiple options
- `poll.questions`: Array of poll options

**Response:**

```json
{
  "status": "SUCCESS",
  "data": {
    "type": "HASH",
    "hash": "0x41036e88b7e0a7fca771af06815e2142a564ca2ca780396a83ad43512480d49d"
  }
}
```

### /get-voters

Retrieves poll results and voter information.

**Request:**

```json
{
  "id": "44069341992234832246863395894141716544314628013231814134125774786835062676448"
}
```

**Fields:**

- `id`: Poll publication ID

**Response:**

```json
{
    "status": "SUCCESS",
    "data": {
        "options": [
            {
                "option": "yes",
                "voteCount": 1,
                "votePercentage": 100,
                "myVote": false,
                "voters": [...],
                "optionKey": 0
            }
        ],
        "endTimestamp": 1774453600000,
        "allowMultipleAnswers": true,
        "totalVotes": 1,
        "isActive": true
    }
}
```

### /enable-action

Enables poll voting action and returns transaction data.

**Request:**

```json
{
  "task": "POLL",
  "post": "44069341992234832246863395894141716544314628013231814134125774786835062676448",
  "pollOptions": [1]
}
```

**Fields:**

- `task`: Action type (POLL for voting)
- `post`: Poll publication ID
- `pollOptions`: Array of selected option indices

**Response:**

```json
{
    "status": "SUCCESS",
    "data": {
        "type": "TRANSACTIONS",
        "transactions": [...]
    }
}
```

## Error Handling

- `status`: SUCCESS or ERROR
- Check response status before processing data
- Failed requests return error details in response
