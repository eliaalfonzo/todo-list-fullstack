import { useForm } from "react-hook-form";
import { useState } from "react";
import api from "../services/api";
import { useNavigate } from "react-router-dom";

interface LoginForm {
  email: string;
  password: string;
}

export default function Login() {
  const { register, handleSubmit } = useForm<LoginForm>();
  const [error, setError] = useState<string>("");
  const navigate = useNavigate();

  const onSubmit = async (data: LoginForm) => {
    setError("");
    try {
      const res = await api.post("/auth/login", data);

      if (!res.data.token) {
        throw new Error("No se recibió token del servidor");
      }

      localStorage.setItem("token", res.data.token);
      navigate("/dashboard");
    } catch (err: any) {
      setError(
        err.response?.data?.message ||
          err.message ||
          "Error al iniciar sesión"
      );
    }
  };

  return (
    <div
      style={{
        minHeight: "100vh",
        backgroundColor: "#f3f8f6",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        fontFamily: "sans-serif",
      }}
    >
      <div
        style={{
          width: "100%",
          maxWidth: 400,
          background: "#ffffff",
          padding: 30,
          borderRadius: 12,
          boxShadow: "0 8px 25px rgba(0,0,0,0.05)",
        }}
      >
        <h2
          style={{
            marginBottom: 5,
            fontWeight: 600,
            color: "#1f2937",
          }}
        >
          Bienvenido
        </h2>

        <p
          style={{
            marginBottom: 25,
            color: "#6b7280",
            fontSize: 14,
          }}
        >
          Inicia sesión para continuar con tus tareas
        </p>

        <form
          onSubmit={handleSubmit(onSubmit)}
          style={{
            display: "flex",
            flexDirection: "column",
            gap: 16,
          }}
        >
          {/* EMAIL */}
          <div style={{ display: "flex", flexDirection: "column" }}>
            <label
              style={{
                fontSize: 13,
                color: "#374151",
                marginBottom: 4,
              }}
            >
              Email
            </label>
            <input
              type="email"
              {...register("email")}
              placeholder="usuario@gmail.com"
              required
              style={{
                width: "100%",
                padding: "12px",
                borderRadius: 8,
                border: "1px solid #d1d5db",
                outline: "none",
                fontSize: 14,
                boxSizing: "border-box",
              }}
            />
          </div>

          {/* PASSWORD */}
          <div style={{ display: "flex", flexDirection: "column" }}>
            <label
              style={{
                fontSize: 13,
                color: "#374151",
                marginBottom: 4,
              }}
            >
              Contraseña
            </label>
            <input
              type="password"
              {...register("password")}
              placeholder="********"
              required
              style={{
                width: "100%",
                padding: "12px",
                borderRadius: 8,
                border: "1px solid #d1d5db",
                outline: "none",
                fontSize: 14,
                boxSizing: "border-box",
              }}
            />
          </div>

          {/* ERROR */}
          {error && (
            <p
              style={{
                color: "#dc2626",
                fontSize: 13,
                margin: 0,
              }}
            >
              {error}
            </p>
          )}

          {/* BUTTON */}
          <button
            type="submit"
            style={{
              width: "100%",
              padding: "12px",
              backgroundColor: "#8ecfbb",
              color: "#ffffff",
              border: "none",
              borderRadius: 8,
              fontSize: 14,
              fontWeight: 500,
              cursor: "pointer",
              boxSizing: "border-box",
            }}
            onMouseOver={(e) =>
              (e.currentTarget.style.backgroundColor = "#7bbfa8")
            }
            onMouseOut={(e) =>
              (e.currentTarget.style.backgroundColor = "#8ecfbb")
            }
          >
            Iniciar sesión
          </button>
        </form>
      </div>
    </div>
  );
}