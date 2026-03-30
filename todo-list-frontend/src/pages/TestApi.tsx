import { useEffect, useState } from "react";
import api from "../services/api";

export default function TestApi() {
  const [message, setMessage] = useState("");

  useEffect(() => {
    api.get("/auth/test")
      .then(res => setMessage(res.data.message))
      .catch(err => setMessage(err.response?.data?.message || "Error"));
  }, []);

  return <div>Mensaje del backend: {message}</div>;
}