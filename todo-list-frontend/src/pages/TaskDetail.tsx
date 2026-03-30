import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import api from "../services/api";
import CommentForm from "../components/CommentForm";
import CategorySelector from "../components/CategorySelector";
import CategoryList from "../components/CategoryList";
import TaskForm from "../pages/TaskForm";

// FECHA (tareas)
const formatDate = (dateString?: string) => {
  if (!dateString) return "-";
  try {
    const [year, month, day] = dateString.split("T")[0].split("-");
    return `${day}/${month}/${year}`;
  } catch {
    return "Fecha inválida";
  }
};

// FECHA + HORA (comentarios)
const formatDateTime = (dateString?: string) => {
  if (!dateString) return "-";
  const date = new Date(dateString);
  if (isNaN(date.getTime())) return "Fecha inválida";

  return date.toLocaleString("es-ES", {
    dateStyle: "short",
    timeStyle: "short",
  });
};

// Colores por estado
const getStatusStyle = (estado: string) => {
  switch (estado) {
    case "PENDIENTE":
      return { backgroundColor: "#FFD9C0", color: "#1f2937" };
    case "EN_PROGRESO":
      return { backgroundColor: "#A7F0D1", color: "#1f2937" };
    case "EN_REVISION":
      return { backgroundColor: "#E0D7FF", color: "#1f2937" };
    case "COMPLETADO":
      return { backgroundColor: "#C7F9CC", color: "#1f2937" };
    default:
      return { backgroundColor: "#E2E8F0", color: "#1f2937" };
  }
};

