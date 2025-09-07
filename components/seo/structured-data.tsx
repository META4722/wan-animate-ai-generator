// Structured Data JSX Components
export function StructuredData({ data }: { data: any }) {
  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(data) }}
    />
  )
}

// Multiple Structured Data Rendering
export function MultipleStructuredData({ schemas }: { schemas: any[] }) {
  return (
    <>
      {schemas.map((schema, index) => (
        <StructuredData key={index} data={schema} />
      ))}
    </>
  )
}