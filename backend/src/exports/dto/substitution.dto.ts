export class SubstitutionDto {
    id: string;
    exportManager: {
        id: string;
        first_name: string;
        last_name: string;
        email: string;
    };
    substitute: {
        id: string;
        first_name: string;
        last_name: string;
        email: string;
    };
    start_date: Date;
    end_date: Date;
    is_active: boolean;
    createdBy?: {
        id: string;
        first_name: string;
        last_name: string;
    };
    created_at: Date;
}