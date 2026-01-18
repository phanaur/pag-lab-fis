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
  line?: {
    color?: string;
    shape?: "hv" | "linear" | "spline" | "vh" | "hvh" | "vhv";
  };
  name: string;
  showlegend: boolean;
}

// Movimiento Rectilíneo Uniforme (MRU)
const Mru = () => {
  let tiempo: number[] = [];
  let angulo: number[] = [];
  let anguloTeorico: number[] = [];
  const [velocidadAngular, setVelocidadAngular] = useState<number>(1);
  const [masa, setMasa] = useState<number>(3);
  const [phiIni, setPhiIni] = useState<number>(0);
  const [radio, setRadio] = useState<number>(0.5);
  const [tTray, setTTray] = useState<number>(30);
  const [N, setN] = useState<number>(500);
  const [chartData, setChartData] = useState<ChartTrace[]>([
    {
      x: tiempo,
      y: angulo,
      type: "scatter",
      mode: "lines+markers",
      marker: { color: "red" },
      name: "Posición medida",
      showlegend: true,
    },
  ]);
  const xTeo: number[] = [];
  const yTeo: number[] = [];
  let x: number[] = [];
  let y: number[] = [];
  const [chartAng, setChartAng] = useState<ChartTrace[]>([
    {
      x: x,
      y: y,
      type: "scatter",
      mode: "lines+markers",
      marker: { color: "red" },
      name: "Posición medida",
      showlegend: true,
    },
  ]);
  const [data, setData] = useState<
    { tiempo: number; anguloMedido: number; anguloTeorico: number }[]
  >([]);

  const [colDefs, setColDefs] = useState<
    {
      headerName?: string;
      field: "tiempo" | "anguloMedido" | "anguloTeorico";
    }[]
  >([
    { field: "tiempo" },
    { field: "anguloMedido" },
    { field: "anguloTeorico" },
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
    x = [];
    y = [];
    anguloTeorico = [];
    angulo = [];
    tiempo = [];
    for (let i = 0; i < N; i++) {
      const t = (tTray * i) / (N - 1);
      const phiTeo = phiIni + velocidadAngular * t;
      const phi = phiTeo + (Math.random() * 2 - 1) * phiTeo * 0.05; // Ruido del 5%
      anguloTeorico.push(parseFloat(phiTeo.toFixed(4)));
      angulo.push(parseFloat(phi.toFixed(4)));
      tiempo.push(parseFloat(t.toFixed(4)));
    }
    const newData: {
      tiempo: number;
      anguloMedido: number;
      anguloTeorico: number;
    }[] = [];
    for (let i = 0; i < N; i++) {
      newData.push({
        tiempo: tiempo[i],
        anguloMedido: angulo[i],
        anguloTeorico: anguloTeorico[i],
      });
      xTeo.push(radio * Math.cos(anguloTeorico[i]));
      yTeo.push(radio * Math.sin(anguloTeorico[i]));
      x.push(radio * Math.cos(angulo[i]));
      y.push(radio * Math.sin(angulo[i]));
    }
    setData(newData);
    setChartData([
      {
        x: tiempo,
        y: angulo,
        type: "scatter",
        mode: "markers",
        marker: { color: "red" },
        name: "Ángulo medido",
        showlegend: true,
      },
      {
        x: tiempo,
        y: anguloTeorico,
        type: "scatter",
        mode: "lines",
        line: { shape: "spline" },
        name: "Ángulo teórico",
        showlegend: true,
      },
    ]);
    setChartAng([
      {
        x: tiempo,
        y: y,
        type: "scatter",
        mode: "markers",
        marker: { color: "red" },
        name: "Posición Y medida",
        showlegend: true,
      },
      {
        x: tiempo,
        y: yTeo,
        type: "scatter",
        mode: "lines",
        line: { color: "blue", shape: "spline" },
        name: "Posición Y teórica",
        showlegend: true,
      },
      {
        x: tiempo,
        y: x,
        type: "scatter",
        mode: "markers",
        marker: { color: "orange" },
        name: "Posición X medida",
        showlegend: true,
      },
      {
        x: tiempo,
        y: xTeo,
        type: "scatter",
        mode: "lines",
        line: { color: "green", shape: "spline" },
        name: "Posición X teórica",
        showlegend: true,
      },
    ]);
    setColDefs([
      { headerName: "Tiempo / s", field: "tiempo" as const },
      { headerName: "Ángulo Medido / rad", field: "anguloMedido" as const },
      { headerName: "Ángulo Teórico / rad", field: "anguloTeorico" as const },
    ]);
  }

  return (
    <>
      <Layout>
        <h1 style={{ textAlign: "center" }}>MCU</h1>
        <div style={{ display: "flex", justifyContent: "center" }}>
          <Alert style={{ maxWidth: "450px" }}>
            <AlertTitle>Atención!</AlertTitle>
            <AlertDescription>
              Recuerda que no funcionará si:
              <ul>
                <li>La masa es menor o igual que cero</li>
                <li>El tiempo es menor o igual que cero</li>
                <li>El número de cálculos es menor o igual que cero</li>
                <li>El número de cálculos es mayor que 1000</li>
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
              <Card style={{ height: 600 }}>
                <CardHeader>
                  <CardTitle>Datos Iniciales</CardTitle>
                  <CardDescription>
                    Introduce los valores iniciales para el cálculo del MCU.
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <Label>Velocidad (rad/s): </Label>
                  <Input
                    style={{ width: "150px" }}
                    placeholder="Velocidad (rad/s)"
                    value={velocidadAngular}
                    onChange={(e) =>
                      setVelocidadAngular(parseFloat(e.target.value))
                    }
                  />
                </CardContent>
                <CardContent>
                  <Label>Masa (kg): </Label>
                  <Input
                    type ="number"
                    style={{ width: "150px" }}
                    placeholder="Masa"
                    value={masa}
                    onChange={(e) => setMasa(parseFloat(e.target.value))}
                  />
                </CardContent>
                <CardContent>
                  <Label>Ángulo Inicial (rad):</Label>
                  <Input
                    type="number"
                    style={{ width: "150px" }}
                    placeholder="Ángulo Inicial (rad)"
                    value={phiIni}
                    onChange={(e) => setPhiIni(parseFloat(e.target.value))}
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
                  <Label>Radio de Giro (m): </Label>
                  <Input
                    type="number"
                    style={{ width: "150px" }}
                    placeholder="Radio de Giro"
                    value={radio}
                    onChange={(e) => setRadio(parseFloat(e.target.value))}
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
              style={{ flex: "0 0 auto", width: "600px", height: 600 }}
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
              disabled={masa <= 0 || N <= 0 || N > 1000 || tTray <= 0}
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
                    "Ángulo Medido (rad)": row.anguloMedido,
                    "Ángulo Teórico (rad)": row.anguloTeorico,
                  })),
                  fileName: `datos-mcu-${timestamp}`,
                  sheetName: "Resultados MCU",
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
                title: { text: "Ángulo (rad)" },
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
            data={chartAng}
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
