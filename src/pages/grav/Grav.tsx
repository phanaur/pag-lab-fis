import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useState, useEffect, useRef } from "react";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Globe, FileSpreadsheet, Plus, Trash2 } from "lucide-react";
import { AllCommunityModule, ModuleRegistry } from "ag-grid-community";
import type { ColDef, ValueFormatterParams } from "ag-grid-community";
ModuleRegistry.registerModules([AllCommunityModule]);
import { AgGridReact } from "ag-grid-react";
import { themeQuartz } from "ag-grid-community";
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


// Constants
const G = 6.674e-11; // Gravitational constant (N⋅m²/kg²)

interface Mass {
  id: number;
  mass: number; // in kilograms (always positive)
  x: number; // x position in meters
  y: number; // y position in meters
}

interface FieldVector {
  x: number;
  y: number;
  gx: number;
  gy: number;
  magnitude: number;
}

const Grav = () => {
  const [masses, setMasses] = useState<Mass[]>([]);
  const [newMass, setNewMass] = useState<number>(1e10);
  const [newX, setNewX] = useState<number>(0);
  const [newY, setNewY] = useState<number>(0);
  const [nextId, setNextId] = useState<number>(1);
  
  // Grid configuration
  const [gridResolution, setGridResolution] = useState<number>(20);
  const [xMin, setXMin] = useState<number>(-5);
  const [xMax, setXMax] = useState<number>(5);
  const [yMin, setYMin] = useState<number>(-5);
  const [yMax, setYMax] = useState<number>(5);
  
  const [fieldVectors, setFieldVectors] = useState<FieldVector[]>([]);
  const [showCalculation, setShowCalculation] = useState<boolean>(false);
  
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const equipotentialCanvasRef = useRef<HTMLCanvasElement>(null);

  // AG Grid configuration
  const [colDefs] = useState<ColDef<FieldVector>[]>([
    { field: "x", headerName: "X (m)", flex: 1 },
    { field: "y", headerName: "Y (m)", flex: 1 },
    { field: "gx", headerName: "gx (m/s²)", flex: 1, valueFormatter: (params: ValueFormatterParams) => params.value.toExponential(3) },
    { field: "gy", headerName: "gy (m/s²)", flex: 1, valueFormatter: (params: ValueFormatterParams) => params.value.toExponential(3) },
    { field: "magnitude", headerName: "|g| (m/s²)", flex: 1, valueFormatter: (params: ValueFormatterParams) => params.value.toExponential(3) },
  ]);

  const myTheme = themeQuartz.withParams({
    spacing: 2,
    foregroundColor: "oklch(0.208 0.042 265.755)",
    backgroundColor: "rgb(255, 255, 255)",
    headerBackgroundColor: "oklch(0.968 0.007 247.896)",
    rowHoverColor: "oklch(0.929 0.013 255.508)",
    borderColor: "oklch(0.704 0.04 256.788)",
  });

  // Add a mass
  const addMass = () => {
    if (isNaN(newMass) || isNaN(newX) || isNaN(newY) || newMass <= 0) {
      alert("Please enter valid numbers. Mass must be positive.");
      return;
    }
    
    const mass: Mass = {
      id: nextId,
      mass: newMass,
      x: newX,
      y: newY,
    };
    
    setMasses([...masses, mass]);
    setNextId(nextId + 1);
    
    // Reset inputs
    setNewMass(1e10);
    setNewX(0);
    setNewY(0);
  };

  // Remove a mass
  const removeMass = (id: number) => {
    setMasses(masses.filter(m => m.id !== id));
  };

  // Calculate gravitational field at a point
  const calculateFieldAtPoint = (x: number, y: number): { gx: number; gy: number } => {
    let gx = 0;
    let gy = 0;

    masses.forEach(mass => {
      const dx = x - mass.x;
      const dy = y - mass.y;
      const r = Math.sqrt(dx * dx + dy * dy);
      
      if (r > 0.01) { // Avoid singularity at mass location
        const g = (G * mass.mass) / (r * r);
        // Gravitational field points toward the mass (negative direction)
        gx -= g * (dx / r);
        gy -= g * (dy / r);
      }
    });

    return { gx, gy };
  };

  // Calculate field vectors on grid
  const calculateFieldVectors = () => {
    if (masses.length === 0) {
      alert("Please add at least one mass first");
      return;
    }

    const vectors: FieldVector[] = [];
    const stepX = (xMax - xMin) / (gridResolution - 1);
    const stepY = (yMax - yMin) / (gridResolution - 1);

    for (let i = 0; i < gridResolution; i++) {
      for (let j = 0; j < gridResolution; j++) {
        const x = xMin + i * stepX;
        const y = yMin + j * stepY;
        
        const { gx, gy } = calculateFieldAtPoint(x, y);
        const magnitude = Math.sqrt(gx * gx + gy * gy);
        
        vectors.push({ x, y, gx, gy, magnitude });
      }
    }

    setFieldVectors(vectors);
    setShowCalculation(true);
  };

  // Draw visualization on canvas
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    // Clear canvas
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    // Calculate scaling factors
    const padding = 40;
    const plotWidth = canvas.width - 2 * padding;
    const plotHeight = canvas.height - 2 * padding;
    const scaleX = plotWidth / (xMax - xMin);
    const scaleY = plotHeight / (yMax - yMin);

    // Helper function to convert world coordinates to canvas coordinates
    const toCanvasX = (x: number) => padding + (x - xMin) * scaleX;
    const toCanvasY = (y: number) => canvas.height - padding - (y - yMin) * scaleY;

    // Draw grid
    ctx.strokeStyle = '#e0e0e0';
    ctx.lineWidth = 1;
    for (let i = 0; i <= 10; i++) {
      const x = xMin + (xMax - xMin) * i / 10;
      const canvasX = toCanvasX(x);
      ctx.beginPath();
      ctx.moveTo(canvasX, padding);
      ctx.lineTo(canvasX, canvas.height - padding);
      ctx.stroke();

      const y = yMin + (yMax - yMin) * i / 10;
      const canvasY = toCanvasY(y);
      ctx.beginPath();
      ctx.moveTo(padding, canvasY);
      ctx.lineTo(canvas.width - padding, canvasY);
      ctx.stroke();
    }

    // Draw axes
    ctx.strokeStyle = '#000000';
    ctx.lineWidth = 2;
    
    // X-axis
    const zeroY = toCanvasY(0);
    if (zeroY >= padding && zeroY <= canvas.height - padding) {
      ctx.beginPath();
      ctx.moveTo(padding, zeroY);
      ctx.lineTo(canvas.width - padding, zeroY);
      ctx.stroke();
    }

    // Y-axis
    const zeroX = toCanvasX(0);
    if (zeroX >= padding && zeroX <= canvas.width - padding) {
      ctx.beginPath();
      ctx.moveTo(zeroX, padding);
      ctx.lineTo(zeroX, canvas.height - padding);
      ctx.stroke();
    }

    // Draw axis labels
    ctx.fillStyle = '#000000';
    ctx.font = '12px Arial';
    ctx.textAlign = 'center';
    ctx.fillText('X Position (m)', canvas.width / 2, canvas.height - 10);
    ctx.save();
    ctx.translate(15, canvas.height / 2);
    ctx.rotate(-Math.PI / 2);
    ctx.fillText('Y Position (m)', 0, 0);
    ctx.restore();

    // Helper function to get color based on magnitude
    const getColorFromMagnitude = (magnitude: number, maxMagnitude: number) => {
      // Use logarithmic scale for better color distribution
      const logMag = Math.log10(magnitude + 1);
      const logMax = Math.log10(maxMagnitude + 1);
      const normalized = Math.min(logMag / logMax, 1);
      
      // Enhanced color gradient: dark blue -> cyan -> green -> yellow -> orange -> red
      if (normalized < 0.2) {
        // Dark Blue to Bright Blue
        const t = normalized / 0.2;
        return `rgb(${Math.round(0 * (1 - t) + 30 * t)}, ${Math.round(0 * (1 - t) + 144 * t)}, ${Math.round(139 * (1 - t) + 255 * t)})`;
      } else if (normalized < 0.4) {
        // Bright Blue to Cyan
        const t = (normalized - 0.2) / 0.2;
        return `rgb(${Math.round(30 * (1 - t) + 0 * t)}, ${Math.round(144 * (1 - t) + 255 * t)}, ${Math.round(255 * (1 - t) + 255 * t)})`;
      } else if (normalized < 0.6) {
        // Cyan to Green
        const t = (normalized - 0.4) / 0.2;
        return `rgb(0, 255, ${Math.round(255 * (1 - t) + 50 * t)})`;
      } else if (normalized < 0.75) {
        // Green to Yellow
        const t = (normalized - 0.6) / 0.15;
        return `rgb(${Math.round(0 * (1 - t) + 255 * t)}, 255, ${Math.round(50 * (1 - t))})`;
      } else if (normalized < 0.9) {
        // Yellow to Orange
        const t = (normalized - 0.75) / 0.15;
        return `rgb(255, ${Math.round(255 * (1 - t) + 165 * t)}, 0)`;
      } else {
        // Orange to Red
        const t = (normalized - 0.9) / 0.1;
        return `rgb(255, ${Math.round(165 * (1 - t) + 0 * t)}, 0)`;
      }
    };

    // Draw field vectors
    if (fieldVectors.length > 0) {
      const maxMagnitude = Math.max(...fieldVectors.map(v => v.magnitude));
      const minMagnitude = Math.min(...fieldVectors.filter(v => v.magnitude > 0).map(v => v.magnitude));
      const arrowScale = Math.min(plotWidth, plotHeight) / (gridResolution * 0.7);

      fieldVectors.forEach((vector) => {
        if (vector.magnitude > 0) {
          const normalizedGx = (vector.gx / maxMagnitude) * arrowScale;
          const normalizedGy = (vector.gy / maxMagnitude) * arrowScale;

          const x1 = toCanvasX(vector.x);
          const y1 = toCanvasY(vector.y);
          const x2 = x1 + normalizedGx;
          const y2 = y1 - normalizedGy; // Subtract because canvas Y increases downward

          // Get color based on magnitude
          const color = getColorFromMagnitude(vector.magnitude, maxMagnitude);
          
          // Draw arrow line
          ctx.strokeStyle = color;
          ctx.fillStyle = color;
          ctx.lineWidth = 1.5;
          ctx.beginPath();
          ctx.moveTo(x1, y1);
          ctx.lineTo(x2, y2);
          ctx.stroke();

          // Draw smaller arrowhead
          const angle = Math.atan2(y2 - y1, x2 - x1);
          const headLength = 5;
          const headWidth = Math.PI / 7; // Narrower arrow point
          ctx.beginPath();
          ctx.moveTo(x2, y2);
          ctx.lineTo(
            x2 - headLength * Math.cos(angle - headWidth),
            y2 - headLength * Math.sin(angle - headWidth)
          );
          ctx.lineTo(
            x2 - headLength * Math.cos(angle + headWidth),
            y2 - headLength * Math.sin(angle + headWidth)
          );
          ctx.closePath();
          ctx.fill();
        }
      });

      // Draw color legend
      const legendX = canvas.width - padding - 80;
      const legendY = padding + 20;
      const legendWidth = 20;
      const legendHeight = 150;

      ctx.font = '11px Arial';
      ctx.fillStyle = '#000000';
      ctx.textAlign = 'left';
      ctx.fillText('Campo |g|', legendX - 60, legendY - 8);

      // Draw gradient legend
      for (let i = 0; i <= legendHeight; i++) {
        const magnitude = maxMagnitude * (1 - i / legendHeight);
        const color = getColorFromMagnitude(magnitude, maxMagnitude);
        ctx.strokeStyle = color;
        ctx.lineWidth = 1;
        ctx.beginPath();
        ctx.moveTo(legendX, legendY + i);
        ctx.lineTo(legendX + legendWidth, legendY + i);
        ctx.stroke();
      }

      // Legend border
      ctx.strokeStyle = '#000000';
      ctx.lineWidth = 1;
      ctx.strokeRect(legendX, legendY, legendWidth, legendHeight);

      // Legend labels
      ctx.fillStyle = '#000000';
      ctx.font = '10px Arial';
      ctx.textAlign = 'left';
      ctx.fillText(maxMagnitude.toExponential(1), legendX + legendWidth + 5, legendY + 5);
      ctx.fillText(minMagnitude.toExponential(1), legendX + legendWidth + 5, legendY + legendHeight);
    }

    // Draw masses
    masses.forEach((mass) => {
      const x = toCanvasX(mass.x);
      const y = toCanvasY(mass.y);
      const radius = 12;

      ctx.beginPath();
      ctx.arc(x, y, radius, 0, 2 * Math.PI);
      ctx.fillStyle = '#8B4513';
      ctx.fill();
      ctx.strokeStyle = '#654321';
      ctx.lineWidth = 2;
      ctx.stroke();

      // Draw mass label
      ctx.fillStyle = '#FFFFFF';
      ctx.font = 'bold 12px Arial';
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';
      ctx.fillText('M', x, y);
    });

  }, [masses, fieldVectors, xMin, xMax, yMin, yMax, gridResolution]);

  // Draw equipotential lines
  useEffect(() => {
    const canvas = equipotentialCanvasRef.current;
    if (!canvas || masses.length === 0) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    // Calculate gravitational potential at a point (local function)
    const calcPotential = (x: number, y: number): number => {
      let U = 0;
      masses.forEach(mass => {
        const dx = x - mass.x;
        const dy = y - mass.y;
        const r = Math.sqrt(dx * dx + dy * dy);
        if (r > 0.01) {
          // Gravitational potential is negative: U = -G * M / r
          U -= (G * mass.mass) / r;
        }
      });
      return U;
    };

    // Clear canvas
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    // Calculate scaling factors
    const padding = 40;
    const plotWidth = canvas.width - 2 * padding;
    const plotHeight = canvas.height - 2 * padding;
    const scaleX = plotWidth / (xMax - xMin);
    const scaleY = plotHeight / (yMax - yMin);

    // Helper function to convert world coordinates to canvas coordinates
    const toCanvasX = (x: number) => padding + (x - xMin) * scaleX;
    const toCanvasY = (y: number) => canvas.height - padding - (y - yMin) * scaleY;

    // Draw grid
    ctx.strokeStyle = '#e0e0e0';
    ctx.lineWidth = 1;
    for (let i = 0; i <= 10; i++) {
      const x = xMin + (xMax - xMin) * i / 10;
      const canvasX = toCanvasX(x);
      ctx.beginPath();
      ctx.moveTo(canvasX, padding);
      ctx.lineTo(canvasX, canvas.height - padding);
      ctx.stroke();

      const y = yMin + (yMax - yMin) * i / 10;
      const canvasY = toCanvasY(y);
      ctx.beginPath();
      ctx.moveTo(padding, canvasY);
      ctx.lineTo(canvas.width - padding, canvasY);
      ctx.stroke();
    }

    // Draw axes
    ctx.strokeStyle = '#000000';
    ctx.lineWidth = 2;
    
    // X-axis
    const zeroY = toCanvasY(0);
    if (zeroY >= padding && zeroY <= canvas.height - padding) {
      ctx.beginPath();
      ctx.moveTo(padding, zeroY);
      ctx.lineTo(canvas.width - padding, zeroY);
      ctx.stroke();
    }

    // Y-axis
    const zeroX = toCanvasX(0);
    if (zeroX >= padding && zeroX <= canvas.width - padding) {
      ctx.beginPath();
      ctx.moveTo(zeroX, padding);
      ctx.lineTo(zeroX, canvas.height - padding);
      ctx.stroke();
    }

    // Draw axis labels
    ctx.fillStyle = '#000000';
    ctx.font = '12px Arial';
    ctx.textAlign = 'center';
    ctx.fillText('X Position (m)', canvas.width / 2, canvas.height - 10);
    ctx.save();
    ctx.translate(15, canvas.height / 2);
    ctx.rotate(-Math.PI / 2);
    ctx.fillText('Y Position (m)', 0, 0);
    ctx.restore();

    // Calculate potential on a fine grid for contour lines
    const resolution = 100;
    const potentials: number[][] = [];
    let minPotential = Infinity;
    let maxPotential = -Infinity;

    for (let i = 0; i < resolution; i++) {
      potentials[i] = [];
      for (let j = 0; j < resolution; j++) {
        const x = xMin + (xMax - xMin) * i / (resolution - 1);
        const y = yMin + (yMax - yMin) * j / (resolution - 1);
        const U = calcPotential(x, y);
        potentials[i][j] = U;
        if (Math.abs(U) < 1e10) { // Ignore values too close to masses
          minPotential = Math.min(minPotential, U);
          maxPotential = Math.max(maxPotential, U);
        }
      }
    }

    // Define equipotential levels
    const numLevels = 60;
    const levels: number[] = [];
    
    // Use logarithmic scale for better distribution
    for (let i = 1; i <= numLevels; i++) {
      const t = i / numLevels;
      const level = minPotential + (maxPotential - minPotential) * t;
      levels.push(level);
    }

    // Draw equipotential lines using marching squares
    const drawContourLine = (level: number, color: string) => {
      ctx.strokeStyle = color;
      ctx.lineWidth = 1.5;

      for (let i = 0; i < resolution - 1; i++) {
        for (let j = 0; j < resolution - 1; j++) {
          const x1 = xMin + (xMax - xMin) * i / (resolution - 1);
          const y1 = yMin + (yMax - yMin) * j / (resolution - 1);
          const x2 = xMin + (xMax - xMin) * (i + 1) / (resolution - 1);
          const y2 = yMin + (yMax - yMin) * (j + 1) / (resolution - 1);

          const v00 = potentials[i][j];
          const v10 = potentials[i + 1][j];
          const v01 = potentials[i][j + 1];
          const v11 = potentials[i + 1][j + 1];

          // Check if contour passes through this cell
          const corners = [v00, v10, v11, v01];
          const above = corners.filter(v => v >= level).length;
          const below = corners.filter(v => v < level).length;

          if (above > 0 && below > 0) {
            // Linear interpolation to find crossing points
            const points: [number, number][] = [];

            // Bottom edge
            if ((v00 < level && v10 >= level) || (v00 >= level && v10 < level)) {
              const t = (level - v00) / (v10 - v00);
              points.push([x1 + t * (x2 - x1), y1]);
            }
            // Right edge
            if ((v10 < level && v11 >= level) || (v10 >= level && v11 < level)) {
              const t = (level - v10) / (v11 - v10);
              points.push([x2, y1 + t * (y2 - y1)]);
            }
            // Top edge
            if ((v11 < level && v01 >= level) || (v11 >= level && v01 < level)) {
              const t = (level - v11) / (v01 - v11);
              points.push([x2 + t * (x1 - x2), y2]);
            }
            // Left edge
            if ((v01 < level && v00 >= level) || (v01 >= level && v00 < level)) {
              const t = (level - v01) / (v00 - v01);
              points.push([x1, y2 + t * (y1 - y2)]);
            }

            // Draw line between crossing points
            if (points.length >= 2) {
              ctx.beginPath();
              ctx.moveTo(toCanvasX(points[0][0]), toCanvasY(points[0][1]));
              ctx.lineTo(toCanvasX(points[1][0]), toCanvasY(points[1][1]));
              ctx.stroke();
            }
          }
        }
      }
    };

    // Draw all equipotential lines
    levels.forEach((level, index) => {
      const hue = (index / numLevels) * 280; // Blue to purple spectrum
      const color = `hsl(${hue}, 70%, 50%)`;
      drawContourLine(level, color);
    });

    // Draw masses on top
    masses.forEach((mass) => {
      const x = toCanvasX(mass.x);
      const y = toCanvasY(mass.y);
      const radius = 12;

      ctx.beginPath();
      ctx.arc(x, y, radius, 0, 2 * Math.PI);
      ctx.fillStyle = '#8B4513';
      ctx.fill();
      ctx.strokeStyle = '#654321';
      ctx.lineWidth = 2;
      ctx.stroke();

      // Draw mass label
      ctx.fillStyle = '#FFFFFF';
      ctx.font = 'bold 12px Arial';
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';
      ctx.fillText('M', x, y);
    });

    // Draw legend
    ctx.fillStyle = '#000000';
    ctx.font = '11px Arial';
    ctx.textAlign = 'left';
    ctx.fillText('Líneas Equipotenciales', padding + 10, padding + 20);

  }, [masses, xMin, xMax, yMin, yMax]);

  // Export to Excel
  const handleExport = () => {
    if (fieldVectors.length === 0) {
      alert("No data to export. Please calculate field vectors first.");
      return;
    }
    
    const now = new Date();
    const timestamp = now.toISOString().replace(/[:.]/g, '-').slice(0, -5);
    
    exportToExcel({
      data: fieldVectors as unknown as Record<string, string | number | boolean | null>[],
      fileName: `gravitational_field_vectors_${timestamp}`,
      sheetName: "Gravitational Field Vectors",
    });
  };

  return (
    <Layout>
      <div style={{ padding: "2rem", maxWidth: "1400px", margin: "0 auto" }}>
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Globe className="w-6 h-6" />
              Campo Gravitatorio - Visualización con Masas
            </CardTitle>
            <CardDescription>
              Añade masas puntuales y visualiza el campo gravitatorio resultante en el plano
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Alert className="mb-6">
              <Globe className="h-4 w-4" />
              <AlertTitle>Información</AlertTitle>
              <AlertDescription>
                Las masas se muestran en <span style={{ color: "#8B4513", fontWeight: "bold" }}>marrón</span>. 
                Los vectores de campo gravitatorio se muestran con un gradiente de colores según su intensidad 
                (azul = débil, rojo = fuerte) y apuntan hacia las masas.
              </AlertDescription>
            </Alert>

            {/* Add Mass Section */}
            <div className="grid gap-4 mb-6">
              <h3 className="text-lg font-semibold">Añadir Masa</h3>
              <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                <div>
                  <Label htmlFor="mass">Masa (kg)</Label>
                  <Input
                    id="mass"
                    type="number"
                    step="1e9"
                    value={newMass}
                    onChange={(e) => setNewMass(parseFloat(e.target.value))}
                    placeholder="1e10"
                  />
                </div>
                <div>
                  <Label htmlFor="x">Posición X (m)</Label>
                  <Input
                    id="x"
                    type="number"
                    step="0.1"
                    value={newX}
                    onChange={(e) => setNewX(parseFloat(e.target.value))}
                    placeholder="0"
                  />
                </div>
                <div>
                  <Label htmlFor="y">Posición Y (m)</Label>
                  <Input
                    id="y"
                    type="number"
                    step="0.1"
                    value={newY}
                    onChange={(e) => setNewY(parseFloat(e.target.value))}
                    placeholder="0"
                  />
                </div>
                <div className="flex items-end">
                  <Button onClick={addMass} className="w-full">
                    <Plus className="w-4 h-4 mr-2" />
                    Añadir
                  </Button>
                </div>
              </div>
            </div>

            {/* Current Masses List */}
            {masses.length > 0 && (
              <div className="mb-6">
                <h3 className="text-lg font-semibold mb-3">Masas Actuales</h3>
                <div className="grid gap-2">
                  {masses.map((mass) => (
                    <div
                      key={mass.id}
                      className="flex items-center justify-between p-3 border rounded-lg"
                      style={{
                        borderColor: "#8B451340",
                        backgroundColor: "#8B451310",
                      }}
                    >
                      <div className="flex gap-4">
                        <span>
                          <strong>Masa:</strong> {mass.mass.toExponential(2)} kg
                        </span>
                        <span>
                          <strong>Posición:</strong> ({mass.x.toFixed(2)}, {mass.y.toFixed(2)}) m
                        </span>
                      </div>
                      <Button
                        variant="destructive"
                        size="sm"
                        onClick={() => removeMass(mass.id)}
                      >
                        <Trash2 className="w-4 h-4" />
                      </Button>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Grid Configuration */}
            <div className="grid gap-4 mb-6">
              <h3 className="text-lg font-semibold">Configuración de la Malla</h3>
              <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                <div>
                  <Label htmlFor="resolution">Resolución</Label>
                  <Input
                    id="resolution"
                    type="number"
                    min="5"
                    max="50"
                    value={gridResolution}
                    onChange={(e) => setGridResolution(parseInt(e.target.value))}
                  />
                </div>
                <div>
                  <Label htmlFor="xmin">X Mínimo (m)</Label>
                  <Input
                    id="xmin"
                    type="number"
                    step="0.5"
                    value={xMin}
                    onChange={(e) => setXMin(parseFloat(e.target.value))}
                  />
                </div>
                <div>
                  <Label htmlFor="xmax">X Máximo (m)</Label>
                  <Input
                    id="xmax"
                    type="number"
                    step="0.5"
                    value={xMax}
                    onChange={(e) => setXMax(parseFloat(e.target.value))}
                  />
                </div>
                <div>
                  <Label htmlFor="ymin">Y Mínimo (m)</Label>
                  <Input
                    id="ymin"
                    type="number"
                    step="0.5"
                    value={yMin}
                    onChange={(e) => setYMin(parseFloat(e.target.value))}
                  />
                </div>
                <div>
                  <Label htmlFor="ymax">Y Máximo (m)</Label>
                  <Input
                    id="ymax"
                    type="number"
                    step="0.5"
                    value={yMax}
                    onChange={(e) => setYMax(parseFloat(e.target.value))}
                  />
                </div>
              </div>
            </div>

            {/* Calculate Button */}
            <div className="mb-6">
              <Button onClick={calculateFieldVectors} className="w-full" size="lg">
                <Globe className="w-4 h-4 mr-2" />
                Calcular Campo Gravitatorio
              </Button>
            </div>

            {/* Canvas Visualizations */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
              <div>
                <h3 className="text-lg font-semibold mb-3">Campo Gravitatorio (Vectores)</h3>
                <canvas
                  ref={canvasRef}
                  width={800}
                  height={600}
                  style={{
                    width: "100%",
                    maxWidth: "800px",
                    height: "auto",
                    border: "1px solid #ccc",
                    borderRadius: "8px",
                    backgroundColor: "#ffffff",
                  }}
                />
              </div>
              <div>
                <h3 className="text-lg font-semibold mb-3">Potencial Gravitatorio (Líneas Equipotenciales)</h3>
                <canvas
                  ref={equipotentialCanvasRef}
                  width={800}
                  height={600}
                  style={{
                    width: "100%",
                    maxWidth: "800px",
                    height: "auto",
                    border: "1px solid #ccc",
                    borderRadius: "8px",
                    backgroundColor: "#ffffff",
                  }}
                />
              </div>
            </div>

            {/* AG Grid Data Table */}
            {showCalculation && fieldVectors.length > 0 && (
              <div>
                <div className="flex justify-between items-center mb-3">
                  <h3 className="text-lg font-semibold">
                    Valores de Campo Gravitatorio (Componentes X, Y)
                  </h3>
                  <Button onClick={handleExport} variant="outline">
                    <FileSpreadsheet className="w-4 h-4 mr-2" />
                    Exportar a Excel
                  </Button>
                </div>
                <div
                  className="ag-theme-quartz"
                  style={{ height: "400px", width: "100%" }}
                >
                  <AgGridReact
                    rowData={fieldVectors}
                    columnDefs={colDefs}
                    theme={myTheme}
                    domLayout="normal"
                  />
                </div>
              </div>
            )}
          </CardContent>
          <CardFooter className="flex-col items-start gap-2">
            <p className="text-sm text-muted-foreground">
              <strong>Nota:</strong> La constante gravitatoria utilizada es G = 6.674 × 10⁻¹¹ N⋅m²/kg²
            </p>
            <p className="text-sm text-muted-foreground">
              El campo gravitatorio se calcula como: <strong>g = G × M / r²</strong> en dirección hacia la masa
            </p>
            <p className="text-sm text-muted-foreground">
              El potencial gravitatorio es: <strong>U = -G × M / r</strong> (siempre negativo)
            </p>
          </CardFooter>
        </Card>
      </div>
    </Layout>
  );
};

export default Grav;
