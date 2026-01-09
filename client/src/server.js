import axios from "axios";

const server = axios.create({
  baseURL: "https://ecdsa-node-tabb.onrender.com",
});

export default server;
