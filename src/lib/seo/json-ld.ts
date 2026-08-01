export type JsonLdPrimitive = string | number | boolean | null;

export type JsonLdValue =
  | JsonLdPrimitive
  | JsonLdObject
  | readonly JsonLdValue[];

export interface JsonLdObject {
  readonly [key: string]: JsonLdValue | undefined;
}
/**
 * Serialize structured data for an inline application/ld+json script.
 *
 * JSON.stringify alone can leave a literal "<" in user-controlled fields, allowing a
 * malicious closing script tag to terminate the JSON-LD block. Next's JSON-LD guide calls out
 * this exact boundary, so all page schemas should go through this helper rather than calling
 * JSON.stringify directly.
 */
export function serializeJsonLd(
  data: JsonLdObject | readonly JsonLdObject[],
): string {
  return JSON.stringify(data)
    .replace(/</g, '\\u003c')
    .replace(/\u2028/g, '\\u2028')
    .replace(/\u2029/g, '\\u2029');
}
