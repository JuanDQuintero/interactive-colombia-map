import fs from 'node:fs';
import path from 'node:path';
import * as d3 from 'd3-geo';

// Build-time generator: turns GADM 4.1 Colombia level-2 (municipalities) GeoJSON
// into per-department SVG path modules for the drill-down map.
// Usage: node scripts/generate-municipality-map.mjs <path-to-gadm41_COL_2.json>

const GADM_PATH = process.argv[2];

if (!GADM_PATH) {
    console.error('Usage: node scripts/generate-municipality-map.mjs <gadm41_COL_2.json>');
    process.exit(1);
}

if (!fs.existsSync(GADM_PATH)) {
    console.error(`GADM file not found: ${GADM_PATH}`);
    process.exit(1);
}

const OUT_DIR = 'src/data/municipalityPaths';
const FILL_VIEW = 1000;
const SIMPLIFY_TOL = 0.25;
const PADDING = 10;

// Ramer-Douglas-Peucker over a projected ring (points = [[x, y], ...]).
const rdp = (points, tol, s = 0, e = points.length - 1) => {
    let maxD = 0;
    let idx = s;
    for (let i = s + 1; i < e; i += 1) {
        const temp =
            Math.abs(
                (points[e][1] - points[s][1]) * points[i][0] -
                    (points[e][0] - points[s][0]) * points[i][1] +
                    points[e][0] * points[s][1] -
                    points[e][1] * points[s][0]
            ) / Math.hypot(points[e][0] - points[s][0], points[e][1] - points[s][1]);
        if (temp > maxD) {
            maxD = temp;
            idx = i;
        }
    }
    if (maxD > tol) {
        const left = rdp(points, tol, s, idx);
        const right = rdp(points, tol, idx, e);
        return left.slice(0, -1).concat(right);
    }
    return [points[s], points[e]];
};

const DEPT_IDS = {
    'Amazonas': 'CO-AMA',
    'Antioquia': 'CO-ANT',
    'Arauca': 'CO-ARA',
    'Atlántico': 'CO-ATL',
    'BogotáD.C.': 'CO-DC',
    'Bolívar': 'CO-BOL',
    'Boyacá': 'CO-BOY',
    'Caldas': 'CO-CAL',
    'Caquetá': 'CO-CAQ',
    'Casanare': 'CO-CAS',
    'Cauca': 'CO-CAU',
    'Cesar': 'CO-CES',
    'Chocó': 'CO-CHO',
    'Córdoba': 'CO-COR',
    'Cundinamarca': 'CO-CUN',
    'Guainía': 'CO-GUA',
    'Guaviare': 'CO-GUV',
    'Huila': 'CO-HUI',
    'LaGuajira': 'CO-LAG',
    'Magdalena': 'CO-MAG',
    'Meta': 'CO-MET',
    'Nariño': 'CO-NAR',
    'NortedeSantander': 'CO-NSA',
    'Putumayo': 'CO-PUT',
    'Quindío': 'CO-QUI',
    'Risaralda': 'CO-RIS',
    'SanAndrésyProvidencia': 'CO-SAP',
    'Santander': 'CO-SAN',
    'Sucre': 'CO-SUC',
    'Tolima': 'CO-TOL',
    'ValledelCauca': 'CO-VAC',
    'Vaupés': 'CO-VAU',
    'Vichada': 'CO-VIC'
};

const norm = (s) => s
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .toLowerCase()
    .replace(/[^a-z0-9]/g, '');

// Some municipalities carry the article in one source but not the other
// (GADM "Peñol" vs our "El Peñol"). Strip a leading article for a second pass.
const stripArticle = (s) => s.replace(/^(el|la|los|las)/, '');

// Known name variants between GADM 4.1 and our dataset.
const ALIASES = {
    bogotadc: ['bogota', 'bogotadc']
};

// GADM 4.1 strips spaces and lowercases particles ("SanPedrodelosMilagros",
// "ValledelCauca", "ElEncanto", "BogotáD.C."). Rebuild a readable name:
// 1) split before internal capitals, 2) split particle runs that decompose
// fully into known Spanish particles (so "Candelaria" is never broken).
const PARTICLES = ['delas', 'delos', 'ydelas', 'ydelos', 'ydela', 'ydel', 'yla', 'ylos', 'ylas', 'dela', 'del', 'de', 'yde', 'y', 'los', 'las', 'la', 'el'];

