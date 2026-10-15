export const SITE_URL = 'https://juandquintero.github.io/interactive-colombia-map/';
export const OG_IMAGE_URL = `${SITE_URL}images/og-default.png`;

export const DEFAULT_META = {
    title: 'Check & Travel Colombia — mapa interactivo de viajes',
    description:
        'Explora los 33 departamentos y 1.128 municipios de Colombia, registra tus visitas y gana insignias de viaje.',
};

const setMeta = (attribute: 'name' | 'property', key: string, content: string) => {
    let element = document.head.querySelector<HTMLMetaElement>(`meta[${attribute}="${key}"]`);
    if (!element) {
        element = document.createElement('meta');
        element.setAttribute(attribute, key);
        document.head.appendChild(element);
    }
    element.setAttribute('content', content);
};

const setCanonical = (href: string) => {
    let element = document.head.querySelector<HTMLLinkElement>('link[rel="canonical"]');
    if (!element) {
        element = document.createElement('link');
        element.setAttribute('rel', 'canonical');
        document.head.appendChild(element);
    }
    element.setAttribute('href', href);
};

export interface PageMeta {
    title: string;
    description: string;
    path?: string;
}

export const applyPageMeta = ({ title, description, path = '' }: PageMeta): void => {
    if (typeof document === 'undefined') return;
    const normalizedPath = path.replace(/^\/+/, '');
    const url = normalizedPath ? `${SITE_URL}${normalizedPath}` : SITE_URL;

    document.title = title;
    setMeta('property', 'og:title', title);
    setMeta('name', 'twitter:title', title);
    setMeta('property', 'og:description', description);
    setMeta('name', 'twitter:description', description);
    setMeta('property', 'og:url', url);
    setCanonical(url);
};

export const departmentSlug = (departmentName: string): string =>
    departmentName
        .toLowerCase()
        .normalize('NFD')
        .replace(/[\u0300-\u036f]/g, '')
        .replace(/[^a-z0-9]+/g, '-')
        .replace(/(^-|-$)/g, '');

export const departmentMeta = (departmentName: string): PageMeta => ({
    title: `${departmentName} — municipios y rutas | Check & Travel Colombia`,
    description: `Explora los municipios de ${departmentName}, registra tus visitas y consulta el estado de las rutas que reportan otros viajeros.`,
    path: `departamento/${departmentSlug(departmentName)}/`,
});
