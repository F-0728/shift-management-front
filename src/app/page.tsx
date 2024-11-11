"use client";

import Tab from "@mui/material/Tab";
import Box from "@mui/material/Box";
import TabContext from "@mui/lab/TabContext";
import TabList from "@mui/lab/TabList";
import TabPanel from "@mui/lab/TabPanel";

import Table from "@mui/material/Table";
import TableBody from "@mui/material/TableBody";
import TableCell from "@mui/material/TableCell";
import TableContainer from "@mui/material/TableContainer";
import TableHead from "@mui/material/TableHead";
import TableRow from "@mui/material/TableRow";

import Button from "@mui/material/Button";
import Stack from "@mui/material/Stack";

import AddBoxIcon from "@mui/icons-material/AddBox";

import dayjs, { Dayjs } from "dayjs";
import { useState } from "react";
import isSameOrAfter from "dayjs/plugin/isSameOrAfter";
import isSameOrBefore from "dayjs/plugin/isSameOrBefore";
dayjs.extend(isSameOrAfter);
dayjs.extend(isSameOrBefore);

import { Company, Shift } from "../types";
import { companies, shifts } from "../fetchAPI";
import { DatePickerComponent } from "./components/datepicker";
import Calendar from "./components/calendar";

import "./base.css";

const createData = (
  companyName: string,
  workTime: number,
  salary: number,
  transportationFee: number,
  sum: number
) => {
  return { companyName, workTime, salary, transportationFee, sum };
}

const createShiftData = (
  companyName: string,
  startAt: string,
  endAt: string,
  workTime: string,
  salary: number,
  transportationFee: number,
  sum: number
) => {
  return { companyName, startAt, endAt, workTime, salary, transportationFee, sum };
}

