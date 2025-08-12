import { getAttractionsData } from "../firebase";

export interface Attraction {
    id: string;
    name: string;
    description: string;
    image: string;
    category: string;
}

type AttractionsData = Record<string, Attraction[]>;

export async function loadAttractions(): Promise<AttractionsData> {
    const data = await getAttractionsData();
    return data as AttractionsData;
}