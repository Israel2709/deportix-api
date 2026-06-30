import { SwaggerDocs } from '@/components/SwaggerDocs';

export const metadata = {
  title: 'Deportix API — Swagger',
  description: 'Interactive OpenAPI documentation for Deportix API and the API-Sports BFF layer.',
};

export default function DocsPage() {
  return (
    <main
      style={{
        minHeight: '100vh',
        background: '#fff',
        color: '#1a1a1a',
      }}
    >
      <SwaggerDocs />
    </main>
  );
}
