import type { JsonLdObject } from './json-ld';

export interface BreadcrumbJsonLdItem {
  name: string;
  url: string;
}
export function buildBreadcrumbJsonLd(
  items: readonly BreadcrumbJsonLdItem[],
): JsonLdObject {
  return {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    itemListElement: items.map((item, index) => ({
      '@type': 'ListItem',
      position: index + 1,
      name: item.name,
      item: item.url,
    })),
  };
}

export interface DirectoryItemJsonLd {
  name: string;
  url: string;
}

interface DirectoryItemListJsonLdOptions {
  name: string;
  url: string;
  items: readonly DirectoryItemJsonLd[];
  totalItems?: number;
  /** Zero-based offset of the first item, used to keep positions global on page 2+. */
  positionOffset?: number;
}

export function buildDirectoryItemListJsonLd({
  name,
  url,
  items,
  totalItems,
  positionOffset = 0,
}: DirectoryItemListJsonLdOptions): JsonLdObject {
  return {
    '@context': 'https://schema.org',
    '@type': 'ItemList',
    '@id': `${url}#creator-list`,
    name,
    url,
    ...(totalItems == null ? {} : { numberOfItems: totalItems }),
    itemListElement: items.map((item, index) => ({
      '@type': 'ListItem',
      position: positionOffset + index + 1,
      name: item.name,
      url: item.url,
    })),
  };
}

interface CollectionPageJsonLdOptions {
  name: string;
  description: string;
  url: string;
  dateModified?: string;
  breadcrumbId?: string;
  itemListId?: string;
}

export function buildCollectionPageJsonLd({
  name,
  description,
  url,
  dateModified,
  breadcrumbId,
  itemListId,
}: CollectionPageJsonLdOptions): JsonLdObject {
  return {
    '@context': 'https://schema.org',
    '@type': 'CollectionPage',
    '@id': `${url}#webpage`,
    url,
    name,
    description,
    inLanguage: 'en-US',
    ...(dateModified ? { dateModified } : {}),
    ...(breadcrumbId ? { breadcrumb: { '@id': breadcrumbId } } : {}),
    ...(itemListId ? { mainEntity: { '@id': itemListId } } : {}),
  };
}

export interface DatasetVariableJsonLd {
  name: string;
  description?: string;
}

interface DirectoryDatasetJsonLdOptions {
  name: string;
  description: string;
  url: string;
  dateModified: string;
  spatialCoverage: string;
  variables: readonly DatasetVariableJsonLd[];
  methodologyUrl: string;
  creatorId?: string;
  temporalCoverage?: string;
}

/**
 * Describe the published directory snapshot, not the OnlyFans creator profiles themselves.
 * Call this only on pages that visibly publish the matching metrics and methodology.
 */
export function buildDirectoryDatasetJsonLd({
  name,
  description,
  url,
  dateModified,
  spatialCoverage,
  variables,
  methodologyUrl,
  creatorId,
  temporalCoverage,
}: DirectoryDatasetJsonLdOptions): JsonLdObject {
  return {
    '@context': 'https://schema.org',
    '@type': 'Dataset',
    '@id': `${url}#dataset`,
    name,
    description,
    url,
    dateModified,
    spatialCoverage,
    isAccessibleForFree: true,
    measurementTechnique: `Directory aggregation methodology: ${methodologyUrl}`,
    ...(creatorId ? { creator: { '@id': creatorId } } : {}),
    ...(temporalCoverage ? { temporalCoverage } : {}),
    variableMeasured: variables.map((variable) => ({
      '@type': 'PropertyValue',
      name: variable.name,
      ...(variable.description ? { description: variable.description } : {}),
    })),
  };
}
