-- BORRAR TABLAS EXISTENTES (para pruebas)
-- =====================================
-- Permite ejecutar este script varias veces desde cero
-- Borra las tablas si existen para poder recrearlas sin errores de "ya existe"
DROP TABLE IF EXISTS tarea_categoria CASCADE;
DROP TABLE IF EXISTS comentario CASCADE;
DROP TABLE IF EXISTS tarea CASCADE;
DROP TABLE IF EXISTS categoria CASCADE;
DROP TABLE IF EXISTS usuario CASCADE;

-- TABLA USUARIO

CREATE TABLE usuario (
    id_usuario SERIAL PRIMARY KEY,
    nombre VARCHAR(100) NOT NULL,
    email VARCHAR(255) UNIQUE NOT NULL,
    contrasena VARCHAR(255) NOT NULL
);

-- TABLA CATEGORIA

CREATE TABLE categoria (
    id_categoria SERIAL PRIMARY KEY,
    nombre VARCHAR(100) NOT NULL,
    descripcion TEXT,
    color_hex CHAR(7) NOT NULL
);

-- TABLA TAREA

CREATE TABLE tarea (
    id_tarea SERIAL PRIMARY KEY,
    nombre VARCHAR(150) NOT NULL,
    descripcion TEXT,
    story_points INTEGER CHECK (story_points >= 0),
    estado VARCHAR(20) NOT NULL DEFAULT 'PENDIENTE',
    fecha_entrega DATE,

    id_usuario_creador INTEGER NOT NULL,
    id_usuario_asignado INTEGER NOT NULL,

    CONSTRAINT fk_creador
        FOREIGN KEY (id_usuario_creador)
        REFERENCES usuario(id_usuario),

    CONSTRAINT fk_asignado
        FOREIGN KEY (id_usuario_asignado)
        REFERENCES usuario(id_usuario),

    CONSTRAINT tarea_estado_check
        CHECK (estado IN ('PENDIENTE', 'EN_PROGRESO', 'EN_REVISION', 'COMPLETADO'))
);

-- TABLA COMENTARIO

CREATE TABLE comentario (
    id_comentario SERIAL PRIMARY KEY,
    contenido TEXT NOT NULL,
    fecha_creacion TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,

    id_usuario INTEGER NOT NULL,
    id_tarea INTEGER NOT NULL,

    CONSTRAINT fk_usuario_comentario
        FOREIGN KEY (id_usuario)
        REFERENCES usuario(id_usuario)
        ON DELETE CASCADE,

    CONSTRAINT fk_tarea_comentario
        FOREIGN KEY (id_tarea)
        REFERENCES tarea(id_tarea)
        ON DELETE CASCADE
);

-- TABLA INTERMEDIA TAREA_CATEGORIA (N:M)

CREATE TABLE tarea_categoria (
    id_tarea INTEGER NOT NULL,
    id_categoria INTEGER NOT NULL,

    PRIMARY KEY (id_tarea, id_categoria),

    CONSTRAINT fk_tc_tarea
        FOREIGN KEY (id_tarea)
        REFERENCES tarea(id_tarea)
        ON DELETE CASCADE,

    CONSTRAINT fk_tc_categoria
        FOREIGN KEY (id_categoria)
        REFERENCES categoria(id_categoria)
        ON DELETE CASCADE
);

-- DATA INICIAL: USUARIOS

INSERT INTO usuario (nombre, email, contrasena) VALUES
  ('Elia Alfonzo', 'elia@gmail.com', '$2b$10$gJ02BU3eLBMiMRNmCzwzt.3VynAoZIMJX4tyzxL7aLJVNyOyeTPJa'), -- elia@gmail.com -> 1234
  ('Marco Figueroa', 'marco@gmail.com', '$2b$10$/xUN.crRINHMnnKQpbmvj.6E9huKF7E/JQq8CwHrPjxaVqInENUfe'), -- marco@gmail.com -> 1212
  ('Franceli Millán', 'franceli@gmail.com', '$2b$10$3gZjA/H.SwQk4nf108oWReYmxd.UEucwen6YvRJlYaJaOlZP2REVq'), -- franceli@gmail.com -> 3333
  ('Luis García', 'luis@gmail.com', '$2b$10$YT.V7H5PatuTfOxsaZT9k.tyzZN0GrXFlgT9KMHgWoKE8otOTaT86'); -- luis@gmail.com -> 1111

-- DATA INICIAL: CATEGORÍAS

INSERT INTO categoria (nombre, descripcion, color_hex) VALUES
  ('Trabajo', 'Tareas del trabajo', '#FF0000'),
  ('Universidad', 'Tareas y trabajos académicos', '#4287f5'),
  ('Personal', 'Actividades personales', '#42f57b');