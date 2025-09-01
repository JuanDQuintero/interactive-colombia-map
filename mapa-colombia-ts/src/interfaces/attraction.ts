import type { User } from "./user";

export interface AttractionProposal {
    id: string;
    name: string;
    description: string;
    image: string;
    category: string;
    departmentId: string;
    status: 'pending' | 'approved' | 'rejected';
    createdAt: Date;
    userId?: string;
    userName?: string;
    userEmail?: string;
}

export interface Attraction {
    id: string;
    name: string;
    description: string;
    image: string;
    category: string;
    regionId: string;
    regionName: string;
    createdAt: Date;
    createdBy?: string;
    isUserProposal: boolean;
}

export interface FirestoreAttraction extends Attraction {
    firestoreId: string;
}

export interface AdminPageProps {
    user: User;
}