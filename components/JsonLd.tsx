/** schema.org JSON-LD as a native script tag. next/script is for executable
    JavaScript, and `<` is escaped so a string cannot close the tag. See
    node_modules/next/dist/docs/01-app/02-guides/json-ld.md. */
export default function JsonLd({ data }: { data: unknown }) {
  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{
        __html: JSON.stringify(data).replace(/</g, "\\u003c"),
      }}
    />
  );
}
