import axios from "axios";

export const api = axios.create({
  baseURL: "https://project-management-api.rohanupreti4.workers.dev/",
  timeout: 100000,
  headers: {
    "Content-Type": "application/json",
  },
});
