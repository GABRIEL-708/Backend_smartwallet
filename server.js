const express = require("express");
const app = express();
require("dotenv").config();
const fetch = (...args) =>
  import("node-fetch").then(({ default: fetch }) => fetch(...args));
const multer = require("multer"); 
const cors = require("cors");
require("./cronJobs");

// Puerto y claves de Stripe
const port = process.env.PORT;
const NEWS_API_KEY = process.env.NEWSDATA_API_KEY;
const STRIPE_SECRET_KEY = process.env.STRIPE_SECRET_KEY; // Agregado para Stripe
const stripe = require("stripe")(STRIPE_SECRET_KEY);    // Importación de Stripe

// Configuración de multer (subida de archivos)
const upload = multer({
  storage: multer.memoryStorage(),
  limits: {
    fileSize: 5 * 1024 * 1024, // 5MB máximo
  },
});

// Importa tus rutas existentes
const usuariosRoutes = require("./routes/usuariosRoutes");
const categoriasMetasRoutes = require("./routes/categoriasMetasRoutes");
const categoriasGastosRoutes = require("./routes/categoriasGastosRoutes");
const gastosRoutes = require("./routes/gastosRoutes");
const metasAhorroRoutes = require("./routes/metasAhorroRoutes");
const recordatoriosRoutes = require("./routes/recordatoriosRoutes");
const reportesRoutes = require("./routes/reportesRoutes");
const ingresoRoutes = require("./routes/ingresoRoutes");
const notificacionesRoutes = require("./routes/notificacionesRoutes");

// Importa el controlador de Stripe
const paymentRoutes = require("./routes/paymentRoutes");  // <-- Agregado para Stripe

// Configuración de CORS
app.use(
  cors({
    origin: "https://smartwallet-front.vercel.app", // Cambia este URL por el dominio de tu frontend
    methods: ["GET", "POST", "PUT", "DELETE"],
    credentials: true, // Para cookies o sesiones
  })
);
app.use(express.json());
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ limit: '10mb', extended: true }));

// Asignación de rutas
app.use("/api/usuarios", usuariosRoutes);
app.use("/api/categoriasMetas", categoriasMetasRoutes);
app.use("/api/categoriasGastos", categoriasGastosRoutes);
app.use("/api/gastos", gastosRoutes);
app.use("/api/metas", metasAhorroRoutes);
app.use("/api/recordatorios", recordatoriosRoutes);
app.use("/api/reportes", reportesRoutes);
app.use("/api/ingresos", ingresoRoutes);
app.use("/api/notificaciones", notificacionesRoutes);
app.use("/api/payments", paymentRoutes);  // <-- Nueva ruta para Stripe

// Ruta para obtener artículos de NewsData.io
app.get("/api/articles", async (req, res) => {
  const { keyword = "finance" } = req.query;
  const url = `https://newsdata.io/api/1/news?apikey=${NEWS_API_KEY}&q=${keyword}&language=es`;

  try {
    console.log("Solicitando artículos de NewsData.io:", url);
    const response = await fetch(url);

    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(`Error fetching articles: ${errorText}`);
    }

    const data = await response.json();
    res.json(data.results);
  } catch (error) {
    console.error("Error en la solicitud a NewsData.io:", error);
    res.status(500).json({ error: "Error fetching articles" });
  }
});

// Configuración del puerto del servidor
app.listen(port, () => {
  console.log(`Servidor en ejecución en http://localhost:${port}`);
});
