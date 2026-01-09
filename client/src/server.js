import axios from "axios";

const server = axios.create({
  baseURL: process.env.REACT_APP_SERVER_URL,
});

export default server;
