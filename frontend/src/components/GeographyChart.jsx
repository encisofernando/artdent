import React from "react";
import { Box, useTheme } from "@mui/material";
import { ResponsiveChoropleth } from "@nivo/geo";

/**
 * Uso:
 *  import world from "../data/world-geojson.json";
 *  <GeographyChart features={world.features} data={[{id:'ARG', value:12}]} />
 */
const GeographyChart = ({ features = [], data = [], height = 350 }) => {
  const theme = useTheme();
  const hasFeatures = Array.isArray(features) && features.length > 0;

  return (
    <Box sx={{ height, minHeight: height }}>
      {hasFeatures ? (
        <ResponsiveChoropleth
          data={data}
          features={features}
          /** === props requeridos por @nivo/geo (con defaults) === */
          colors="nivo"
          projectionType="geoMercator"
          projectionScale={100}
          projectionTranslation={[0.5, 0.62]}
          projectionRotation={[0, 0, 0]}
          fillColor="#dddddd"
          enableGraticule={false}
          graticuleLineColor="#999999"
          graticuleLineWidth={0.5}
          isInteractive={true}
          role="img"
          value="value"
          match={(d) => d.id}
          domain={[0, Math.max(1, ...data.map((d) => d?.value ?? 0))]}
          unknownColor="#eee"
          label="properties.name"
          /** eventos no-op para cumplir propTypes estrictos */
          onMouseEnter={() => {}}
          onMouseMove={() => {}}
          onMouseLeave={() => {}}
          onClick={() => {}}
          layers={["graticule", "base", "legends", "features", "annotations", "boundaries"]}
          margin={{ top: 0, right: 0, bottom: 0, left: 0 }}
          valueFormat=".2s"
          borderWidth={0.5}
          borderColor="#777"
          tooltip={({ feature }) => {
            const name = feature?.properties?.name || feature?.id;
            const value = feature?.data?.value ?? "—";
            return (
              <div style={{ padding: "6px 8px", background: "#111", color: "#fff", borderRadius: 6, fontSize: 12 }}>
                <strong>{name}</strong>
                <div>Valor: {value}</div>
              </div>
            );
          }}
          legends={[
            {
              anchor: "bottom-left",
              direction: "column",
              translateX: 20,
              translateY: -20,
              itemsSpacing: 0,
              itemWidth: 80,
              itemHeight: 18,
              itemDirection: "left-to-right",
              itemTextColor: theme.palette.text.secondary,
              symbolSize: 12,
              effects: [{ on: "hover", style: { itemTextColor: theme.palette.text.primary } }],
            },
          ]}
        />
      ) : (
        <Box
          sx={{
            height: "100%",
            display: "grid",
            placeItems: "center",
            color: theme.palette.text.secondary,
            borderRadius: 2,
            background: theme.palette.mode === "dark" ? "#0f172a" : "#f5f7fb",
          }}
        >
          <span style={{ fontSize: 13 }}>Mapa no disponible (sin GeoJSON).</span>
        </Box>
      )}
    </Box>
  );
};

export default GeographyChart;
