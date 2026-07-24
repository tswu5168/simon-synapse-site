import { SITE } from "../config/site";

export const absoluteUrl = (path: string): string =>
  new URL(path, SITE.origin).toString();

export function profileJsonLd() {
  return {
    "@context": "https://schema.org",
    "@type": "ProfilePage",
    name: `關於 ${SITE.author}`,
    url: absoluteUrl("/about"),
    mainEntity: {
      "@type": "Person",
      name: SITE.author,
      alternateName: SITE.name,
      url: absoluteUrl("/about"),
      sameAs: [SITE.githubUrl],
    },
  };
}

export function articleJsonLd(input: {
  title: string;
  description: string;
  pathname: string;
  publishedAt: Date;
  updatedAt: Date;
  image: string;
}) {
  return {
    "@context": "https://schema.org",
    "@type": "BlogPosting",
    headline: input.title,
    description: input.description,
    url: absoluteUrl(input.pathname),
    image: absoluteUrl(input.image),
    datePublished: input.publishedAt.toISOString(),
    dateModified: input.updatedAt.toISOString(),
    inLanguage: SITE.locale,
    author: {
      "@type": "Person",
      name: SITE.author,
      url: absoluteUrl("/about"),
    },
  };
}

export function creativeWorkJsonLd(input: {
  title: string;
  description: string;
  pathname: string;
  publishedAt: Date;
  updatedAt: Date;
  image: string;
  projectUrl: string;
}) {
  return {
    "@context": "https://schema.org",
    "@type": "CreativeWork",
    name: input.title,
    description: input.description,
    url: absoluteUrl(input.pathname),
    image: absoluteUrl(input.image),
    datePublished: input.publishedAt.toISOString(),
    dateModified: input.updatedAt.toISOString(),
    inLanguage: SITE.locale,
    author: {
      "@type": "Person",
      name: SITE.author,
      url: absoluteUrl("/about"),
    },
    sameAs: input.projectUrl,
  };
}
