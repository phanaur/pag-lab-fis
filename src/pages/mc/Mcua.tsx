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
const Mcua = () => {
  let tiempo: number[] = [];
  let angExp: number[] = [];
  let angTeo: number[] = [];
  const [radio, setRadio] = useState<number>(0.5);
  let velAngTeo: number[] = [];
  let velAngExp: number[] = [];
  const [acelAng, setAcelAng] = useState<number>(3);
  const [velAngI, setVelAngI] = useState<number>(1);
  const [masa, setMasa] = useState<number>(3);
  const [phiIni, setPhiIni] = useState<number>(0);
  const [tTray, setTTray] = useState<number>(10);
  const [N, setN] = useState<number>(500);
  const [chartDataAng, setChartDataAng] = useState<ChartTrace[]>([
    {
      x: tiempo,
      y: angExp,
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
      y: velAngExp,
      type: "scatter",
      mode: "lines+markers",
      marker: { color: "blue" },
      name: "Velocidad medida",
      showlegend: true,
    },
  ]);
  let xExp: number[] = [];
  let yExp: number[] = [];
  let xTeo: number[] = [];
  let yTeo: number[] = [];
  const [chartDataPos, setChartDataPos] = useState<ChartTrace[]>([
    {
      x: xExp,
      y: yExp,
      type: "scatter",
      mode: "lines+markers",
      marker: { color: "green" },
      name: "Trayectoria",
      showlegend: true,
    },
  ]);
  const [data, setData] = useState<
    {
      tiempo: number;
      angExp: number;
      angTeo: number;
      velAngExp: number;
      velAngTeo: number;
    }[]
  >([]);
  const [colDefs, setColDefs] = useState<
    {
      headerName?: string;
      field: "tiempo" | "angExp" | "angTeo" | "velAngTeo" | "velAngExp";
    }[]
  >([
    { field: "tiempo" },
    { field: "angExp" },
    { field: "angTeo" },
    { field: "velAngTeo" },
    { field: "velAngExp" },
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
    //if(velocidad !== undefined && masa !== undefined && xIni !== undefined && tTray !== undefined && N !== undefined && masa > 0 && tTray > 0 && 0 < N && N > 100) {
    setData([]);
    angExp = [];
    tiempo = [];
    angTeo = [];
    velAngTeo = [];
    velAngExp = [];
    xExp = [];
    yExp = [];
    xTeo = [];
    yTeo = [];
    for (let i = 0; i < N; i++) {
      const t = (tTray * i) / (N - 1);
      const vTeo = velAngI + acelAng * t;
      const vMed = vTeo + (Math.random() * 2 - 1) * vTeo * 0.05;
      const phiTeo = phiIni + velAngI * t + 0.5 * acelAng * t * t;
      const phiExp = phiTeo + (Math.random() * 2 - 1) * phiTeo * 0.05;
      angTeo.push(parseFloat(phiTeo.toFixed(4)));
      angExp.push(parseFloat(phiExp.toFixed(4)));
      tiempo.push(parseFloat(t.toFixed(4)));
      velAngTeo.push(parseFloat(vTeo.toFixed(4)));
      velAngExp.push(parseFloat(vMed.toFixed(4)));
      xTeo.push(parseFloat((radio * Math.cos(phiTeo)).toFixed(4)));
      yTeo.push(parseFloat((radio * Math.sin(phiTeo)).toFixed(4)));
      xExp.push(parseFloat((radio * Math.cos(phiExp)).toFixed(4)));
      yExp.push(parseFloat((radio * Math.sin(phiExp)).toFixed(4)));
    }
    const newData: {
      tiempo: number;
      angExp: number;
      angTeo: number;
      velAngExp: number;
      velAngTeo: number;
    }[] = [];
    for (let i = 0; i < N; i++) {
      newData.push({
        tiempo: tiempo[i],
        angExp: angExp[i],
        angTeo: angTeo[i],
        velAngExp: velAngExp[i],
        velAngTeo: velAngTeo[i],
      });
    }

    setData(newData);
    setChartDataAng([
      {
        x: tiempo,
        y: angExp,
        type: "scatter",
        mode: "markers",
        marker: { color: "red" },
        name: "Ángulo Experimental (rad)",
        showlegend: true,
      },
      {
        x: tiempo,
        y: angTeo,
        type: "scatter",
        mode: "lines",
        line: { color: "blue", shape: "spline" },
        name: "Ángulo Teórico (rad)",
        showlegend: true,
      },
    ]);
    setChartDataVel([
      {
        x: tiempo,
        y: velAngExp,
        type: "scatter",
        mode: "markers",
        marker: { color: "orange" },
        name: "Velocidad Angular Experimental (rad/s)",
        showlegend: true,
      },
      {
        x: tiempo,
        y: velAngTeo,
        type: "scatter",
        mode: "lines",
        line: { color: "green" },
        name: "Velocidad Angular Teórica (rad/s)",
        showlegend: true,
      },
    ]);
    setChartDataPos([
      {
        x: tiempo,
        y: yTeo,
        type: "scatter",
        mode: "lines",
        line: { color: "blue", shape: "spline" },
        name: "Posición Y teórica (m)",
        showlegend: true,
      },
      {
        x: tiempo,
        y: yExp,
        type: "scatter",
        mode: "markers",
        marker: { color: "red" },
        name: "Posición Y experimental (m)",
        showlegend: true,
      },
      {
        x: tiempo,
        y: xTeo,
        type: "scatter",
        mode: "lines",
        line: { color: "green", shape: "spline" },
        name: "Posición X teórica (m)",
        showlegend: true,
      },
      {
        x: tiempo,
        y: xExp,
        type: "scatter",
        mode: "markers",
        marker: { color: "orange" },
        name: "Posición X experimental (m)",
        showlegend: true,
      },
    ]);
    setColDefs([
      { headerName: "Tiempo / s", field: "tiempo" as const },
      { headerName: "Ángulo Exp(rad)", field: "angExp" as const },
      { headerName: "Ángulo Teo (rad)", field: "angTeo" as const },
      {
        headerName: "Velocidad Angular Teo (rad/s)",
        field: "velAngTeo" as const,
      },
      {
        headerName: "Velocidad Angular Exp (rad/s)",
        field: "velAngExp" as const,
      },
    ]);
  }

  return (
    <>
      <Layout>
        <h1 style={{ textAlign: "center" }}>MCUA</h1>
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
              <Card style={{ height: 650 }}>
                <CardHeader>
                  <CardTitle>Datos Iniciales</CardTitle>
                  <CardDescription>
                    Introduce los valores iniciales para el cálculo del MCUA.
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <Label>Velocidad Angular Inicial (rad/s): </Label>
                  <Input
                    type="number"
                    style={{ width: "150px" }}
                    placeholder="Velocidad Inicial"
                    value={velAngI}
                    onChange={(e) => setVelAngI(parseFloat(e.target.value))}
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
                  <Label>Aceleración Angular (rad/s²): </Label>
                  <Input
                    type="number"
                    style={{ width: "150px" }}
                    placeholder="Aceleración"
                    value={acelAng}
                    onChange={(e) => setAcelAng(parseFloat(e.target.value))}
                  />
                </CardContent>
                <CardContent>
                  <Label>Ángulo Inicial (rad):</Label>
                  <Input
                    type="number"
                    style={{ width: "150px" }}
                    placeholder="Ángulo Inicial"
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
                  <Label>Radio (m): </Label>
                  <Input
                    type="number"
                    style={{ width: "150px" }}
                    placeholder="Radio"
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
              style={{ flex: "0 0 auto", width: "1000px", height: 650 }}
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
                    "Ángulo Exp (rad)": row.angExp,
                    "Ángulo Teo (rad)": row.angTeo,
                    "Velocidad Angular Exp (rad/s)": row.velAngExp,
                    "Velocidad Angular Teo (rad/s)": row.velAngTeo,
                  })),
                  fileName: `datos-mcua-${timestamp}`,
                  sheetName: "Resultados MCUA",
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
            data={chartDataAng}
            layout={{
              width: 1440,
              height: 1080,
              title: { text: "Ángulo en función del tiempo" },
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
              title: { text: "Velocidad Angular en función del tiempo" },
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
                title: { text: "Velocidad Angular (rad/s)" },
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
      </Layout>
    </>
  );
};

export default Mcua;
