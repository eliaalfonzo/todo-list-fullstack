import { useEffect, useState } from "react";
import api from "../services/api";

interface Category {
  id_categoria: number;
  nombre: string;
  descripcion?: string;
  color_hex: string;
}

interface Props {
  taskId: number;
  onCategoryAdded: () => void; // callback para refrescar la tarea
}

export default function CategorySelector({ taskId, onCategoryAdded }: Props) {
  const [categories, setCategories] = useState<Category[]>([]);
  const [selectedCategory, setSelectedCategory] = useState<number | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const fetchCategories = async () => {
    try {
      setLoading(true);
      const res = await api.get(`/tasks/${taskId}/categories/not-associated`);
      setCategories(res.data);
    } catch (err: any) {
      setError(err.response?.data?.message || "Error al cargar categorías");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCategories();
  }, [taskId]);

  const handleAddCategory = async () => {
    if (!selectedCategory) return;
    try {
      await api.post(`/tasks/${taskId}/categories`, {
        categoryId: selectedCategory,
      });
      setSelectedCategory(null);
      onCategoryAdded(); // refresca la tarea en TaskDetail
      fetchCategories(); // refresca categorías disponibles
    } catch (err: any) {
      setError(err.response?.data?.message || "Error al agregar categoría");
    }
  };

  if (loading) return <p>Cargando categorías...</p>;
  if (error) return <p style={{ color: "red" }}>{error}</p>;
  if (categories.length === 0) return <p>Todas las categorías ya están asociadas</p>;

  return (
    <div style={{ marginTop: 20 }}>
      <h3>Agregar categoría a la tarea</h3>
      <select
        value={selectedCategory ?? ""}
        onChange={(e) => setSelectedCategory(Number(e.target.value))}
        style={{ padding: 8, borderRadius: 8, width: "100%" }}
      >
        <option value="" disabled>
          Selecciona una categoría
        </option>
        {categories.map((cat) => (
          <option key={cat.id_categoria} value={cat.id_categoria}>
            {cat.nombre} ({cat.color_hex})
          </option>
        ))}
      </select>

      <button
        onClick={handleAddCategory}
        style={{
          marginTop: 10,
          padding: "10px 20px",
          borderRadius: 8,
          border: "none",
          backgroundColor: "#3b82f6",
          color: "white",
          cursor: "pointer",
        }}
        disabled={!selectedCategory}
      >
        Agregar categoría
      </button>
    </div>
  );
}