import {
  serializeJsonLd,
  type JsonLdObject,
} from '@/lib/seo/json-ld';

interface JsonLdProps {
  data: JsonLdObject | readonly JsonLdObject[];
  id?: string;
}
/** Render sanitized structured data using the native script element recommended by Next.js. */
export default function JsonLd({ data, id }: JsonLdProps) {
  return (
    <script
      id={id}
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: serializeJsonLd(data) }}
    />
  );
}
