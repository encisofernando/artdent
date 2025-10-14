import React, { useMemo, useState } from "react";
import {
  Calendar as BigCalendar,
  dateFnsLocalizer,
} from "react-big-calendar";
import withDragAndDrop from "react-big-calendar/lib/addons/dragAndDrop";
import { format, parse, startOfWeek, getDay } from "date-fns";
import esAR from "date-fns/locale/es";

// estilos base + estilos de DnD
import "react-big-calendar/lib/css/react-big-calendar.css";
import "react-big-calendar/lib/addons/dragAndDrop/styles.css";

import {
  Box,
  List,
  ListItem,
  ListItemText,
  Typography,
  useTheme,
} from "@mui/material";
import Header from "../../components/Header";
import { tokens } from "../../theme";

// --- Localizador en español con date-fns ---
const locales = { es: esAR, "es-AR": esAR };
const localizer = dateFnsLocalizer({
  format,
  parse,
  startOfWeek: (date) => startOfWeek(date, { locale: esAR }),
  getDay,
  locales,
});

// HOC de DnD
const DnDCalendar = withDragAndDrop(BigCalendar);

export default function Calendar() {
  const theme = useTheme();
  const colors = tokens(theme.palette.mode);

  const [events, setEvents] = useState([
    {
      id: "1",
      title: "Evento inicial",
      start: new Date(),
      end: new Date(new Date().setHours(new Date().getHours() + 1)),
      allDay: false,
    },
  ]);

  // Crear evento al seleccionar rango
  const handleSelectSlot = ({ start, end }) => {
    const title = window.prompt("Título del evento:");
    if (title) {
      setEvents((prev) => [
        ...prev,
        { id: String(Date.now()), title, start, end, allDay: false },
      ]);
    }
  };

  // Eliminar evento al hacer click
  const handleSelectEvent = (event) => {
    if (window.confirm(`¿Eliminar '${event.title}'?`)) {
      setEvents((prev) => prev.filter((e) => e.id !== event.id));
    }
  };

  // Arrastrar y soltar (mover)
  const handleEventDrop = ({ event, start, end, isAllDay }) => {
    setEvents((prev) =>
      prev.map((e) =>
        e.id === event.id ? { ...e, start, end, allDay: !!isAllDay } : e
      )
    );
  };

  // Redimensionar (cambiar duración)
  const handleEventResize = ({ event, start, end }) => {
    setEvents((prev) =>
      prev.map((e) => (e.id === event.id ? { ...e, start, end } : e))
    );
  };

  // Formatos en español
  const formats = useMemo(
    () => ({
      dayFormat: (date) => format(date, "EEE d", { locale: esAR }),
      dayHeaderFormat: (date) =>
        format(date, "EEEE d 'de' MMMM", { locale: esAR }),
      dayRangeHeaderFormat: ({ start, end }) =>
        `${format(start, "d/MM", { locale: esAR })} – ${format(end, "d/MM", {
          locale: esAR,
        })}`,
      weekdayFormat: (date) => format(date, "EEE", { locale: esAR }),
      monthHeaderFormat: (date) => format(date, "MMMM yyyy", { locale: esAR }),
      timeGutterFormat: (date) => format(date, "HH:mm", { locale: esAR }),
      agendaHeaderFormat: ({ start, end }) =>
        `${format(start, "d/MM/yyyy", { locale: esAR })} – ${format(
          end,
          "d/MM/yyyy",
          { locale: esAR }
        )}`,
    }),
    []
  );

  return (
    <Box m="20px">
      <Header title="Calendario" subtitle="Página Interactiva de Calendario (DnD)" />

      <Box display="flex" justifyContent="space-between">
        {/* Lateral de eventos */}
        <Box
          flex="1 1 20%"
          backgroundColor={colors.primary[400]}
          p="15px"
          borderRadius="4px"
          minWidth={260}
        >
          <Typography variant="h5">Eventos</Typography>
          <List>
            {events.map((ev) => (
              <ListItem
                key={ev.id}
                sx={{
                  backgroundColor: colors.greenAccent[500],
                  margin: "10px 0",
                  borderRadius: "6px",
                }}
              >
                <ListItemText
                  primary={ev.title}
                  secondary={
                    <Typography>
                      {format(ev.start, "dd/MM/yyyy HH:mm", { locale: esAR })}
                      {" — "}
                      {format(ev.end, "HH:mm", { locale: esAR })}
                    </Typography>
                  }
                />
              </ListItem>
            ))}
          </List>
        </Box>

        {/* Calendario con Drag & Drop + Resize */}
        <Box flex="1 1 100%" ml="15px">
          <DnDCalendar
            localizer={localizer}
            events={events}
            startAccessor="start"
            endAccessor="end"
            selectable
            resizable
            popup
            onSelectSlot={handleSelectSlot}
            onSelectEvent={handleSelectEvent}
            onEventDrop={handleEventDrop}
            onEventResize={handleEventResize}
            // habilita arrastre para todos los eventos
            draggableAccessor={() => true}
            style={{ height: "75vh", background: "transparent", borderRadius: 8 }}
            views={["month", "week", "day", "agenda"]}
            defaultView="month"
            messages={{
              today: "Hoy",
              previous: "Anterior",
              next: "Siguiente",
              month: "Mes",
              week: "Semana",
              day: "Día",
              agenda: "Agenda",
              date: "Fecha",
              time: "Hora",
              event: "Evento",
              noEventsInRange: "No hay eventos en este rango.",
              showMore: (total) => `+${total} más`,
            }}
            formats={formats}
          />
        </Box>
      </Box>
    </Box>
  );
}