// Particles glued to a capitalized word ("Nortede", "Jaguadel", "Martíndelos").
// "la"/"las"/"los"/"el" are common word endings ("Marsella", "Ángel"), so a
// bare one of those is never split off.
const PARTICLE_DISPLAY = {
    delas: 'de las',
    delos: 'de los',
    dela: 'de la',
    del: 'del',
    de: 'de',
    ydelas: 'y de las',
    ydelos: 'y de los',
    ydela: 'y de la',
    ydel: 'y del',
    yde: 'y de',
    yla: 'y la',
    ylos: 'y los',
    ylas: 'y las',
    y: 'y'
};
const GLUED_PARTICLES = Object.keys(PARTICLE_DISPLAY);

const splitParticles = (lowercaseToken) => {
    let rest = lowercaseToken;
    const parts = [];
    while (rest.length > 0) {
        const hit = PARTICLES.find((particle) => rest.startsWith(particle));
        if (!hit) return null;
        parts.push(hit);
        rest = rest.slice(hit.length);
    }
    return parts.length > 0 ? parts : null;
};

const deconcat = (raw) => {
    const spaced = raw.replace(/(\p{Ll})(\p{Lu})/gu, '$1 $2').replace(/\s+/g, ' ').trim();
    const tokens = spaced.split(' ').map((token) => {
        if (/^\p{Ll}+$/u.test(token)) {
            const parts = splitParticles(token);
            return parts ? parts.map((part) => PARTICLE_DISPLAY[part] ?? part).join(' ') : token;
        }
        // A capitalized word glued to particles ("Nortede", "Martíndelos").
        // Only split when the tail is exactly a known particle word.
        if (/^\p{Lu}\p{Ll}+$/u.test(token) && token.length >= 3) {
            for (let cut = 1; cut < token.length; cut += 1) {
                const head = token.slice(0, cut);
                const tail = token.slice(cut);
                if (tail.length < 2 || head.length < 3) continue;
                const display = PARTICLE_DISPLAY[tail];
                if (!display) continue;
                return `${head} ${display}`;
            }
        }
        return token;
    });
    return tokens.join(' ');
};

const round = (n) => Math.round(n * 100) / 100;

const gadm = JSON.parse(fs.readFileSync(GADM_PATH, 'utf8'));

// Parse our municipality names (id/name/departmentId) from the TS source.
const src = fs.readFileSync('src/data/municipalitiesData.ts', 'utf8');
const ourByDept = {};
const fileDeptOrder = [];
const entryRe = /\{\s*id:\s*'([^']+)'\s*,\s*name:\s*'([^']+)'\s*,\s*departmentId:\s*'([^']+)'\s*\}/g;
let entryMatch;
while ((entryMatch = entryRe.exec(src)) !== null) {
    const [, id, name, deptId] = entryMatch;
    if (!ourByDept[deptId]) {
        ourByDept[deptId] = [];
        fileDeptOrder.push(deptId);
    }
    ourByDept[deptId].push({ id, name, normName: norm(name) });
}

