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
  Item,
  ItemContent,
  ItemDescription,
  ItemTitle,
} from "@/components/ui/item";
import {
  Card,
  CardAction,
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
const Tiropar = () => {
  let tiempo: number[] = [];
  let posXExp: number[] = [];
  let posYExp: number[] = [];
  let posXTeo: number[] = [];
  let posYTeo: number[] = [];
  let velXTeo: number[] = [];
  let velYTeo: number[] = [];
  let velXExp: number[] = [];
  let velYExp: number[] = [];
  const G = -9.81; // Aceleración debida a la gravedad en m/s²
  const [velI, setVelI] = useState<number>(27);
  const [masa, setMasa] = useState<number>(3);
  const [xIni, setXIni] = useState<number>(0);
  const [yIni, setYIni] = useState<number>(0);
  const [ang, setAng] = useState<number>(45); // 45 grados en radianes
  const [N, setN] = useState<number>(100);
  const [chartDataPar, setChartDataPar] = useState<ChartTrace[]>([
    {
      x: posXExp,
      y: posYExp,
      type: "scatter",
      mode: "lines+markers",
      marker: { color: "red" },
      name: "Posición medida",
      showlegend: true,
    },
  ]);
  const [chartDataPos, setChartDataPos] = useState<ChartTrace[]>([
    {
      x: tiempo,
      y: posXExp,
      type: "scatter",
      mode: "lines+markers",
      marker: { color: "red" },
      name: "Posición medida",
      showlegend: true,
    },
  ]);
  const [chartDataVel, setChartDataVel] = useState<ChartTrace[]>([
    {
      x: tiempo,
      y: velXExp,
      type: "scatter",
      mode: "lines+markers",
      marker: { color: "blue" },
      name: "Velocidad medida",
      showlegend: true,
    },
  ]);

  const [data, setData] = useState<
    {
      tiempo: number;
      posXExp: number;
      posXTeo: number;
      posYExp: number;
      posYTeo: number;
      velXExp: number;
      velXTeo: number;
      velYExp: number;
      velYTeo: number;
    }[]
  >([]);
  const [colDefs, setColDefs] = useState<
    {
      headerName?: string;
      field:
        | "tiempo"
        | "posXExp"
        | "posXTeo"
        | "posYExp"
        | "posYTeo"
        | "velXExp"
        | "velXTeo"
        | "velYExp"
        | "velYTeo";
    }[]
  >([
    { field: "tiempo" },
    { field: "posXExp" },
    { field: "posXTeo" },
    { field: "posYExp" },
    { field: "posYTeo" },
    { field: "velXExp" },
    { field: "velXTeo" },
    { field: "velYExp" },
    { field: "velYTeo" },
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
    posXExp = [];
    tiempo = [];
    posXTeo = [];
    velXTeo = [];
    velXExp = [];
    posYExp = [];
    posYTeo = [];
    velYExp = [];
    velYTeo = [];
    const tTray = (2 * velI * Math.sin(ang)) / Math.abs(G); // Tiempo total de vuelo
    for (let i = 0; i < N; i++) {
      const t = (tTray * i) / (N - 1);
      const vxTeo = velI * Math.cos(ang);
      const vxMed = vxTeo + (Math.random() * 2 - 1) * Math.abs(vxTeo) * 0.05;
      const xTeo = xIni + vxTeo * t;
      const x = xTeo + (Math.random() * 2 - 1) * Math.abs(xTeo) * 0.05;
      const vyTeo = velI * Math.sin(ang) + G * t;
      const vyMed = vyTeo + (Math.random() * 2 - 1) * Math.abs(vyTeo) * 0.05;
      const yTeo = yIni + velI * Math.sin(ang) * t + 0.5 * G * t * t;
      const y = yTeo + (Math.random() * 2 - 1) * Math.abs(yTeo) * 0.05;
      posYTeo.push(parseFloat(yTeo.toFixed(4)));
      posYExp.push(parseFloat(y.toFixed(4)));
      velYTeo.push(parseFloat(vyTeo.toFixed(4)));
      velYExp.push(parseFloat(vyMed.toFixed(4)));
      posXTeo.push(parseFloat(xTeo.toFixed(4)));
      posXExp.push(parseFloat(x.toFixed(4)));
      tiempo.push(parseFloat(t.toFixed(4)));
      velXTeo.push(parseFloat(vxTeo.toFixed(4)));
      velXExp.push(parseFloat(vxMed.toFixed(4)));
    }
    const newData: {
      tiempo: number;
      posXExp: number;
      posXTeo: number;
      posYExp: number;
      posYTeo: number;
      velXExp: number;
      velXTeo: number;
      velYExp: number;
      velYTeo: number;
    }[] = [];
    for (let i = 0; i < N; i++) {
      newData.push({
        tiempo: tiempo[i],
        posXExp: posXExp[i],
        posXTeo: posXTeo[i],
        posYExp: posYExp[i],
        posYTeo: posYTeo[i],
        velXExp: velXExp[i],
        velXTeo: velXTeo[i],
        velYExp: velYExp[i],
        velYTeo: velYTeo[i],
      });
    }

    setData(newData);
    setChartDataPos([
      {
        x: tiempo,
        y: posXExp,
        type: "scatter",
        mode: "markers",
        marker: { color: "red" },
        name: "Posición X Exp (m)",
        showlegend: true,
      },
      {
        x: tiempo,
        y: posXTeo,
        type: "scatter",
        mode: "lines",
        line: { color: "blue", shape: "spline" },
        name: "Posición X Teo (m)",
        showlegend: true,
      },
      {
        x: tiempo,
        y: posYExp,
        type: "scatter",
        mode: "markers",
        marker: { color: "orange" },
        name: "Posición Y Exp (m)",
        showlegend: true,
      },
      {
        x: tiempo,
        y: posYTeo,
        type: "scatter",
        mode: "lines",
        line: { color: "green", shape: "spline" },
        name: "Posición Y Teo (m)",
        showlegend: true,
      },
    ]);
    setChartDataVel([
      {
        x: tiempo,
        y: velXExp,
        type: "scatter",
        mode: "markers",
        marker: { color: "red" },
        name: "Velocidad X Exp (m/s)",
        showlegend: true,
      },
      {
        x: tiempo,
        y: velXTeo,
        type: "scatter",
        mode: "lines",
        line: { color: "blue" },
        name: "Velocidad X Teo (m/s)",
        showlegend: true,
      },
      {
        x: tiempo,
        y: velYExp,
        type: "scatter",
        mode: "markers",
        marker: { color: "orange" },
        name: "Velocidad Y Exp (m/s)",
        showlegend: true,
      },
      {
        x: tiempo,
        y: velYTeo,
        type: "scatter",
        mode: "lines",
        line: { color: "green" },
        name: "Velocidad Y Teo (m/s)",
        showlegend: true,
      },
    ]);
    setChartDataPar([
      {
        x: posXExp,
        y: posYExp,
        type: "scatter",
        mode: "markers",
        marker: { color: "red" },
        name: "Posición Y exp (m)",
        showlegend: true,
      },
      {
        x: posXTeo,
        y: posYTeo,
        type: "scatter",
        mode: "lines",
        line: { color: "blue", shape: "spline" },
        name: "Posición Y Teo (m)",
        showlegend: true,
      },
    ]);
    setColDefs([
      { headerName: "Tiempo / s", field: "tiempo" as const },
      { headerName: "PosX Exp/ m", field: "posXExp" as const },
      { headerName: "PosX Teo / m", field: "posXTeo" as const },
      { headerName: "PosY Exp/ m", field: "posYExp" as const },
      { headerName: "PosY Teo / m", field: "posYTeo" as const },
      { headerName: "VelX Teo / m/s", field: "velXTeo" as const },
      { headerName: "VelX Exp / m/s", field: "velXExp" as const },
      { headerName: "VelY Teo / m/s", field: "velYTeo" as const },
      { headerName: "VelY Exp / m/s", field: "velYExp" as const },
    ]);
  }

  return (
    <>
      <Layout>
        <h1 style={{ textAlign: "center" }}>Tiro Parabólico</h1>
        <div style={{ display: "flex", justifyContent: "center" }}>
          <Alert style={{ maxWidth: "450px" }}>
            <AlertTitle>Atención!</AlertTitle>
            <AlertDescription>
              Recuerda que no funcionará si:
              <ul>
                <li>La masa es menor o igual que cero</li>
                <li>La aceleración es menor o igual que cero</li>
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
            justifyContent: "center",
            flexDirection: "column",
            alignItems: "center",
          }}
        >
          <div
            style={{
              display: "flex",
              gap: 160,
              flexWrap: "wrap",
              alignItems: "flex-start",
              justifyContent: "center",
            }}
          >
            <div style={{ flex: "1 1 320px", maxWidth: "33%" }}>
              <Card>
                <CardHeader>
                  <CardTitle>Datos Iniciales</CardTitle>
                  <CardDescription>
                    Introduce los valores iniciales para el cálculo del tiro
                    parabólico.
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <Label>Velocidad Inicial (m/s): </Label>
                  <Input
                    type="number"
                    style={{ width: "150px" }}
                    placeholder="Velocidad Inicial"
                    value={velI}
                    onChange={(e) => setVelI(parseFloat(e.target.value))}
                  />
                </CardContent>
                <CardContent>
                  <Label>Masa(kg): </Label>
                  <Input
                    type="number"
                    style={{ width: "150px" }}
                    placeholder="Masa"
                    value={masa}
                    onChange={(e) => setMasa(parseFloat(e.target.value))}
                  />
                </CardContent>
                <CardContent>
                  <Label>Posición X Inicial(m):</Label>
                  <Input
                    type="number"
                    style={{ width: "150px" }}
                    placeholder="Posición Inicial"
                    value={xIni}
                    onChange={(e) => setXIni(parseFloat(e.target.value))}
                  />
                </CardContent>
                <CardContent>
                  <Label>Posición Y Inicial(m): </Label>
                  <Input
                    type="number"
                    style={{ width: "150px" }}
                    placeholder="Posición Y Inicial"
                    value={yIni}
                    onChange={(e) => setYIni(parseFloat(e.target.value))}
                  />
                </CardContent>
                <CardContent>
                  <Label>Ángulo (°): </Label>
                  <Input
                    type="number"
                    style={{ width: "150px" }}
                    placeholder="Ángulo"
                    value={ang}
                    onChange={(e) =>
                      setAng((parseFloat(e.target.value) * 180) / Math.PI)
                    }
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
            <div style={{ flex: "1 1 320px", maxWidth: "35%" }}>
              <Card>
                <CardHeader>
                  <CardTitle>Resultados Principales</CardTitle>
                  <CardDescription>
                    Los resultados más relevantes del lanzamiento.
                  </CardDescription>
                  <CardAction>Tiro Parabólico</CardAction>
                </CardHeader>
                <CardContent>
                  <Item variant="outline">
                    <ItemContent>
                      <ItemTitle>Alcance del proyectil teórico:</ItemTitle>
                      <ItemDescription>
                        {Math.max(...data.map((d) => d.posXTeo))} m
                      </ItemDescription>
                    </ItemContent>
                  </Item>
                  <Item variant="outline">
                    <ItemContent>
                      <ItemTitle>Alcance del proyectil experimental:</ItemTitle>
                      <ItemDescription>
                        {Math.max(...data.map((d) => d.posXExp))} m
                      </ItemDescription>
                    </ItemContent>
                  </Item>
                </CardContent>
                <CardContent>
                  <Item variant="outline">
                    <ItemContent>
                      <ItemTitle>Altura máxima teórica:</ItemTitle>
                      <ItemDescription>
                        {Math.max(...data.map((d) => d.posYTeo))} m
                      </ItemDescription>
                    </ItemContent>
                  </Item>
                  <Item variant="outline">
                    <ItemContent>
                      <ItemTitle>Altura máxima experimental:</ItemTitle>
                      <ItemDescription>
                        {Math.max(...data.map((d) => d.posYExp))} m
                      </ItemDescription>
                    </ItemContent>
                  </Item>
                </CardContent>
                <CardContent>
                  <Item variant="outline">
                    <ItemContent>
                      <ItemTitle>Tiempo total de vuelo:</ItemTitle>
                      <ItemDescription>
                        {Math.max(...data.map((d) => d.tiempo))} s
                      </ItemDescription>
                    </ItemContent>
                  </Item>
                </CardContent>
                <CardFooter>
                  <p>Estos datos se pueden obtener de la tabla.</p>
                </CardFooter>
              </Card>
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
              disabled={masa <= 0 || N <= 0 || N > 500 || velI <= 0}
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
                    "Posición X Medida (m)": row.posXExp,
                    "Posición X Teórica (m)": row.posXTeo,
                    "Posición Y Medida (m)": row.posYExp,
                    "Posición Y Teórica (m)": row.posYTeo,
                    "Velocidad X Medida (m/s)": row.velXExp,
                    "Velocidad X Teórica (m/s)": row.velXTeo,
                    "Velocidad Y Medida (m/s)": row.velYExp,
                    "Velocidad Y Teórica (m/s)": row.velYTeo,
                  })),
                  fileName: `datos-tiropar-${timestamp}`,
                  sheetName: "Resultados Tiro Parabólico",
                });
              }}
              variant="outline"
              disabled={data.length === 0}
            >
              <FileSpreadsheet className="mr-2 h-4 w-4" />
              Exportar a Excel
            </Button>
          </div>
          <br></br>
          <br></br>
        </div>
        <div style={{ height: 500, width: 1800 }} className="ag-theme-quartz">
          <AgGridReact theme={myTheme} rowData={data} columnDefs={colDefs} />
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
            data={chartDataPar}
            layout={{
              width: 1440,
              height: 1080,
              title: { text: "Posición Y en función de X" },
              paper_bgcolor: "#FFFFFF",
              plot_bgcolor: "#FFFFFF",
              font: { color: "black" },
              margin: { t: 60, b: 60, l: 60, r: 60 },
              xaxis: {
                title: { text: "Posición X (m)" },
                gridcolor: "#222", // even more muted gray
                gridwidth: 0.3,
                linecolor: "grey",
                tickcolor: "grey",
                tickfont: { color: "grey" },
                color: "grey", // Force axis line and label color
              },
              yaxis: {
                title: { text: "Posición Y (m)" },
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
            data={chartDataPos}
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
            data={chartDataVel}
            layout={{
              width: 1440,
              height: 1080,
              title: { text: "Velocidad en función del tiempo" },
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
                title: { text: "Velocidad (m/s)" },
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

export default Tiropar;
