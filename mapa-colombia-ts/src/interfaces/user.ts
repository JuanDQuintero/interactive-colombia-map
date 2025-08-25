export interface User {
    id: string;
    email: string;
    displayName: string;
    photoURL?: string;
    isAdmin: boolean;
    lastLogin?: Date;
}

export interface UserData {
    uid: string;
    email: string;
    displayName: string;
    photoURL?: string;
    createdAt: Date;
    lastLogin: Date;
    isAdmin: boolean;
    visitedAttractions?: {
        [departmentId: string]: string[];
    };
}

export interface UserVisit {
    attractionId: string;
    visitedAt: Date;
    departmentId: string;
}