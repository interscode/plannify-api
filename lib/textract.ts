import {
  TextractClient,
  AnalyzeDocumentCommand,
  AnalyzeDocumentCommandInput,
  Block,
} from "@aws-sdk/client-textract";
// @ts-ignore
import { DecisionTreeClassifier } from "ml-cart";

type Horario = { hora: string; aula: string | null };
type StructuredRow = {
  materia: string;
  profesor: string;
  horarios: Record<string, Horario>;
};

// Extrae características numéricas de un texto (longitud, proporción de mayúsculas, dígitos, etc.)
// Estas características se usan como entrada para el clasificador
function extractFeatures(text: string): number[] {
  const len = text.length;
  const words = text.trim().split(/\s+/);
  const wordCount = words.length;
  const upperCount = text.replace(/[^A-Z]/g, "").length;
  const digitCount = (text.match(/\d/g) || []).length;

  return [
    len,
    wordCount,
    upperCount / (len || 1),
    digitCount,
    /(\d{1,2}[:\-]?\d{1,2})/.test(text) ? 1 : 0, // ¿Contiene una hora?
    /[A-Z]\d{2,3}|[A-Z\-]{2,}/.test(text) ? 1 : 0, // ¿Contiene un aula?
    ["LUN", "MAR", "MIE", "JUE", "VIE", "SAB"].includes(text) ? 1 : 0, // ¿Es un día de la semana?
  ];
}

// Intenta extraer la hora y aula de un texto de celda, por ejemplo: "11-13 A20"
function parseHorarioText(
  text: string,
): { hora: string; aula: string | null } | null {
  if (!text || text.trim() === "-" || text.trim() === "") return null;

  // Intenta con patrón hora + aula
  const match = text.match(/(\d{1,2}[:\-]?\d{1,2})\s*([A-Z0-9\-]+)/i);
  if (match) {
    return { hora: match[1], aula: match[2] };
  }

  // Solo hora, sin aula
  const fallback = text.match(/(\d{1,2}[:\-]?\d{1,2})/);
  if (fallback) return { hora: fallback[1], aula: null };

  return null;
}

// --------------------
// FUNCIÓN PRINCIPAL
// --------------------

