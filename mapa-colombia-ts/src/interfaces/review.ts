export interface AttractionReview {
    id: string;
    attractionId: string;
    userId: string;
    userName: string;
    userPhotoURL: string;
    rating: number;
    comment: string;
    createdAt: Date;
}
