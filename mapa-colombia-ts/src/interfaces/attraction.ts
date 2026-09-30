import type { User } from "./user";

export interface AttractionProposal {
    id: string;
    name: string;
    description: string;
    image: string;
    imageSource: 'url' | 'upload';
    category: string;
    categoryValue: string;
    departmentId: string;
    municipalityId?: string;
    municipalityName?: string;
    status: 'pending' | 'approved' | 'rejected';
    createdAt: Date;
    userId: string;
    userName: string;
    userEmail: string | null;
    latitude?: number;
    longitude?: number;
    rejectionReason?: string;
}

export interface AttractionProposalInput {
    name: string;
    description: string;
    image: string;
    imageSource: 'url' | 'upload';
    category: string;
    categoryValue: string;
    departmentId: string;
    municipalityId?: string;
    municipalityName?: string;
    status: 'pending' | 'approved' | 'rejected';
    createdAt: Date;
    userId: string;
    userName: string;
    userEmail: string | null;
    latitude?: number;
    longitude?: number;
}

export interface Attraction {
    id: string;
    name: string;
    description: string;
    image: string;
    category: string;
    regionId: string;
    regionName: string;
    latitude?: number;
    longitude?: number;
    createdAt: Date;
    createdBy?: string;
    isUserProposal: boolean;
    municipalityId?: string; // Reference to municipality for future filtering capability
    municipalityName?: string; // Municipality name for display
}

export interface FirestoreAttraction extends Attraction {
    firestoreId: string;
}

export interface AdminPageProps {
    user: User;
}