export async function scanShedule(image: File): Promise<StructuredRow[]> {
  try {
    // Cargar imagen y preparar cliente de Textract
    const client = new TextractClient({ region: "us-east-1" });

    // Convertir File a Uint8Array
    const arrayBuffer = await image.arrayBuffer();
    const imageBytes = new Uint8Array(arrayBuffer);

    const input: AnalyzeDocumentCommandInput = {
      Document: { Bytes: imageBytes },
      FeatureTypes: ["TABLES"], // Indicamos que extraiga tablas
    };

    // Ejecutar Textract
    const command = new AnalyzeDocumentCommand(input);
    const res = await client.send(command);
    const blocks = res.Blocks || [];

    // Crear un mapa para acceder rápidamente a los bloques por ID
    const blockMap: { [id: string]: Block } = {};
    blocks.forEach((block) => {
      if (block.Id) {
        blockMap[block.Id] = block;
      }
    });

    // Extraer las celdas de la tabla, con su texto
    const tableCells = blocks
      .filter((b) => b.BlockType === "CELL")
      .map((cell) => {
        const text = (cell.Relationships || [])
          .flatMap((rel) => rel.Ids || [])
          .map((id) => blockMap[id]?.Text || "")
          .join(" ");
        return {
          row: cell.RowIndex!,
          column: cell.ColumnIndex!,
          text: text.trim(),
        };
      });

    // Agrupar las celdas por filas
    const tableByRows: { [row: number]: string[] } = {};
    for (const cell of tableCells) {
      if (!tableByRows[cell.row]) tableByRows[cell.row] = [];
      tableByRows[cell.row][cell.column - 1] = cell.text;
    }

    // Convertir a arreglo bidimensional (tabla final)
    const table: string[][] = Object.values(tableByRows);

    // ----------------------------------------
    // ENTRENAMIENTO DEL CLASIFICADOR DE TEXTO (Falta agregar mas datos para que sean compatibles con otros horarios)
    // ----------------------------------------

    const samples = [
      // Materias
      { text: "INTELIGENCIA ARTIFICIAL", label: "materia" },
      { text: "REDES", label: "materia" },
      { text: "FRAMEWORKS Y ARQUITECTURA DE SOFTWARE", label: "materia" },
      { text: "SISTEMAS DISTRIBUIDOS", label: "materia" },
      { text: "SISTEMAS OPERATIVOS", label: "materia" },
      // Profesores
      { text: "PEREZ RAMOS JORGE LUIS", label: "profesor" },
      { text: "GONZALEZ CERROBLANCO JESUS FERNANDO", label: "profesor" },
      { text: "ZAVALETA DURAN ADRIAN RENE", label: "profesor" },
      // Horarios
      { text: "13-15", label: "horario" },
      { text: "15-17 D09", label: "horario" },
      { text: "11-13 A20", label: "horario" },
      { text: "11-13 L-SOF", label: "horario" },
      { text: "7-9 D04", label: "horario" },
      // Días
      { text: "LUN", label: "dias" },
      { text: "MAR", label: "dias" },
      { text: "MIE", label: "dias" },
      { text: "JUE", label: "dias" },
      { text: "VIE", label: "dias" },
    ];

    // Mapeo entre etiquetas y números para el modelo
    const labelToIndex = {
      materia: 0,
      profesor: 1,
      horario: 2,
      dias: 3,
    };

    const indexToLabel = Object.fromEntries(
      Object.entries(labelToIndex).map(([k, v]) => [v, k]),
    );

    // Entrenamiento del árbol de decisión
    const X = samples.map((s) => extractFeatures(s.text));
    const y = samples.map(
      (s) => labelToIndex[s.label as keyof typeof labelToIndex],
    );

    const clf = new DecisionTreeClassifier();
    clf.train(X, y);

    // ------------------------------------
    // PARSEO Y CLASIFICACIÓN DE LA TABLA
    // ------------------------------------

    // Buscar encabezado con los nombres de los días (LUN, MAR, etc.)
    const weekdayNames = ["LUN", "MAR", "MIE", "JUE", "VIE"];
    const dayHeaderRow = table.find((row) =>
      weekdayNames.every((day) => row.includes(day)),
    );
    if (!dayHeaderRow) throw new Error("No se encontró la fila con los días");

    // Identificar qué columnas corresponden a cada día
    const weekdayColumnIndexes = dayHeaderRow
      .map((text, index) =>
        weekdayNames.includes(text) ? { day: text, index } : null,
      )
      .filter((x): x is { day: string; index: number } => x !== null);

    // Buscar la fila de encabezado de contenido ("NOMBRE DE LA MATERIA", "PROFESOR", etc.)
    const contentHeaderRow = table.find(
      (row) => row.includes("NOMBRE DE LA MATERIA") && row.includes("PROFESOR"),
    );
    if (!contentHeaderRow)
      throw new Error("No se encontró la fila con encabezados de contenido");

    // Índices de las columnas de interés
    const materiaIndex = contentHeaderRow.indexOf("NOMBRE DE LA MATERIA");
    const profesorIndex = contentHeaderRow.indexOf("PROFESOR");

    // Determinar desde qué fila comienzan los datos
    const startRow =
      Math.max(table.indexOf(contentHeaderRow), table.indexOf(dayHeaderRow)) +
      1;

    // Filtrar solo las filas que contienen datos válidos
    const dataRows = table
      .slice(startRow)
      .filter((row) => row[materiaIndex] && row[profesorIndex]);

    // Construir estructura final para cada materia
    const structured: StructuredRow[] = dataRows.map((row) => {
      const materia = row[materiaIndex]?.trim();
      const profesor = row[profesorIndex]?.trim();
      const horarios: Record<string, Horario> = {};

      // Extraer los horarios por día
      for (const { day, index } of weekdayColumnIndexes) {
        const cell = row[index];
        if (cell && cell.trim() && cell !== "-") {
          const parsed = parseHorarioText(cell);
          if (parsed) {
            horarios[day] = parsed;
          } else {
            console.warn(
              `⚠️ No se pudo interpretar el horario: '${cell}' para ${materia}`,
            );
          }
        }
      }

      return { materia, profesor, horarios };
    });

    // Mostrar la estructura final por consola
    console.log("Structured Class Schedule:");
    console.dir(structured, { depth: null });

    return structured;
  } catch (err) {
    console.error("Error al analizar el documento:", err);
    return [];
  }
}