// The full municipality catalog. We start from the curated entries (keeping
// their stable ids and the department order of the file) and append GADM
// municipalities that are not there yet with a fresh sequential id.
const catalogByDept = {};
const nextNumber = {};
const tsStr = (s) => s.replace(/\\/g, '\\\\').replace(/'/g, "\\'");

for (const deptId of Object.keys(ourByDept)) {
    catalogByDept[deptId] = ourByDept[deptId].map(({ id, name }) => ({ id, name, departmentId: deptId }));
    let maxN = 0;
    for (const { id } of ourByDept[deptId]) {
        const num = Number(id.split('-').pop());
        if (Number.isFinite(num) && num > maxN) maxN = num;
    }
    nextNumber[deptId] = maxN;
}

// Group GADM features by department id.
const byDept = {};
for (const feature of gadm.features) {
    const deptId = DEPT_IDS[feature.properties.NAME_1];
    if (!deptId) {
        console.warn(`Skipping unknown department: ${feature.properties.NAME_1}`);
        continue;
    }
    if (!byDept[deptId]) byDept[deptId] = { gadmName: feature.properties.NAME_1, features: [] };
    byDept[deptId].features.push(feature);
}

const collectRings = (geometry) => {
    const rings = [];
    const pushPoly = (poly) => {
        for (const ring of poly) rings.push(ring);
    };
    if (geometry.type === 'Polygon') {
        pushPoly(geometry.coordinates);
    } else if (geometry.type === 'MultiPolygon') {
        for (const poly of geometry.coordinates) pushPoly(poly);
    }
    return rings;
};

const matchMunicipality = (deptId, gadmName) => {
    const ours = ourByDept[deptId];
    if (!ours) return null;
    const key = norm(gadmName);
    const candidates = [key, stripArticle(key), ...(ALIASES[key] || [])];
    for (const candidate of candidates) {
        const exact = ours.find((entry) => entry.normName === candidate);
        if (exact) return exact;
    }
    for (const candidate of candidates) {
        const relaxed = ours.find((entry) => stripArticle(entry.normName) === candidate);
        if (relaxed) return relaxed;
    }
    return null;
};

fs.mkdirSync(OUT_DIR, { recursive: true });

const indexEntries = [];
let totalMatched = 0;
let totalFeatures = 0;

for (const deptId of Object.keys(byDept).sort()) {
    const { gadmName, features } = byDept[deptId];
    const collection = { type: 'FeatureCollection', features };
    const projection = d3
        .geoMercator()
        .fitExtent([[PADDING, PADDING], [FILL_VIEW - PADDING, FILL_VIEW - PADDING]], collection);
    const geoPath = d3.geoPath(projection);

    const municipalities = features.map((feature) => {
        const rings = collectRings(feature.geometry);
        const d = rings
            .map((ring) => {
                const projectedRing = ring
                    .map(([lon, lat]) => {
                        const point = projection([lon, lat]);
                        return [point[0], point[1]];
                    })
                    .filter(([x, y]) => Number.isFinite(x) && Number.isFinite(y));
                if (projectedRing.length < 4) return null;
                // Drop the duplicated closing vertex before simplifying.
                const open =
                    projectedRing[0][0] === projectedRing[projectedRing.length - 1][0] &&
                    projectedRing[0][1] === projectedRing[projectedRing.length - 1][1]
                        ? projectedRing.slice(0, -1)
                        : projectedRing;
                const simplified = rdp(open, SIMPLIFY_TOL);
                if (simplified.length < 3) return null;
                return 'M' + simplified.map(([x, y]) => `${round(x)},${round(y)}`).join(' ') + 'z';
            })
            .filter(Boolean)
            .join('');
        if (!d) return null;
        const gadmName = feature.properties.NAME_2;
        let matched = matchMunicipality(deptId, gadmName);
        let displayName;
        if (matched) {
            displayName = matched.name;
        } else {
            // Municipality is not curated yet: add it to the catalog with a new
            // sequential id so the drill-down map and data catalog stay in sync.
            nextNumber[deptId] += 1;
            displayName = deconcat(gadmName);
            const newId = `${deptId}-${String(nextNumber[deptId]).padStart(3, '0')}`;
            if (!catalogByDept[deptId]) catalogByDept[deptId] = [];
            catalogByDept[deptId].push({ id: newId, name: displayName, departmentId: deptId });
            matched = { id: newId, name: displayName };
        }
        return { id: matched.id, name: displayName, d };
    }).filter(Boolean);

    const matchedCount = municipalities.filter((m) => m.id !== null).length;
    totalMatched += matchedCount;
    totalFeatures += municipalities.length;

    const lines = [];
    lines.push(`import type { MunicipalityPath } from '../municipalityPathTypes';`);
    lines.push('');
    lines.push(`export const departmentName = '${gadmName}';`);
    lines.push(`export const viewBox = '0 0 ${FILL_VIEW} ${FILL_VIEW}';`);
    lines.push('');
    lines.push(`export const municipalities: MunicipalityPath[] = [`);
    for (const municipality of municipalities) {
        const idLit = municipality.id === null ? 'null' : `'${municipality.id}'`;
        lines.push(`    { id: ${idLit}, name: '${municipality.name}', d: '${municipality.d}' },`);
    }
    lines.push('];');
    lines.push('');
    fs.writeFileSync(path.join(OUT_DIR, `${deptId}.ts`), lines.join('\n'));

    indexEntries.push({ deptId, gadmName, total: municipalities.length, matched: matchedCount });

    console.log(`${deptId} ${gadmName.padEnd(24)} → ${String(municipalities.length).padStart(4)} municipios, ${matchedCount} con id`);
}

// Manifest for verification.
const manifest = { count: totalFeatures, matched: totalMatched, departments: indexEntries };
fs.writeFileSync('/var/folders/d_/tg5h3wwx1z7f7tk06r71bxfh0000gp/T/opencode/colombia-map/manifest.json', JSON.stringify(manifest, null, 2));

// Index module with per-department metadata.
const idxLines = [];
idxLines.push(`export interface MunicipalityDeptInfo {`);
idxLines.push(`    id: string;`);
idxLines.push(`    name: string;`);
idxLines.push(`    municipalities: number;`);
idxLines.push(`    matched: number;`);
idxLines.push(`}`);
idxLines.push('');
idxLines.push(`export const municipalityDepts: MunicipalityDeptInfo[] = [`);
for (const entry of indexEntries) {
    idxLines.push(`    { id: '${entry.deptId}', name: '${entry.gadmName}', municipalities: ${entry.total}, matched: ${entry.matched} },`);
}
idxLines.push('];');
idxLines.push('');
fs.writeFileSync(path.join(OUT_DIR, 'index.ts'), idxLines.join('\n'));

// ---------------------------------------------------------------------------
// Regenerate the full municipality catalog data file. Curated entries keep
// their ids and order (capital first, so the default municipality is stable);
// GADM-only municipalities are appended with a fresh sequential id.
// ---------------------------------------------------------------------------
const deptOrder = [...fileDeptOrder, ...Object.keys(catalogByDept).filter((d) => !fileDeptOrder.includes(d))];

const muniLines = [];
muniLines.push(`/**`);
muniLines.push(` * Municipalities data organized by department code`);
muniLines.push(` * Each municipality has an ID, name, and reference to its department`);
muniLines.push(` *`);
muniLines.push(` * Generado por scripts/generate-municipality-map.mjs a partir de GADM 4.1.`);
muniLines.push(` * Los municipios curados conservan su id y orden; el resto usa ids secuenciales.`);
muniLines.push(` */`);
muniLines.push(``);
muniLines.push(`export interface MunicipalityData {`);
muniLines.push(`    id: string;`);
muniLines.push(`    name: string;`);
muniLines.push(`    departmentId: string;`);
muniLines.push(`}`);
muniLines.push(``);
muniLines.push(`export const municipalitiesByDepartment: Record<string, MunicipalityData[]> = {`);
for (const deptId of deptOrder) {
    const list = catalogByDept[deptId] || [];
    muniLines.push(`    '${deptId}': [`);
    for (const municipality of list) {
        muniLines.push(`        { id: '${municipality.id}', name: '${tsStr(municipality.name)}', departmentId: '${deptId}' },`);
    }
    muniLines.push(`    ],`);
}
muniLines.push(`};`);
muniLines.push(``);
muniLines.push(`/**`);
muniLines.push(` * Get all municipalities for a specific department`);
muniLines.push(` */`);
muniLines.push(`export const getMunicipalitiesForDepartment = (departmentId: string): MunicipalityData[] => {`);
muniLines.push(`    return municipalitiesByDepartment[departmentId] || [];`);
muniLines.push(`};`);
muniLines.push(``);
muniLines.push(`/**`);
muniLines.push(` * Default municipality for each department. This keeps the UX focused on the main city`);
muniLines.push(` * when a department modal opens, while still allowing a user to switch to other towns.`);
muniLines.push(` */`);
muniLines.push(`export const getDefaultMunicipalityForDepartment = (departmentId: string): string => {`);
muniLines.push(`    return getMunicipalitiesForDepartment(departmentId)[0]?.id ?? 'all';`);
muniLines.push(`};`);
muniLines.push(``);
muniLines.push(`/**`);
muniLines.push(` * Get a specific municipality by its ID`);
muniLines.push(` */`);
muniLines.push(`export const getMunicipalityById = (municipalityId: string): MunicipalityData | undefined => {`);
muniLines.push(`    for (const municipalities of Object.values(municipalitiesByDepartment)) {`);
muniLines.push(`        const municipality = municipalities.find(m => m.id === municipalityId);`);
muniLines.push(`        if (municipality) return municipality;`);
muniLines.push(`    }`);
muniLines.push(`    return undefined;`);
muniLines.push(`};`);
muniLines.push(``);
fs.writeFileSync('src/data/municipalitiesData.ts', muniLines.join('\n'));
console.log(`\nTotal: ${totalFeatures} municipios, ${totalMatched} con id de municipalitiesData.`);
console.log('municipalitiesData.ts regenerado con el catálogo completo.');