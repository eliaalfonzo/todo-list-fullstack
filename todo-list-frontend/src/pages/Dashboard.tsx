import { useEffect, useState } from "react";
import { useNavigate, Navigate } from "react-router-dom";
import api from "../services/api";

interface Task {
  id_tarea: number;
  nombre: string;
  descripcion?: string;
  story_points?: number;
  estado: "PENDIENTE" | "EN_PROGRESO" | "EN_REVISION" | "COMPLETADO";
  fecha_entrega?: string;
  id_usuario_creador: number;
  id_usuario_asignado: number;
}

interface User {
  id_usuario: number;
  nombre: string;
}

const formatDate = (dateString?: string) => {
  if (!dateString) return "-";
  return dateString.split("T")[0];
};

export function Dashboard() {
  const [tasks, setTasks] = useState<Task[]>([]);
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [filterEstado, setFilterEstado] = useState("");
  const [filterUsuario, setFilterUsuario] = useState("");

  const navigate = useNavigate();

  const token = localStorage.getItem("token");
  if (!token) {
    return <Navigate to="/login" replace />;
  }

  const fetchTasks = async () => {
    try {
      setLoading(true);
      setError("");

      const params: any = {};
      if (filterEstado) params.estado = filterEstado;
      if (filterUsuario) params.assignedTo = filterUsuario;

      const res = await api.get("/tasks", { params });
      setTasks(res.data);
    } catch (err: any) {
      setError(err.response?.data?.message || "Error al cargar las tareas");
    } finally {
      setLoading(false);
    }
  };

  const fetchUsers = async () => {
    try {
      const res = await api.get("/users");
      setUsers(res.data);
    } catch (err) {
      console.error("Error cargando usuarios");
    }
  };

  useEffect(() => {
    fetchTasks();
  }, [filterEstado, filterUsuario]);

  useEffect(() => {
    fetchUsers();
  }, []);

  const handleCreateTask = () => {
    navigate("/create-task");
  };

  const handleLogout = () => {
    localStorage.removeItem("token");
    navigate("/login");
  };

  const getStatusStyle = (estado: string) => {
    const styles: any = {
      PENDIENTE: { background: "#fef3c7", color: "#92400e" },
      EN_PROGRESO: { background: "#dbeafe", color: "#1e40af" },
      EN_REVISION: { background: "#ede9fe", color: "#5b21b6" },
      COMPLETADO: { background: "#d1fae5", color: "#065f46" },
    };
    return styles[estado] || {};
  };

  if (loading)
    return <p style={{ textAlign: "center", marginTop: 50 }}>Cargando tareas...</p>;

  if (error)
    return (
      <p style={{ color: "#dc2626", textAlign: "center", marginTop: 50 }}>
        {error}
      </p>
    );

  return (
    <div
      style={{
        minHeight: "100vh",
        backgroundColor: "#f3f8f6",
        padding: "40px 20px",
        fontFamily: "sans-serif",
      }}
    >
      <div style={{ maxWidth: 900, margin: "0 auto" }}>
        {/* HEADER */}
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 25 }}>
          
          <div style={{ textAlign: "center", flex: 1 }}>
            <h1 style={{ marginBottom: 15, color: "#2f7f6e", fontWeight: 700 }}>
              To Do List
            </h1>
            <p style={{ color: "#6b7280", fontSize: 14 }}>
              Organiza y gestiona tus actividades fácilmente
            </p>
          </div>

          {/* BOTÓN CERRAR SESIÓN */}
          <button
            onClick={handleLogout}
            style={{
              padding: "10px 18px",
              borderRadius: 10,
              border: "1px solid #d1d5db",
              backgroundColor: "transparent",
              color: "#374151",
              fontWeight: 600,
              cursor: "pointer",
              marginLeft: 20,
              transition: "all 0.2s",
            }}
            onMouseOver={(e) => (e.currentTarget.style.backgroundColor = "#f9fafb")}
            onMouseOut={(e) => (e.currentTarget.style.backgroundColor = "transparent")}
          >
            Cerrar sesión
          </button>
        </div>

        {/* FILTROS */}
        <div
          style={{
            display: "flex",
            gap: 10,
            marginBottom: 25,
            flexWrap: "wrap",
          }}
        >
          <select
            value={filterEstado}
            onChange={(e) => setFilterEstado(e.target.value)}
            style={{
              padding: 10,
              borderRadius: 10,
              border: "1px solid #d1d5db",
              backgroundColor: "#ffffff",
              flex: 1,
              fontWeight: 600,
              color: "#111827",
            }}
          >
            <option value="">Todos los estados</option>
            <option value="PENDIENTE">Pendiente</option>
            <option value="EN_PROGRESO">En progreso</option>
            <option value="EN_REVISION">En revisión</option>
            <option value="COMPLETADO">Completado</option>
          </select>

          <select
            value={filterUsuario}
            onChange={(e) => setFilterUsuario(e.target.value)}
            style={{
              padding: 10,
              borderRadius: 10,
              border: "1px solid #d1d5db",
              backgroundColor: "#ffffff",
              flex: 1,
              fontWeight: 600,
              color: "#111827",
            }}
          >
            <option value="">Todos los usuarios</option>
            {users.map((user) => (
              <option key={user.id_usuario} value={user.id_usuario}>
                {user.nombre}
              </option>
            ))}
          </select>

          {/* BOTÓN NUEVA TAREA */}
          <button
            onClick={handleCreateTask}
            style={{
              padding: "10px 18px",
              borderRadius: 10,
              border: "none",
              backgroundColor: "#3b82f6",
              color: "#ffffff",
              fontWeight: 600,
              cursor: "pointer",
              transition: "all 0.2s",
            }}
            onMouseOver={(e) => {
              e.currentTarget.style.backgroundColor = "#2563eb";
              e.currentTarget.style.transform = "translateY(-1px)";
            }}
            onMouseOut={(e) => {
              e.currentTarget.style.backgroundColor = "#3b82f6";
              e.currentTarget.style.transform = "translateY(0)";
            }}
          >
            + Nueva tarea
          </button>
        </div>

        {tasks.length === 0 && (
          <p style={{ textAlign: "center", marginTop: 20 }}>
            No hay tareas registradas.
          </p>
        )}

        <div style={{ display: "flex", flexDirection: "column", gap: 15 }}>
          {tasks.map((task) => (
            <div
              key={task.id_tarea}
              onClick={() => navigate(`/tasks/${task.id_tarea}`)}
              style={{
                backgroundColor: "#ffffff",
                padding: 20,
                borderRadius: 12,
                boxShadow: "0 6px 15px rgba(0,0,0,0.05)",
                cursor: "pointer",
                transition: "all 0.2s ease",
                border: "1px solid #f1f5f9",
              }}
            >
              <div
                style={{
                  display: "flex",
                  justifyContent: "space-between",
                  alignItems: "center",
                  marginBottom: 10,
                }}
              >
                <h3 style={{ margin: 0, fontWeight: 600, color: "#111827" }}>
                  {task.nombre}
                </h3>

                <span
                  style={{
                    padding: "4px 10px",
                    borderRadius: 20,
                    fontSize: 12,
                    fontWeight: 600,
                    ...getStatusStyle(task.estado),
                  }}
                >
                  {task.estado}
                </span>
              </div>

              {task.descripcion && (
                <p
                  style={{
                    color: "#374151",
                    marginBottom: 14,
                    textAlign: "left",
                    fontSize: 14,
                  }}
                >
                  {task.descripcion}
                </p>
              )}

              <div
                style={{
                  display: "grid",
                  gridTemplateColumns: "1fr 1fr",
                  gap: 10,
                  fontSize: 13,
                  color: "#111827",
                  fontWeight: 500,
                }}
              >
                <p><strong>Story Points:</strong> {task.story_points ?? "-"}</p>
                <p><strong>Fecha:</strong> {formatDate(task.fecha_entrega)}</p>
                <p><strong>Creador:</strong> {task.id_usuario_creador}</p>
                <p><strong>Asignado:</strong> {task.id_usuario_asignado}</p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}