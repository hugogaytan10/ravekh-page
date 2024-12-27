export interface Employee {
    Id?: number;
    Role: string;
    Business_Id?: number;
    Name?: string;
    Email: string;
    Password: string;
    Pin: string;
    Token?: string;
    Payment?: number; 
    PaymentDate?: string;
    Plan?: string;
    Advice: boolean;
}