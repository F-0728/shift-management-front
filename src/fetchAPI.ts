import axios from "axios";
import { Company, Salary, Shift, TransportationFee } from "./types";

const axiosGet = axios.create({
    baseURL: "http://127.0.0.1:8000/api",
    headers: {
        "Content-Type": "application/x-www-form-urlencoded",
        "Access-Control-Allow-Origin": "*",
    },
});

const fetchShifts = async () => {
    try {
        const response = await axiosGet.get("/shifts");
        return response.data;
    } catch (error) {
        console.error(error);
        return [];
    }
};

const fetchCompanies = async () => {
    try {
        const response = await axiosGet.get("/companies");
        return response.data;
    } catch (error) {
        console.error(error);
        return [];
    }
};

const fetchSalaries = async () => {
    try {
        const response = await axiosGet.get("/salaries");
        return response.data;
    } catch (error) {
        console.error(error);
        return [];
    }
}

const fetchTransportationFees = async () => {
    try {
        const response = await axiosGet.get("/transportation_fees");
        return response.data;
    } catch (error) {
        console.error(error);
        return [];
    }
}

export const shifts: Shift[] = await fetchShifts();
export const companies: Company[] = await fetchCompanies();
export const salaries: Salary[] = await fetchSalaries();
export const transportationFees: TransportationFee[] = await fetchTransportationFees();
