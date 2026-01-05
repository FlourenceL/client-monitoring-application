export interface CreateClientDTO {
    Client: string;
    ContactInfo: string;
    DateInstalled: Date;
    PlanId: number;
    IsActive: boolean;
}

export interface UpdateClientDTO {
    Client: string;
    ContactInfo: string;
    DateInstalled: Date;
    PlanId: number;
    IsActive: boolean;
}