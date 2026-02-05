import axios from "axios";

const server = axios.create({
  baseURL:
    import.meta.env.VITE_SERVER_URL || "https://ecdsa-node-tabb.onrender.com",
});

export default server;
