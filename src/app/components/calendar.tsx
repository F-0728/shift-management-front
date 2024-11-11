import { PickersDay, PickersDayProps } from '@mui/x-date-pickers/PickersDay';
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider';
import { AdapterDayjs } from '@mui/x-date-pickers/AdapterDayjs';
import { Dayjs } from "dayjs";
import React, { useEffect } from "react";
import Badge from "@mui/material/Badge";
import { DateCalendar } from "@mui/x-date-pickers/DateCalendar";
import dayjs from "dayjs";

import { shifts } from "@/fetchAPI";

interface CalendarProps {
    value: Dayjs | null;
    onChange: (newValue: Dayjs | null) => void;
}

const highlight = (props: PickersDayProps<Dayjs> & { highlightedDates?: number[] }) => {
    const { day, highlightedDates, ...other } = props;
    const isHighlighted = highlightedDates?.includes(day.date()) && !props.outsideCurrentMonth;

    return (
        <Badge
            key={day.toString()}
            overlap="circular"
            badgeContent={isHighlighted ? '•' : undefined}
            color="primary"
        >
            <PickersDay day={day} {...other} />
        </Badge>
    );
};

const Calendar = ({ value, onChange }: CalendarProps) => {
    const [highlightDates, setHighlightDates] = React.useState<number[]>([]);

    useEffect(() => {
        if (value) {
            const filteredShifts = shifts.filter(
                shift => dayjs(shift.start_at).month() === value.month() && dayjs(shift.start_at).year() === value.year()
            );
            setHighlightDates(filteredShifts.map(shift => dayjs(shift.start_at).date()));
        }
    }, [value]);

    return (
        <LocalizationProvider dateAdapter={AdapterDayjs}>
            <DateCalendar
                value={value}
                onChange={onChange}
                onMonthChange={ month => setHighlightDates(
                    shifts.filter(
                        shift => dayjs(shift.start_at).month() === month.month() && dayjs(shift.start_at).year() === month.year()
                    ).map(shift => dayjs(shift.start_at).date()
                ))}
                slots={{ day: (dayProps) => highlight({ ...dayProps, highlightedDates: highlightDates }) }}
            />
        </LocalizationProvider>
    );
};

export default Calendar;
