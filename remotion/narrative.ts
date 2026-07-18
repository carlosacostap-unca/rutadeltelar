export type ScreenShot = {
  label: string;
  file: string;
  route: string;
};

export const timelineScreenshots: ScreenShot[] = [
  { label: "Inicio", file: "home.png", route: "/" },
  { label: "Navegacion", file: "nav.png", route: "/" },
  { label: "Estaciones", file: "estaciones.png", route: "/estaciones" },
  { label: "Mapa interactivo", file: "mapa.png", route: "/mapa" },
  { label: "Ficha de estacion", file: "estacion.png", route: "/estaciones/belen-catamarca" },
  { label: "Productos", file: "productos.png", route: "/productos" },
  { label: "Ficha de producto", file: "producto.png", route: "/productos/manta-guarda-belen" },
  { label: "Actores y comunidad", file: "artesanas.png", route: "/actores" },
  { label: "Experiencias", file: "experiencias.png", route: "/explorar" },
  { label: "Recorridos", file: "recorridos.png", route: "/recorridos" },
  { label: "Busqueda", file: "buscar.png", route: "/buscar" },
  { label: "Favoritos", file: "favoritos.png", route: "/favoritos" },
];

export const mapSteps = [
  {
    title: "El mapa como punto de partida",
    text: "La ruta aparece como territorio, no como listado.",
  },
  {
    title: "Estaciones para descubrir",
    text: "Cada marcador abre una puerta local.",
  },
  {
    title: "Acercarse al detalle",
    text: "El recorrido visual conecta mapa y ficha.",
  },
];

export const chapterCards = [
  {
    title: "Territorio",
    text: "Catamarca como trama de estaciones, paisajes y caminos posibles.",
  },
  {
    title: "Comunidad",
    text: "Actores, oficios y saberes vivos que sostienen la identidad textil.",
  },
  {
    title: "Origen",
    text: "Productos y experiencias vinculados con sus lugares y protagonistas.",
  },
  {
    title: "Viaje",
    text: "Herramientas para planificar, guardar y descubrir la ruta.",
  },
];

export const overlayTexts = [
  { at: 12, text: "Catamarca, Argentina" },
  { at: 29, text: "Un territorio tejido por historias" },
  { at: 50, text: "El mapa como punto de partida" },
  { at: 74, text: "Estaciones para descubrir" },
  { at: 94, text: "Productos con origen" },
  { at: 126, text: "Comunidad, oficio e identidad" },
  { at: 142, text: "Experiencias para vivir la Ruta" },
  { at: 156, text: "Planifica tu recorrido" },
  { at: 166, text: "Descubri la Ruta del Telar" },
];
