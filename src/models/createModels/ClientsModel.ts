export interface CreateClientDTO {
    Client: string;
    ContactInfo: string;
    DateInstalled: string;
    PlanId: number;
    UserId: number;
    IsActive: boolean;   
}

export interface UpdateClientDTO {
    Client: string;
    ContactInfo: string;
    DateInstalled: string;
    PlanId: number;
    IsActive: boolean;
}