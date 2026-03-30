import { useState } from "react";
import { useForm } from "react-hook-form";
import api from "../services/api";
import { jwtDecode } from "jwt-decode";

interface CommentFormData {
  contenido: string;
}

interface TokenPayload {
  id_usuario: number;
  email: string;
}

interface Props {
  taskId: number;
  onCommentCreated: () => void; // callback para refrescar comentarios
}

export default function CommentForm({ taskId, onCommentCreated }: Props) {
  const { register, handleSubmit, reset } = useForm<CommentFormData>();
  const [error, setError] = useState("");

  const onSubmit = async (data: CommentFormData) => {
    try {
      const token = localStorage.getItem("token");

      if (!token) {
        throw new Error("No hay sesión activa");
      }

      const decoded = jwtDecode<TokenPayload>(token);
      const userId = decoded.id_usuario;

      await api.post("/comments", {
        taskId,
        userId,
        contenido: data.contenido,
      });

      reset(); // limpiar campo
      onCommentCreated(); // refrescar lista de comentarios
    } catch (err: any) {
      setError(err.response?.data?.message || err.message || "Error al crear comentario");
    }
  };

  return (
    <div style={{ marginTop: 20 }}>
      <h3>Agregar comentario</h3>

      <form onSubmit={handleSubmit(onSubmit)}>
        <textarea
          {...register("contenido", { required: true })}
          placeholder="Escribe tu comentario..."
          rows={3}
          style={{
            width: "100%",
            padding: 10,
            borderRadius: 8,
            border: "1px solid #ccc",
            boxSizing: "border-box", // ✅ asegura que no sobresalga del marco
            maxWidth: "100%",         // ✅ evita que se pase del contenedor
          }}
        />

        {error && <p style={{ color: "red" }}>{error}</p>}

        <button
          type="submit"
          style={{
            marginTop: 10,
            padding: "10px 20px",
            borderRadius: 8,
            border: "none",
            backgroundColor: "#4287f5",
            color: "white",
            cursor: "pointer",
          }}
        >
          Enviar comentario
        </button>
      </form>
    </div>
  );
}