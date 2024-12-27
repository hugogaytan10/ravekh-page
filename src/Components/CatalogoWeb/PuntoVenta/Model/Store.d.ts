export type Store = {
    Id?: number; // int AI PK
    Taxes_Id?: number | null; // int
    Name: string; // varchar(45)
    PhoneNumber: string | null; // varchar(12)
    Address: string; // varchar(100)
    References: string | null; // varchar(100)
    Color: string; // varchar(12)
    Logo: string | null; // longtext
    Plan?: string; // varchar(45)
    Payment?: number; 
    PaymentDate?: string; // date
}