export default function Home() {
  // タブ選択
  const [tabSelect, setTabSelect] = useState('0');
  const handleChange = (event: React.SyntheticEvent, newValue: string) => {
    setTabSelect(newValue);
  }

  // 月、年
  const [startM, setStartM] = useState<Dayjs | null>(dayjs().startOf("month"));
  const [endM, setEndM] = useState<Dayjs | null>(dayjs().endOf("month"));
  const [startY, setStartY] = useState<Dayjs | null>(dayjs().startOf("year"));
  const [endY, setEndY] = useState<Dayjs | null>(dayjs().endOf("year"));
  const start = tabSelect === '0' ? startM : startY;
  const end = tabSelect === '0' ? endM : endY;

  // カレンダー
  const [selectedDate, setSelectedDate] = useState<Dayjs | null>(dayjs());

  const SalarySum = new Map<string, number>();
  const TFeeSum = new Map<string, number>();
  const WorkTimeSum = new Map<string, number>();

  const filteredShifts = shifts.filter((shift: Shift) => {
    return (dayjs(shift.start_at).isSameOrAfter(start) && dayjs(shift.end_at).isSameOrBefore(end));
  });

  filteredShifts.forEach((shift: Shift) => {
    if (SalarySum.has(shift.company_id)) {
      const nowSalary = SalarySum.get(shift.company_id) ?? 0;
      SalarySum.set(shift.company_id, nowSalary + shift.salary);
    } else {
      SalarySum.set(shift.company_id, shift.salary);
    }

    if (TFeeSum.has(shift.company_id)) {
      const nowTFee = TFeeSum.get(shift.company_id) ?? 0;
      TFeeSum.set(shift.company_id, nowTFee + shift.transportation_fee);
    } else {
      TFeeSum.set(shift.company_id, shift.transportation_fee);
    }

    if (WorkTimeSum.has(shift.company_id)) {
      const workTimeM = dayjs(shift.end_at).diff(dayjs(shift.start_at), "minute") - shift.break_time;
      const nowWorkTime = WorkTimeSum.get(shift.company_id) ?? 0;
      WorkTimeSum.set(shift.company_id, nowWorkTime + workTimeM);
    } else {
      const workTimeM = dayjs(shift.end_at).diff(dayjs(shift.start_at), "minute") - shift.break_time;
      WorkTimeSum.set(shift.company_id, workTimeM);
    }
  });

  let rows = companies.map((company: Company) => {
    const workTime = WorkTimeSum.get(company.id) ?? 0;
    const salary = SalarySum.get(company.id) ?? 0;
    const transportationFee = TFeeSum.get(company.id) ?? 0;
    const sum = salary + transportationFee;
    return createData(company.name, workTime, salary, transportationFee, sum);
  });

  // 合計計算
  const totalWorkTime = rows.reduce((acc: number, row: any) => acc + row.workTime, 0);
  const totalSalary = rows.reduce((acc: number, row: any) => acc + row.salary, 0);
  const totalTransportationFee = rows.reduce((acc: number, row: any) => acc + row.transportationFee, 0);
  const totalSum = totalSalary + totalTransportationFee;
  rows.push(createData("合計", totalWorkTime, totalSalary, totalTransportationFee, totalSum));

  // 1日ごと
  const filteredShiftsByDate = filteredShifts.filter((shift: Shift) => {
    return (dayjs(shift.start_at).isSame(selectedDate, "day"));
  });

  const rowsByDate = filteredShiftsByDate.map((shift: Shift) => {
    const companyName = companies.find((company: Company) => company.id === shift.company_id)?.name ?? "";
    const startAt = dayjs(shift.start_at).format("HH:mm");
    const endAt = dayjs(shift.end_at).format("HH:mm");
    const workTimeMinutes = dayjs(shift.end_at).diff(dayjs(shift.start_at), "minute") - shift.break_time;
    const workTime = `${Math.floor((workTimeMinutes ?? 0) / 60)}時間${(workTimeMinutes ?? 0) % 60}分`;
    return createShiftData(companyName, startAt, endAt, workTime, shift.salary, shift.transportation_fee, shift.salary + shift.transportation_fee);
  });

  return (
    <div>
      <Box sx={{ width: '100%', typography: 'body1' }}>
        <TabContext value={tabSelect}>
          <Box sx={{ borderBottom: 1, borderColor: 'divider' }}>
            <TabList onChange={handleChange}>
              <Tab label="月" value="0" />
              <Tab label="年" value="1" />
              <Tab label="カレンダー" value="2" />
            </TabList>
          </Box>

          <TabPanel value="0">
            <Stack direction="row" spacing={2}>
              <Button variant="outlined" onClick={
                () => {
                  setStartM(dayjs(start).subtract(1, "month").startOf("month"))
                  setEndM(dayjs(end).subtract(1, "month").endOf("month"))
                }
              }>prev</Button>
              <DatePickerComponent label="範囲変更" value={start} views={["month", "year"]} onChange={
                (newValue: Dayjs | null) => {
                  if (newValue) {
                    setStartM(newValue.startOf("month"));
                    setEndM(newValue.endOf("month"));
                  }
                }
              } />
              <Button variant="outlined" onClick={
                () => {
                  setStartM(dayjs(start).add(1, "month").startOf("month"))
                  setEndM(dayjs(end).add(1, "month").endOf("month"))
                }
              }>next</Button>
            </Stack>
            <TableContainer>
              <Table>
                <TableHead>
                  <TableRow>
                    <TableCell>会社</TableCell>
                    <TableCell>稼働時間</TableCell>
                    <TableCell>給与</TableCell>
                    <TableCell>交通費</TableCell>
                    <TableCell>合計</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {rows.map((row: any) => (
                    <TableRow key={row.companyName}>
                      <TableCell>{row.companyName}</TableCell>
                      <TableCell>{Math.floor((row.workTime ?? 0) / 60)}時間{(row.workTime ?? 0) % 60}分</TableCell>
                      <TableCell>{row.salary}</TableCell>
                      <TableCell>{row.transportationFee}</TableCell>
                      <TableCell>{row.sum}</TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </TableContainer>
          </TabPanel>

          <TabPanel value="1">
            <Stack direction="row" spacing={2}>
              <Button variant="outlined" onClick={
                () => {
                  setStartY(dayjs(start).subtract(1, "year").startOf("year"))
                  setEndY(dayjs(end).subtract(1, "year").endOf("year"))
                }
              }>prev</Button>
              <DatePickerComponent label="範囲変更" value={start} views={["year"]} onChange={
                (newValue: Dayjs | null) => {
                  if (newValue) {
                    setStartY(newValue.startOf("year"));
                    setEndY(newValue.endOf("year"));
                  }
                }
              } />
              <Button variant="outlined" onClick={
                () => {
                  setStartY(dayjs(start).add(1, "year").startOf("year"))
                  setEndY(dayjs(end).add(1, "year").endOf("year"))
                }
              }>next</Button>
            </Stack>
            <TableContainer>
              <Table>
                <TableHead>
                  <TableRow>
                    <TableCell>会社</TableCell>
                    <TableCell>稼働時間</TableCell>
                    <TableCell>給与</TableCell>
                    <TableCell>交通費</TableCell>
                    <TableCell>合計</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {rows.map((row: any) => (
                    <TableRow key={row.companyName}>
                      <TableCell>{row.companyName}</TableCell>
                      <TableCell>{Math.floor((row.workTime ?? 0) / 60)}時間{(row.workTime ?? 0) % 60}分</TableCell>
                      <TableCell>{row.salary}</TableCell>
                      <TableCell>{row.transportationFee}</TableCell>
                      <TableCell>{row.sum}</TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </TableContainer>
          </TabPanel>

          <TabPanel value="2">
            <Stack direction="row" justifyContent="flex-end" spacing={10}>
              <Button variant="contained" size="large" color="success" startIcon={<AddBoxIcon />} href="/register">
                シフト新規入力
              </Button>
            </Stack>
            <Calendar value={selectedDate} onChange={(newValue: Dayjs | null) => setSelectedDate(newValue)}/>
            <TableContainer>
              <Table>
                <TableHead>
                  <TableRow>
                    <TableCell>会社</TableCell>
                    <TableCell>開始</TableCell>
                    <TableCell>終了</TableCell>
                    <TableCell>稼働時間</TableCell>
                    <TableCell>給与</TableCell>
                    <TableCell>交通費</TableCell>
                    <TableCell>合計</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {rowsByDate.map((row: any) => (
                    <TableRow key={row.companyName}>
                      <TableCell>{row.companyName}</TableCell>
                      <TableCell>{row.startAt}</TableCell>
                      <TableCell>{row.endAt}</TableCell>
                      <TableCell>{row.workTime}</TableCell>
                      <TableCell>{row.salary}</TableCell>
                      <TableCell>{row.transportationFee}</TableCell>
                      <TableCell>{row.sum}</TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </TableContainer>
          </TabPanel>
        </TabContext>
      </Box>
    </div>
  );
}
