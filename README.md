# Iron & Ember Fitness

A portfolio site built by NeonFrame Web Design showcasing a fictional strength and conditioning gym.

Live: https://neonframewebdev.github.io/iron-and-ember-fitness/

## Stack

- Pure HTML/CSS/JS (no build step, no framework)
- GSAP 3.12 + ScrollTrigger (CDN, deferred)
- Lenis smooth scroll (CDN, deferred)
- Google Fonts: Anton, Archivo Black, Inter, JetBrains Mono (non-blocking load)
- Images: self-hosted WebP + JPG from Unsplash (see ATTRIBUTIONS.md)

## Pages

- `index.html` Home: hero, manifesto, horizontal pinned moments, programs teaser, stats, coaches grid, testimonials, CTA
- `programs.html` Programs: pinned scroll layout, 4 programs in detail, full weekly schedule grid
- `coaches.html` Coaches: 4 bios with portraits, lifts, pull quotes
- `membership.html` Membership: 3 pricing tiers, comparison table, FAQ accordion
- `contact.html` Contact: address, hours, form, map embed
- `404.html` Error page

## Local development

```bash
python3 -m http.server 8765
# open http://localhost:8765
```

## Tests

```bash
./tests/check.sh
```

Runs 30+ checks across all pages: meta tags, structured data, asset paths, nav consistency, no em-dashes, JS syntax, CSS braces, image file validity, HTTP status, sitemap.xml, robots.txt, webmanifest.

## Performance

Targets per page:
- Mobile Lighthouse perf: at least 90
- Desktop Lighthouse perf: at least 98
- Accessibility: at least 98
- Best practices: 100
- SEO: 100

Key tactics:
- Responsive hero backgrounds (800px mobile, full-size desktop via media-query preload and CSS media-query override)
- `<picture>` with WebP source for every editorial image
- Lazy loading + async decoding on non-hero images
- `fetchpriority="high"` on LCP image
- Google Fonts loaded non-blocking via `media="print" onload` trick
- GSAP, ScrollTrigger, Lenis loaded with `defer`
- `inert` on mobile menu overlay
- `:focus-visible` rings for keyboard users

## SEO

- Unique per-page titles, descriptions, canonicals
- Open Graph + Twitter Card meta on every page
- JSON-LD: LocalBusiness + HealthClub on home and contact, Person per coach, FAQPage on membership, BreadcrumbList on non-home pages
- `sitemap.xml` with 5 URLs
- `robots.txt`
- `site.webmanifest`

## Copy rules

- No em-dashes, no en-dashes, no HTML entities like `&mdash;` or `&ndash;`. Enforced by `tests/check.sh`.
- Second-person, short sentences, industrial tone.
