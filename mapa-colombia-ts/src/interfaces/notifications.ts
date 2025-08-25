export interface Notification {
    id: string;
    message: string;
    read: boolean;
    createdAt: Date;
    type: string;
    proposalId: string;
    userId: string;
}