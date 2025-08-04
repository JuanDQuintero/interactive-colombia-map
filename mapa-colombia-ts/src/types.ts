// src/types.ts
import type { User } from "firebase/auth";

export interface DepartmentData {
    name: string;
    path: string;
}

export interface ColombiaMapProps {
    visitedDepartments: Set<string>;
    onDepartmentClick: (id: string) => void;
    onDepartmentHover: (name: string | null) => void;
}

export interface AuthComponentProps {
    user: User | null;
    onLogin: () => void;
    onLogout: () => void;
}