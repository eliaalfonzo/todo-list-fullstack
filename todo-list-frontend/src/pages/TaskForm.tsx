import { useState, useEffect } from "react";
import { useForm } from "react-hook-form";
import { useNavigate } from "react-router-dom";
import api from "../services/api";
import { jwtDecode } from "jwt-decode";

interface TaskFormData {
  nombre: string;
  descripcion?: string;
  storyPoints?: number;
  fechaEntrega?: string;
  assignedTo: number;
  estado?: string;
}

interface TokenPayload {
  id_usuario: number;
  email: string;
}

interface TaskFormProps {
  task?: any;
  onSuccess?: () => void;
  onCancel?: () => void;
}

interface User {
  id_usuario: number;
  nombre: string;
}

export default function TaskForm({ task, onSuccess, onCancel }: TaskFormProps) {
  const { register, handleSubmit, setValue } = useForm<TaskFormData>();
  const navigate = useNavigate();
  const [error, setError] = useState("");
  const [users, setUsers] = useState<User[]>([]);

  useEffect(() => {
    const fetchUsers = async () => {
      try {
        const res = await api.get("/users");
        setUsers(res.data);
      } catch (err) {
        console.error("Error cargando usuarios");
      }
    };
    fetchUsers();
  }, []);

  useEffect(() => {
    if (task && users.length > 0) {
      setValue("nombre", task.nombre);
      setValue("descripcion", task.descripcion);
      setValue("storyPoints", task.story_points);
      setValue("fechaEntrega", task.fecha_entrega?.split("T")[0]);
      setValue("assignedTo", task.id_usuario_asignado);
      setValue("estado", task.estado);
    }
  }, [task, users, setValue]);

  const onSubmit = async (data: TaskFormData) => {
    try {
      const token = localStorage.getItem("token");
      if (!token) throw new Error("No hay sesión activa");

      const decoded = jwtDecode<TokenPayload>(token);
      const userId = decoded.id_usuario;

      if (!task) {
        const payload = {
          nombre: data.nombre,
          descripcion: data.descripcion || null,
          storyPoints: data.storyPoints !== undefined ? Number(data.storyPoints) : null,
          fechaEntrega: data.fechaEntrega || null,
          assignedTo: Number(data.assignedTo),
          estado: data.estado || "PENDIENTE",
          createdBy: userId,
        };

        await api.post("/tasks", payload);
        alert("Tarea creada con éxito!");
      } else {
        const payload: any = {
          nombre: data.nombre,
          descripcion: data.descripcion || null,
        };

        if (data.storyPoints !== undefined && data.storyPoints !== null) {
          payload.story_points = Number(data.storyPoints);
        }
        if (data.fechaEntrega) {
          payload.fecha_entrega = data.fechaEntrega;
        }
        if (data.assignedTo) {
          payload.id_usuario_asignado = Number(data.assignedTo);
        }
        if (data.estado) {
          payload.estado = data.estado;
        }

        await api.put(`/tasks/${task.id_tarea}`, payload);
        alert("Tarea actualizada con éxito!");
      }

      if (onSuccess) onSuccess();
      else navigate("/dashboard");
    } catch (err: any) {
      setError(err.response?.data?.message || err.message || "Error al guardar la tarea");
    }
  };

  return (
    <div
      style={{
        minHeight: "100vh",
        backgroundColor: "#f3f8f6",
        padding: 50,
        fontFamily: "'Inter', sans-serif",
        color: "#1f2937",
      }}
    >
      <div
        style={{
          maxWidth: 600,
          margin: "0 auto",
          padding: 40,
          borderRadius: 16,
          backgroundColor: "#ffffff",
          border: "1px solid #8ecfbb",
          boxShadow: "0 6px 15px rgba(0,0,0,0.05)",
        }}
      >
        <h2
          style={{
            textAlign: "center",
            marginBottom: 30,
            fontSize: 26,
            fontWeight: 600,
            color: "#1f2937",
          }}
        >
          {task ? "Editar Tarea" : "Crear Nueva Tarea"}
        </h2>

        <form
          onSubmit={handleSubmit(onSubmit)}
          style={{ display: "flex", flexDirection: "column", gap: 20 }}
        >
          {/* Nombre */}
          <div style={{ display: "flex", flexDirection: "column" }}>
            <label style={{ marginBottom: 6, fontWeight: 500, color: "#6b7280" }}>Nombre</label>
            <input
              type="text"
              {...register("nombre")}
              required
              style={{
                padding: 12,
                borderRadius: 12,
                border: "1px solid #8ecfbb",
                fontSize: 16,
              }}
            />
          </div>

          {/* Descripción */}
          <div style={{ display: "flex", flexDirection: "column" }}>
            <label style={{ marginBottom: 6, fontWeight: 500, color: "#6b7280" }}>Descripción</label>
            <textarea
              {...register("descripcion")}
              rows={4}
              style={{
                padding: 12,
                borderRadius: 12,
                border: "1px solid #8ecfbb",
                fontSize: 16,
              }}
            />
          </div>

          {/* Story Points */}
          <div style={{ display: "flex", flexDirection: "column" }}>
            <label style={{ marginBottom: 6, fontWeight: 500, color: "#6b7280" }}>Story Points</label>
            <input
              type="number"
              {...register("storyPoints")}
              min={0}
              style={{
                padding: 12,
                borderRadius: 12,
                border: "1px solid #8ecfbb",
                fontSize: 16,
              }}
            />
          </div>

          {/* Fecha */}
          <div style={{ display: "flex", flexDirection: "column" }}>
            <label style={{ marginBottom: 6, fontWeight: 500, color: "#6b7280" }}>Fecha de Entrega</label>
            <input
              type="date"
              {...register("fechaEntrega")}
              style={{
                padding: 12,
                borderRadius: 12,
                border: "1px solid #8ecfbb",
                fontSize: 16,
              }}
            />
          </div>

          {/* Usuario asignado */}
          <div style={{ display: "flex", flexDirection: "column" }}>
            <label style={{ marginBottom: 6, fontWeight: 500, color: "#6b7280" }}>
              Usuario Asignado
            </label>
            <select
              {...register("assignedTo")}
              required
              disabled={users.length === 0}
              defaultValue={task ? task.id_usuario_asignado : ""}
              style={{
                padding: 12,
                borderRadius: 12,
                border: "1px solid #8ecfbb",
                fontSize: 16,
              }}
            >
              <option value="" disabled>
                Selecciona un usuario
              </option>
              {users.map((user) => (
                <option key={user.id_usuario} value={user.id_usuario}>
                  {user.nombre}
                </option>
              ))}
            </select>
          </div>

          {/* Estado */}
          {task && (
            <div style={{ display: "flex", flexDirection: "column" }}>
              <label style={{ marginBottom: 6, fontWeight: 500, color: "#6b7280" }}>Estado</label>
              <select
                {...register("estado")}
                style={{
                  padding: 12,
                  borderRadius: 12,
                  border: "1px solid #8ecfbb",
                  fontSize: 16,
                }}
              >
                <option value="PENDIENTE">PENDIENTE</option>
                <option value="EN_PROGRESO">EN PROGRESO</option>
                <option value="EN_REVISION">EN REVISION</option>
                <option value="COMPLETADO">COMPLETADO</option>
              </select>
            </div>
          )}

          {error && <p style={{ color: "#f44336", textAlign: "center" }}>{error}</p>}

          {/* BOTONES */}
          <div style={{ display: "flex", gap: 10 }}>
            <button
              type="submit"
              style={{
                flex: 1,
                padding: "14px 0",
                borderRadius: 12,
                border: "none",
                backgroundColor: "#5fb49c", // ✅ verde más oscuro
                color: "#fff",
                fontWeight: 600,
                fontSize: 16,
                cursor: "pointer",
                transition: "all 0.2s",
              }}
              onMouseEnter={(e) =>
                (e.currentTarget.style.backgroundColor = "#4aa88f")
              }
              onMouseLeave={(e) =>
                (e.currentTarget.style.backgroundColor = "#5fb49c")
              }
            >
              {task ? "Actualizar Tarea" : "Crear Tarea"}
            </button>

            <button
              type="button"
              onClick={() => (onCancel ? onCancel() : navigate("/dashboard"))}
              style={{
                flex: 1,
                padding: "14px 0",
                borderRadius: 12,
                border: "1px solid #8ecfbb",
                background: "transparent",
                color: "#1f2937",
                fontWeight: 600,
                fontSize: 16,
                cursor: "pointer",
              }}
            >
              Cancelar
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}