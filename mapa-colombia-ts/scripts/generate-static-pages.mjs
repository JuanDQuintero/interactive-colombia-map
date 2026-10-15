import { mkdirSync, readFileSync, writeFileSync } from 'node:fs';
import { join } from 'node:path';

const SITE_URL = 'https://juandquintero.github.io/interactive-colombia-map/';
const OG_IMAGE_URL = `${SITE_URL}images/og-default.png`;
const DIST = 'dist';

const slugify = (name) =>
    name
        .toLowerCase()
        .normalize('NFD')
        .replace(/[\u0300-\u036f]/g, '')
        .replace(/[^a-z0-9]+/g, '-')
        .replace(/(^-|-$)/g, '');

const escapeHtml = (value) =>
    value
        .replace(/&/g, '&amp;')
        .replace(/</g, '&lt;')
        .replace(/>/g, '&gt;')
        .replace(/"/g, '&quot;');

const readDepartments = () => {
    const source = readFileSync('src/data/colombiaMapData.ts', 'utf8');
    return [...source.matchAll(/"(CO-[A-Z]{2,3})":\s*\{\s*name:\s*"([^"]+)"/g)].map(([, id, name]) => ({
        id,
        name,
        slug: slugify(name),
    }));
};

const readMunicipalityCounts = () => {
    const source = readFileSync('src/data/municipalitiesData.ts', 'utf8');
    const counts = {};
    for (const match of source.matchAll(/departmentId:\s*'(CO-[A-Z]{2,3})'/g)) {
        counts[match[1]] = (counts[match[1]] ?? 0) + 1;
    }
    return counts;
};

const replaceTag = (html, attributeMarkup, value) =>
    html.replace(
        new RegExp(`(<meta ${attributeMarkup} content=")[^"]*(")`),
        (_, open, close) => `${open}${value}${close}`
    );

const applyMeta = (html, { title, description, url }) => {
    let output = html;
    output = output.replace(/<title>[\s\S]*?<\/title>/, `<title>${escapeHtml(title)}</title>`);
    output = replaceTag(output, 'name="description"', escapeHtml(description));
    output = replaceTag(output, 'name="twitter:title"', escapeHtml(title));
    output = replaceTag(output, 'name="twitter:description"', escapeHtml(description));
    output = replaceTag(output, 'property="og:title"', escapeHtml(title));
    output = replaceTag(output, 'property="og:description"', escapeHtml(description));
    output = replaceTag(output, 'property="og:url"', url);
    output = output.replace(/(<link rel="canonical" href=")[^"]*(")/, (_, open, close) => `${open}${url}${close}`);
    return output;
};

const withStructuredData = (html, data) =>
    html.replace(
        '</head>',
        `    <script type="application/ld+json">${JSON.stringify(data)}</script>\n  </head>`
    );

const buildPage = (template, { title, description, url, structuredData }) =>
    withStructuredData(applyMeta(template, { title, description, url }), structuredData);

const buildSitemap = (urls, lastmod) => {
    const entries = urls
        .map(
            ({ loc, changefreq, priority }) =>
                `  <url>\n    <loc>${loc}</loc>\n    <lastmod>${lastmod}</lastmod>\n    <changefreq>${changefreq}</changefreq>\n    <priority>${priority}</priority>\n  </url>`
        )
        .join('\n');
    return `<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n${entries}\n</urlset>\n`;
};

const main = () => {
    const template = readFileSync(join(DIST, 'index.html'), 'utf8');
    const departments = readDepartments();
    const municipalityCounts = readMunicipalityCounts();
    const lastmod = new Date().toISOString().slice(0, 10);

    const rootDescription =
        'Explora los 33 departamentos y 1.128 municipios de Colombia, registra tus visitas, consulta el estado de las rutas y gana insignias de viaje.';

    writeFileSync(
        join(DIST, 'index.html'),
        buildPage(template, {
            title: 'Check & Travel Colombia — mapa interactivo de viajes',
            description: rootDescription,
            url: SITE_URL,
            structuredData: {
                '@context': 'https://schema.org',
                '@type': 'WebSite',
                name: 'Check & Travel Colombia',
                url: SITE_URL,
                description: rootDescription,
                inLanguage: 'es-CO',
                image: OG_IMAGE_URL,
            },
        })
    );

    const urls = [{ loc: SITE_URL, changefreq: 'weekly', priority: '1.0' }];

    for (const department of departments) {
        const municipalityCount = municipalityCounts[department.id] ?? 0;
        const url = `${SITE_URL}departamento/${department.slug}/`;
        const description = `Explora los ${municipalityCount} municipios de ${department.name}, registra tus visitas y consulta el estado de las rutas que reportan otros viajeros.`;
        const directory = join(DIST, 'departamento', department.slug);
        mkdirSync(directory, { recursive: true });
        writeFileSync(
            join(directory, 'index.html'),
            buildPage(template, {
                title: `${department.name} — municipios y rutas | Check & Travel Colombia`,
                description,
                url,
                structuredData: {
                    '@context': 'https://schema.org',
                    '@type': 'TouristDestination',
                    name: department.name,
                    description,
                    url,
                    inLanguage: 'es-CO',
                    image: OG_IMAGE_URL,
                    containedInPlace: { '@type': 'Country', name: 'Colombia' },
                },
            })
        );
        urls.push({ loc: url, changefreq: 'weekly', priority: '0.8' });
    }

    writeFileSync(join(DIST, 'sitemap.xml'), buildSitemap(urls, lastmod));
    writeFileSync(
        join(DIST, 'robots.txt'),
        `User-agent: *\nAllow: /\n\nSitemap: ${SITE_URL}sitemap.xml\n`
    );

    console.log(`SSG: ${departments.length} páginas de departamento + sitemap.xml + robots.txt`);
};

main();
