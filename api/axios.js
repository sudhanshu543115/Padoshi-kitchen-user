import axios from "axios";

const api = axios.create({
    baseURL: "https://padoshi-kitchen-b.onrender.com/api/v1/",
    headers: {
        "Content-Type": "application/json",
    },
});
api.interceptors.request.use((config) => {
    const token = typeof window !== "undefined"
        ? localStorage.getItem("accessToken")
        : null;

    if (token) {
        config.headers.Authorization = `Bearer ${token}`;
    }

    return config;
});

export default api;



// GET /notifications
// Accept request	POST /connect/accept
// Reject request	POST /connect/reject
// View profile	GET /profile/:id