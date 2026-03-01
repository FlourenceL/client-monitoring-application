export interface CreateClientDTO {
    Client: string;
    ContactInfo: string;
    DateInstalled: string;
    PlanId: number;
    UserId: number;
    IsActive: boolean;
    LocationId: number;
}

export interface UpdateClientDTO {
    Client: string;
    ContactInfo: string;
    DateInstalled: string;
    PlanId: number;
    IsActive: boolean;
}