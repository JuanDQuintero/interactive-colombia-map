
export interface Attraction {
    id: string;
    name: string;
    description: string;
    image: string;
    category: string;
}

export type AttractionsData = Record<string, Attraction[]>;
