export interface Attraction {
    id: string;
    name: string;
    description: string;
    image: string;
    category: string;
}

export const attractionsData: Record<string, Attraction[]> = {
    "CO-ANT": [
        {
            id: "guatape",
            name: "Piedra del Peñol, Guatapé",
            description: "Un monolito de 220 metros de altura con vistas espectaculares del embalse.",
            image: "https://images.unsplash.com/photo-1634602771420-a6314ff9bfc0?q=80&w=2367&auto=format&fit=crop&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D",
            category: "Naturaleza y Aventura"
        },
        {
            id: "parque_arvi",
            name: "Parque Arví",
            description: "Reserva natural y parque ecoturístico con senderos y bosques de niebla.",
            image: "https://media.istockphoto.com/id/579123364/photo/small-colorful-covered-wooden-bridge-parque-arvi-medellin-colombia.webp?a=1&b=1&s=612x612&w=0&k=20&c=iEcifE8LUIpzd1VictyzFlocEAYIMW1P_Mv37zi8fS0=",
            category: "Ecoturismo"
        },
        {
            id: "comuna_13",
            name: "Comuna 13, Medellín",
            description: "Vibrante barrio conocido por su arte callejero, escaleras eléctricas y transformación social.",
            image: "https://media.istockphoto.com/id/1042287894/photo/comuna-13-in-medellin-colombia.webp?a=1&b=1&s=612x612&w=0&k=20&c=qenY4PSLbfp4di1GYkXoEMXF5ZufX80Ig1xzvq2GtTs=",
            category: "Cultura e Historia"
        },
    ],
    "CO-BOL": [
        {
            id: "ciudad_amurallada",
            name: "Ciudad Amurallada, Cartagena",
            description: "El centro histórico de Cartagena, con calles coloridas y arquitectura colonial.",
            image: "https://media.istockphoto.com/id/2178382297/photo/beautiful-aerial-view-of-the-walled-city-of-cartagena-its-majestic-cathedral-the-plaza-its.webp?a=1&b=1&s=612x612&w=0&k=20&c=j9jLF2RxLwmBcaOTyT2vMRjH8GCngc5WzXnOzkgV-Eo=",
            category: "Cultura e Historia"
        },
        {
            id: "islas_rosario",
            name: "Islas del Rosario",
            description: "Archipiélago caribeño con aguas cristalinas, arrecifes de coral y playas de arena blanca.",
            image: "https://media.istockphoto.com/id/1180424475/photo/image-of-the-rosario-islands-its-an-archipelago-comprising-27-islands-located-about-two-hours.webp?a=1&b=1&s=612x612&w=0&k=20&c=F5UEIPWS51nZF-ojxm-bYpgklp56RqHAHxj0Pl6WczY=",
            category: "Naturaleza y Aventura"
        },
    ],
};