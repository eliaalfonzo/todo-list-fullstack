import api from "../services/api";

interface Category {
  id_categoria: number;
  nombre: string;
  descripcion?: string;
  color_hex: string;
}

interface Props {
  categories: Category[];
  onCategoryDeleted: () => void; // callback para refrescar la tarea
}

export default function CategoryList({ categories, onCategoryDeleted }: Props) {

  const handleDelete = async (id: number) => {
    if (!confirm("¿Seguro que quieres eliminar esta categoría? Esto la quitará de todas las tareas.")) return;

    try {
      await api.delete(`/categories/${id}`);
      onCategoryDeleted(); // refresca la tarea
    } catch (err: any) {
      alert(err.response?.data?.message || "Error al eliminar la categoría");
    }
  };

  if (!categories || categories.length === 0) return <p>No hay categorías asociadas</p>;

  return (
    <div style={{ marginTop: 10 }}>
      {categories.map(cat => (
        <div
          key={cat.id_categoria}
          style={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            marginBottom: 5,
            padding: 8,
            border: "1px solid #ddd",
            borderRadius: 8,
            backgroundColor: "#f9f9f9",
          }}
        >
          <div>
            <strong>{cat.nombre}</strong> - <small>{cat.descripcion || "-"}</small>
            <div
              style={{
                width: 20,
                height: 20,
                backgroundColor: cat.color_hex,
                display: "inline-block",
                marginLeft: 10,
                borderRadius: 4
              }}
            />
          </div>
          <button
            onClick={() => handleDelete(cat.id_categoria)}
            style={{
              padding: "5px 10px",
              borderRadius: 8,
              border: "none",
              backgroundColor: "#dc3545",
              color: "white",
              cursor: "pointer",
            }}
          >
            Eliminar
          </button>
        </div>
      ))}
    </div>
  );
}