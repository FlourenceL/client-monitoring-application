export interface CreateCollectionDTO {
    UserId: number;
    ClientId: number;
    LocationId: number;
    StatusId: number;
    PaymentMethodId: number;
    BillingMonth: string;
    AmountDue: number;
    AmountPaid: number;
    PaymentDate: Date;
    CreateDate: Date;
}