export default function TaskDetail() {
  const { id } = useParams();
  const [task, setTask] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [editing, setEditing] = useState(false);

  const fetchTask = async () => {
    try {
      setLoading(true);
      setError("");
      const res = await api.get(`/tasks/${id}`);
      setTask(res.data);
    } catch (err: any) {
      setError(err.response?.data?.message || "Error al cargar la tarea");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchTask();
  }, [id]);

  if (loading)
    return <p style={{ textAlign: "center", color: "#1f2937" }}>Cargando tarea...</p>;

  if (error)
    return <p style={{ color: "#FF6B6B", textAlign: "center" }}>{error}</p>;

  if (!task)
    return <p style={{ textAlign: "center", color: "#1f2937" }}>No se encontró la tarea</p>;

  // EDICIÓN
  if (editing) {
    return (
      <TaskForm
        task={task}
        onSuccess={() => {
          fetchTask();
          setEditing(false);
        }}
        onCancel={() => setEditing(false)}
      />
    );
  }

  // DETALLE
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
          maxWidth: 900,
          margin: "0 auto",
          padding: 30,
          borderRadius: 16,
          backgroundColor: "#ffffff",
          boxShadow: "0 6px 15px rgba(0,0,0,0.05)",
          border: "1px solid #8ecfbb",
          display: "flex",
          flexDirection: "column",
          gap: 25,
        }}
      >
        {/* DETALLES COMPLETOS */}
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "1fr 1fr",
            gap: 15,
            backgroundColor: "#ffffff",
            padding: 20,
            borderRadius: 12,
            border: "1px solid #8ecfbb",
            fontWeight: 500,
            fontSize: 14,
          }}
        >
          {/* TÍTULO + BOTÓN */}
          <div
            style={{
              gridColumn: "1 / -1",
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center",
              gap: 10,
            }}
          >
            <h1
              style={{
                fontWeight: 600,
                fontSize: 28,
                margin: 0,
                color: "#1f2937",
                wordBreak: "break-word",
              }}
            >
              {task.nombre}
            </h1>

            <button
              onClick={() => setEditing(true)}
              style={{
                padding: "10px 16px",
                borderRadius: 12,
                border: "none",
                backgroundColor: "#3b82f6",
                color: "#ffffff",
                fontWeight: 600,
                fontSize: 14,
                cursor: "pointer",
                display: "flex",
                alignItems: "center",
                gap: 6,
                transition: "all 0.2s ease",
                boxShadow: "0 4px 6px rgba(0,0,0,0.1)",
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.backgroundColor = "#2563eb"; // 🔵 hover
                e.currentTarget.style.transform = "translateY(-1px)";
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.backgroundColor = "#3b82f6";
                e.currentTarget.style.transform = "translateY(0)";
              }}
            >
              ✏️ Editar
            </button>
          </div>

          {/* DESCRIPCIÓN */}
          <div style={{ gridColumn: "1 / -1" }}>
            <p
              style={{
                margin: 0,
                color: "#1f2937",
                lineHeight: 1.6,
                fontSize: 15,
              }}
            >
              {task.descripcion || "Sin descripción"}
            </p>
          </div>

          <div>
            <strong>Story Points:</strong>
            <div>{task.story_points ?? "-"}</div>
          </div>

          <div>
            <strong>Fecha entrega:</strong>
            <div>{formatDate(task.fecha_entrega)}</div>
          </div>

          <div>
            <strong>Creador:</strong>
            <div>{task.usuario_creador_nombre ?? task.id_usuario_creador}</div>
          </div>

          <div>
            <strong>Asignado:</strong>
            <div>{task.usuario_asignado_nombre ?? task.id_usuario_asignado}</div>
          </div>

          <div>
            <strong>Estado:</strong>
            <div
              style={{
                ...getStatusStyle(task.estado),
                padding: "6px 12px",
                borderRadius: 12,
                fontWeight: 600,
                fontSize: 13,
                display: "inline-block",
              }}
            >
              {task.estado}
            </div>
          </div>
        </div>

        {/* CATEGORÍAS */}
        <div
          style={{
            marginTop: 30,
            padding: 20,
            borderRadius: 12,
            border: "1px solid #8ecfbb",
            backgroundColor: "#ffffff",
            display: "flex",
            flexDirection: "column",
            gap: 15,
          }}
        >
          <h2 style={{ margin: 0, color: "#1f2937" }}>Categorías</h2>
          <CategoryList
            categories={task.categorias || []}
            onCategoryDeleted={fetchTask}
          />
          <CategorySelector taskId={task.id_tarea} onCategoryAdded={fetchTask} />
        </div>

        {/* COMENTARIOS */}
        <div
          style={{
            marginTop: 30,
            padding: 20,
            borderRadius: 12,
            border: "1px solid #8ecfbb",
            backgroundColor: "#ffffff",
            display: "flex",
            flexDirection: "column",
            gap: 15,
          }}
        >
          <h2 style={{ margin: 0, color: "#1f2937" }}>Comentarios</h2>
          {(!task.comentarios || task.comentarios.length === 0) && (
            <p style={{ color: "#6b7280" }}>No hay comentarios</p>
          )}

          <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
            {task.comentarios?.map((com: any) => (
              <div
                key={com.id_comentario}
                style={{
                  padding: 15,
                  borderRadius: 12,
                  backgroundColor: "#FFFFFF",
                  border: "1px solid #E2E8F0",
                  boxShadow: "0 2px 4px rgba(0,0,0,0.03)",
                  color: "#1f2937",
                }}
              >
                <div
                  style={{
                    display: "flex",
                    justifyContent: "space-between",
                    alignItems: "center",
                    marginBottom: 8,
                  }}
                >
                  <strong style={{ fontSize: 14 }}>
                    {com.usuario_nombre ?? com.id_usuario}
                  </strong>
                  <span style={{ fontSize: 12, color: "#6b7280" }}>
                    {formatDateTime(com.fecha_creacion)}
                  </span>
                </div>

                <p style={{ margin: 0, lineHeight: "1.5", fontSize: 14 }}>
                  {com.contenido}
                </p>
              </div>
            ))}
          </div>

          <CommentForm taskId={task.id_tarea} onCommentCreated={fetchTask} />
        </div>
      </div>
    </div>
  );
}