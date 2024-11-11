"use client";

import { Button, FormHelperText, Input, InputLabel, MenuItem, Select, Stack, Switch, Table, TableBody, TableCell, TableContainer, TableHead, TableRow } from "@mui/material";
import { Alert } from "@mui/material";
import { TimePicker } from "@mui/x-date-pickers/TimePicker";
import AddBoxIcon from '@mui/icons-material/AddBox';
import ArrowBackIosNewIcon from '@mui/icons-material/ArrowBackIosNew';

import dayjs, { Dayjs } from "dayjs";
import { useState } from "react";
import axios from "axios";

import Calendar from "../components/calendar";
import { companies, salaries, transportationFees } from "@/fetchAPI";
import { LocalizationProvider } from "@mui/x-date-pickers";
import { AdapterDayjs } from "@mui/x-date-pickers/AdapterDayjs";

const axiosPost = axios.create({
    baseURL: "http://127.0.0.1:8000/api",
    headers: {
        "Content-Type": "application/x-www-form-urlencoded",
        "Access-Control-Allow-Origin": "*",
    },
});

export default function Page() {
    const [start, setStart] = useState<Dayjs>(dayjs());
    const [end, setEnd] = useState<Dayjs>(dayjs());
    const [company, setCompany] = useState<string>(
        companies.length > 0 ? companies[0].id : ""
    );
    const [isRemote, setIsRemote] = useState<boolean>(false);
    const [breakTime, setBreakTime] = useState<number>(
        (start?.hour() ?? 0) < 12 && (end?.hour() ?? 0) >= 13 ? 60 : 0
    );
    const [hasOvertime, setHasOvertime] = useState<boolean>(false);
    const [specSalary, setSpecSalary] = useState<number | null>(null);

    const findSalary = (company: string, date: Dayjs) => {
        const filteredSalaries = salaries.filter((salary) => salary.company_id === company);
        const salary = filteredSalaries.find((salary) => {
            const startDate = dayjs(salary.start);
            const endDate = dayjs(salary.end);
            return startDate.isBefore(date) && endDate.isAfter(date);
        });
        return salary?.hourly_amount ?? 0;
    }
    const findTransportationFee = (company: string, date: Dayjs) => {
        const filteredTransportationFees = transportationFees.filter((transportationFee) => transportationFee.company_id === company);
        const transportationFee = filteredTransportationFees.find((transportationFee) => {
            const startDate = dayjs(transportationFee.start);
            const endDate = dayjs(transportationFee.end);
            return startDate.isBefore(date) && endDate.isAfter(date);
        });
        return transportationFee?.daily_fee ?? 0;
    }

    const calcSalary = (start: Dayjs, end: Dayjs, breakTime: number, company: string, specSalary: (number | null), hasOvertime: boolean) => {
        if (specSalary) {
            return specSalary;
        }
        const salary = findSalary(company, start);
        const workTime = (end.diff(start, "minute") ?? 0) - breakTime;
        if (hasOvertime) {
            return Math.ceil(salary * 8 + salary * 1.25 * ((end.diff(start, "minute") ?? 0) - 8 * 60) / 60);
        } else {
            return Math.ceil(salary * workTime / 60);
        }
    }

    const createData = (
        company: string,
        start: Dayjs,
        end: Dayjs,
        workTime: number,
        salary: number,
        transportationFee: number
    ) => {
        return { company, start, end, workTime, salary, transportationFee };
    }

    const row = createData(
        companies.find((c) => c.id === company)?.name ?? "",
        start ?? dayjs(),
        end ?? dayjs(),
        (end?.diff(start, "minute") ?? 0) - breakTime,
        calcSalary(start ?? dayjs(), end ?? dayjs(), breakTime, company, specSalary, hasOvertime),
        isRemote ? 0 : findTransportationFee(company, start ?? dayjs())
    )

    const handleRegister = () => {
        axiosPost.post("/shifts/", {
            start_at: start?.format("YYYY-MM-DD HH:mm:ss"),
            end_at: end?.format("YYYY-MM-DD HH:mm:ss"),
            break_time: breakTime,
            salary: row.salary,
            transportation_fee: row.transportationFee,
            company_id: company
        }).then((response) => {
            console.log(response);
        }).catch((error) => {
            console.error(error);
        });
    }

    return (
        <>
            <Button href="/" variant="outlined" color="primary"
                startIcon={
                    <ArrowBackIosNewIcon />
                }>もどる</Button>
            <Stack spacing={2} direction="row" display="flex" alignContent="center">
                <Calendar
                    value={start}
                    onChange={(newValue) => { if(newValue) setStart(newValue), setEnd(newValue) }}
                />
                <Stack spacing={2}>
                    <Stack spacing={2} direction="row">
                        <LocalizationProvider dateAdapter={AdapterDayjs}>
                            <TimePicker
                                value={start}
                                onChange={(newValue) => {
                                    if (!newValue) return;
                                    setStart(newValue);
                                    if (newValue) {
                                        setBreakTime(
                                            (newValue.hour() ?? 0) < 12 && (end?.hour() ?? 0) >= 13 ? 60 : 0
                                        );
                                    }
                                }
                                }
                                views={["hours", "minutes"]}
                                ampm={false}
                            />
                        </LocalizationProvider>
                        <FormHelperText>--</FormHelperText>
                        <LocalizationProvider dateAdapter={AdapterDayjs}>
                            <TimePicker
                                value={end}
                                onChange={(newValue) => {
                                    if (!newValue) return;
                                    setEnd(newValue);
                                    if (newValue) {
                                        setBreakTime(
                                            (start?.hour() ?? 0) < 12 && (newValue.hour() ?? 0) >= 13 ? 60 : 0
                                        );
                                    }
                                }
                                }
                                views={["hours", "minutes"]}
                                ampm={false}
                            />
                        </LocalizationProvider>
                    </Stack>
                    <Select
                        value={company}
                        onChange={(e) => setCompany(e.target.value as string)}
                    >
                        {companies.map((company) => (
                            <MenuItem key={company.id} value={company.id}>{company.name}</MenuItem>
                        ))}
                    </Select>
                    <Stack spacing={2} direction="row">
                        <FormHelperText color="textSecondary">リモート(交通費なし)</FormHelperText>
                        <Switch
                            checked={isRemote}
                            onChange={(e) => setIsRemote(e.target.checked)}
                        />
                        <FormHelperText color="textSecondary">残業あり(8時間, 1.25倍)</FormHelperText>
                        <Switch
                            checked={hasOvertime}
                            onChange={(e) => setHasOvertime(!hasOvertime)}
                        />
                    </Stack>
                    <InputLabel>休憩時間(分)</InputLabel>
                    <Input defaultValue={breakTime} onChange={
                        (e) => setBreakTime(Number(e.target.value))
                    } />
                    <InputLabel>給与手動入力</InputLabel>
                    <Input
                        defaultValue={specSalary} onChange={
                            (e) => setSpecSalary(Number(e.target.value))
                        } />
                </Stack>
            </Stack>
            <Stack spacing={2} margin={5} display="flex" >
                {end.diff(start, "minute") > 8 * 60 &&
                    <Alert severity="info">勤務時間が8時間を超過しています．残業代を考慮する必要がある場合は「残業あり」を設定してください．</Alert>
                }
            </Stack>
            <TableContainer>
                <Table>
                    <TableHead>
                        <TableRow>
                            <TableCell>会社</TableCell>
                            <TableCell>開始時刻</TableCell>
                            <TableCell>終了時刻</TableCell>
                            <TableCell>稼働時間</TableCell>
                            <TableCell>給与</TableCell>
                            <TableCell>交通費</TableCell>
                            <TableCell>合計</TableCell>
                        </TableRow>
                    </TableHead>
                    <TableBody>
                        <TableRow>
                            <TableCell>{row.company}</TableCell>
                            <TableCell>{row.start.format("HH:mm")}</TableCell>
                            <TableCell>{row.end.format("HH:mm")}</TableCell>
                            <TableCell>{Math.floor(row.workTime / 60)}時間{row.workTime % 60}分</TableCell>
                            <TableCell>{row.salary}円</TableCell>
                            <TableCell>{row.transportationFee}円</TableCell>
                            <TableCell>{row.salary + row.transportationFee}円</TableCell>
                        </TableRow>
                    </TableBody>
                </Table>
            </TableContainer>
            <Stack spacing={2} margin={5} display="flex" alignContent="flex-end">
                <Button color="success" variant="contained" size="large" style={{ maxWidth: '200px' }}
                    startIcon={<AddBoxIcon />}
                    onClick={() => {
                        handleRegister();
                        window.location.reload();
                    }}
                >シフト登録</Button>
            </Stack>
        </>
    );
}
