import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useState } from "react";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Rocket, FileSpreadsheet } from "lucide-react";
import Plot from "react-plotly.js";
import { AllCommunityModule, ModuleRegistry } from "ag-grid-community";
ModuleRegistry.registerModules([AllCommunityModule]);
import { AgGridReact } from "ag-grid-react";
import { themeQuartz } from "ag-grid-community"; // or themeBalham, themeAlpine
import { exportToExcel } from "@/lib/exportToExcel";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import Layout from "@/components/Layout/layout";

interface ChartTrace {
  x: number[];
  y: number[];
  type: "scatter";
  mode:
    | "lines+markers"
    | "markers"
    | "lines"
    | "text"
    | "none"
    | "text+markers"
    | "text+lines"
    | "text+lines+markers";
  marker?: { color: string };
  line?: { color: string };
  name: string;
  showlegend: boolean;
}

// Movimiento Rectilíneo Uniforme (MRU)
const Mru = () => {
  let tiempo: number[] = [];
  let posicion: number[] = [];
  const posicionTeorica: number[] = [];
  const [velocidad, setVelocidad] = useState<number>(27);
  const [masa, setMasa] = useState<number>(3);
  const [xIni, setXIni] = useState<number>(0);
  const [tTray, setTTray] = useState<number>(30);
  const [N, setN] = useState<number>(100);
  const [chartData, setChartData] = useState<ChartTrace[]>([
    {
      x: tiempo,
      y: posicion,
      type: "scatter",
      mode: "lines+markers",
      marker: { color: "red" },
      name: "Posición medida",
      showlegend: true,
    },
  ]);

  const [data, setData] = useState<
    { tiempo: number; posicionMedida: number; posicionTeorica: number }[]
  >([]);

  const [colDefs, setColDefs] = useState<
    {
      headerName?: string;
      field: "tiempo" | "posicionMedida" | "posicionTeorica";
    }[]
  >([
    { field: "tiempo" },
    { field: "posicionMedida" },
    { field: "posicionTeorica" },
  ]);
  const myTheme = themeQuartz.withParams({
    /* Low spacing = very compact */
    spacing: 2,
    /* Changes the colour of the grid text */
    foregroundColor: "oklch(0.208 0.042 265.755)", // primary color
    /* Changes the colour of the grid background */
    backgroundColor: "rgb(255, 255, 255)",
    /* Changes the header colour of the top row */
    headerBackgroundColor: "oklch(0.968 0.007 247.896)", // secondary
    /* Changes the hover colour of the row*/
    rowHoverColor: "oklch(0.929 0.013 255.508)", // border
    /* Changes the grid border color */
    borderColor: "oklch(0.704 0.04 256.788)", // ring
  });
  function trayectoria() {
    setData([]);
    posicion = [];
    tiempo = [];
    for (let i = 0; i < N; i++) {
      const t = (tTray * i) / (N - 1);
      const xTeo = xIni + velocidad * t;
      const x = xTeo + (Math.random() * 2 - 1) * Math.abs(xTeo) * 0.05;
      posicionTeorica.push(parseFloat(xTeo.toFixed(3)));
      posicion.push(parseFloat(x.toFixed(3)));
      tiempo.push(parseFloat(t.toFixed(3)));
    }
    const newData: {
      tiempo: number;
      posicionMedida: number;
      posicionTeorica: number;
    }[] = [];
    for (let i = 0; i < N; i++) {
      newData.push({
        tiempo: tiempo[i],
        posicionMedida: posicion[i],
        posicionTeorica: posicionTeorica[i],
      });
    }
    setData(newData);
    setChartData([
      {
        x: tiempo,
        y: posicion,
        type: "scatter",
        mode: "markers",
        marker: { color: "red" },
        name: "Posición medida",
        showlegend: true,
      },
      {
        x: tiempo,
        y: posicionTeorica,
        type: "scatter",
        mode: "lines",
        line: { color: "blue" },
        name: "Posición teórica",
        showlegend: true,
      },
    ]);
    setColDefs([
      { headerName: "Tiempo / s", field: "tiempo" as const },
      { headerName: "Posición Medida / m", field: "posicionMedida" as const },
      { headerName: "Posición Teórica / m", field: "posicionTeorica" as const },
    ]);
  }

  return (
    <>
      <Layout>
        <h1 style={{ textAlign: "center" }}>MRU</h1>
        <div style={{ display: "flex", justifyContent: "center" }}>
          <Alert style={{ maxWidth: "450px" }}>
            <AlertTitle>Atención!</AlertTitle>
            <AlertDescription>
              Recuerda que no funcionará si:
              <ul>
                <li>La masa es menor o igual que cero</li>
                <li>El tiempo es menor o igual que cero</li>
                <li>El número de cálculos es menor o igual que cero</li>
                <li>El número de cálculos es mayor que 500</li>
              </ul>
            </AlertDescription>
          </Alert>
        </div>
        <br></br>
        <div
          style={{
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
          }}
        >
          <div
            style={{
              display: "flex",
              gap: 80,
              flexWrap: "nowrap",
              alignItems: "flex-start",
              justifyContent: "center",
            }}
          >
            <div style={{ flex: "0 0 auto", width: "600px" }}>
              <Card style={{ height: 550 }}>
                <CardHeader>
                  <CardTitle>Datos Iniciales</CardTitle>
                  <CardDescription>
                    Introduce los valores iniciales para el cálculo del MRU.
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <Label>Velocidad (m/s): </Label>
                  <Input
                    type="number"
                    style={{ width: "150px" }}
                    placeholder="Velocidad"
                    value={velocidad}
                    onChange={(e) => setVelocidad(parseFloat(e.target.value))}
                  />
                </CardContent>
                <CardContent>
                  <Label>Masa (kg): </Label>
                  <Input
                    type="number"
                    style={{ width: "150px" }}
                    placeholder="Masa"
                    value={masa}
                    onChange={(e) => setMasa(parseFloat(e.target.value))}
                  />
                </CardContent>
                <CardContent>
                  <Label>Posición Inicial (m):</Label>
                  <Input
                    type="number"
                    style={{ width: "150px" }}
                    placeholder="Posición Inicial"
                    value={xIni}
                    onChange={(e) => setXIni(parseFloat(e.target.value))}
                  />
                </CardContent>
                <CardContent>
                  <Label>Tiempo del Recorrido (s): </Label>
                  <Input
                    type="number"
                    style={{ width: "150px" }}
                    placeholder="Tiempo"
                    value={tTray}
                    onChange={(e) => setTTray(parseFloat(e.target.value))}
                  />
                </CardContent>
                <CardContent>
                  <Label>Número de Cálculos: </Label>
                  <Input
                    type="number"
                    style={{ width: "150px" }}
                    placeholder="Número de Cálculos"
                    value={N}
                    onChange={(e) => setN(parseFloat(e.target.value))}
                  />
                </CardContent>
                <CardFooter>
                  <p>
                    Recuerda que los datos tienen que introducirse en las
                    unidades correctas.
                  </p>
                </CardFooter>
              </Card>
            </div>

            <div
              style={{ flex: "0 0 auto", width: "600px", height: 550 }}
              className="ag-theme-quartz"
            >
              <AgGridReact
                theme={myTheme}
                rowData={data}
                columnDefs={colDefs}
              />
            </div>
          </div>
          <div
            style={{
              display: "flex",
              gap: 12,
              justifyContent: "center",
              marginTop: 16,
            }}
          >
            <Button
              onClick={trayectoria}
              disabled={masa <= 0 || N <= 0 || N > 500 || tTray <= 0}
            >
              <Rocket className="mr-2 h-4 w-4" />
              Calcular Trayectoria
            </Button>
            <Button
              onClick={() => {
                const now = new Date();
                const timestamp = now
                  .toISOString()
                  .replace(/[:.]/g, "-")
                  .slice(0, -5);
                exportToExcel({
                  data: data.map((row) => ({
                    "Tiempo (s)": row.tiempo,
                    "Posición Medida (m)": row.posicionMedida,
                    "Posición Teórica (m)": row.posicionTeorica,
                  })),
                  fileName: `datos-mru-${timestamp}`,
                  sheetName: "Resultados MRU",
                });
              }}
              variant="outline"
              disabled={data.length === 0}
            >
              <FileSpreadsheet className="mr-2 h-4 w-4" />
              Exportar a Excel
            </Button>
          </div>
        </div>

        <br></br>
        <br></br>
        <div
          style={{
            borderRadius: 12,
            boxShadow: "0 8px 24px rgba(0,0,0,0.6)",
            overflow: "hidden",
            display: "block",
            width: 1440,
            margin: "0 auto",
          }}
        >
          <Plot
            data={chartData}
            layout={{
              width: 1440,
              height: 1080,
              title: { text: "Posición en función del tiempo" },
              paper_bgcolor: "#FFFFFF",
              plot_bgcolor: "#FFFFFF",
              font: { color: "black" },
              margin: { t: 60, b: 60, l: 60, r: 60 },
              xaxis: {
                title: { text: "Tiempo (s)" },
                gridcolor: "#222", // even more muted gray
                gridwidth: 0.3,
                linecolor: "grey",
                tickcolor: "grey",
                tickfont: { color: "grey" },
                color: "grey", // Force axis line and label color
              },
              yaxis: {
                title: { text: "Posición (m)" },
                gridcolor: "#222", // even more muted gray
                gridwidth: 0.3,
                linecolor: "grey",
                tickcolor: "grey",
                tickfont: { color: "grey" },
                color: "grey", // Force axis line and label color
              },
            }}
            config={{ displayModeBar: true }}
            style={{ borderRadius: "12px" }}
          />
        </div>
        <br></br>
      </Layout>
    </>
  );
};

export default Mru;
