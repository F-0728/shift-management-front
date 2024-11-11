"use client";

import { DatePicker } from "@mui/x-date-pickers/DatePicker";
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider';
import { AdapterDayjs } from '@mui/x-date-pickers/AdapterDayjs';
import dayjs, { Dayjs } from "dayjs";

interface DatePickerProps {
    label: string;
    value: Dayjs | null;
    views: ("year" | "month" | "day")[];
    onChange: (newValue: Dayjs | null) => void;
}

export const DatePickerComponent = ({ label, value, views, onChange }: DatePickerProps) => {
    return (
        <LocalizationProvider dateAdapter={AdapterDayjs}>
            <DatePicker
                label={label}
                value={value}
                views={views}
                onChange={onChange}
            />
        </LocalizationProvider>
    );
}
