export default function HomePage() {
  return (
    <main style={{ maxWidth: 720, margin: '0 auto', padding: '4rem 1.5rem' }}>
      <h1 style={{ fontSize: '2rem', marginBottom: '0.25rem' }}>Deportix API</h1>
      <p style={{ color: '#94a3b8', marginTop: 0 }}>
        Public sports data API powered by Firestore.
      </p>
      <ul style={{ lineHeight: 2, marginTop: '2rem' }}>
        <li>
          <a style={{ color: '#60a5fa' }} href="/docs">
            Swagger documentation (/docs)
          </a>
        </li>
        <li>
          <a style={{ color: '#60a5fa' }} href="/v1/openapi.json">
            OpenAPI specification (/v1/openapi.json)
          </a>
        </li>
        <li>
          <a style={{ color: '#94a3b8' }} href="/v1/health">
            Deportix API — health (/v1/health)
          </a>
        </li>
        <li>
          <a style={{ color: '#94a3b8' }} href="/v1/data-status">
            Deportix API — data coverage (/v1/data-status)
          </a>
        </li>
        <li>
          <a style={{ color: '#94a3b8' }} href="/fixtures?league=262&season=2026">
            BFF example — fixtures (/fixtures)
          </a>
        </li>
      </ul>
    </main>
  );
}
