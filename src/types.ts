export interface Salary {
    id: string;
    start: Date;
    end: Date;
    hourly_amount: number;
    company_id: string;
}

export interface TransportationFee {
    id: string;
    start: Date;
    end: Date;
    daily_fee: number;
    company_id: string;
}

export interface Company {
    id: string;
    name: string;
    color_code: string;
}

export interface Shift {
    id: string;
    start_at: Date;
    end_at: Date;
    break_time: number;
    salary: number;
    transportation_fee: number;
    company_id: string;
}
