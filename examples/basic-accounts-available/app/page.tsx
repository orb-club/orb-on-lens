export default function Home() {
  return (
    <main style={{ padding: '2rem', fontFamily: 'system-ui, sans-serif' }}>
      <h1>Lens Accounts Available API</h1>
      <p>Query the Lens API for accounts available by address.</p>

      <h2>Usage</h2>
      <pre style={{ background: '#f4f4f4', padding: '1rem', borderRadius: '4px' }}>
{`GET /api/accounts?address=0x...

Example:
curl "http://localhost:3000/api/accounts?address=0xYourAddress"`}
      </pre>

      <h2>Response</h2>
      <p>Returns accounts owned or managed by the given address:</p>
      <pre style={{ background: '#f4f4f4', padding: '1rem', borderRadius: '4px' }}>
{`{
  "data": {
    "accountsAvailable": {
      "items": [
        {
          "account": {
            "address": "0x...",
            "username": { "localName": "example" },
            "metadata": { "name": "...", "bio": "...", "picture": "..." }
          }
        }
      ]
    }
  }
}`}
      </pre>
    </main>
  );
}
