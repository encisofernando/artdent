// src/scenes/calendar/calendar.jsx
import React, { useState } from "react";
import FullCalendar from "@fullcalendar/react";
import dayGridPlugin from "@fullcalendar/daygrid";
import timeGridPlugin from "@fullcalendar/timegrid";
import interactionPlugin from "@fullcalendar/interaction";
import listPlugin from "@fullcalendar/list";
import esLocale from "@fullcalendar/core/locales/es";

// ✅ FullCalendar v6 usa index.css (no main.css)
import "@fullcalendar/daygrid/index.css";
import "@fullcalendar/timegrid/index.css";
import "@fullcalendar/list/index.css";

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

export default function Calendar() {
  const theme = useTheme();
  const colors = tokens(theme.palette.mode);
  const [currentEvents, setCurrentEvents] = useState([]);

  const handleDateClick = (selected) => {
    const title = prompt("Por favor, ingresa un nuevo título para tu evento");
    const calendarApi = selected.view.calendar;
    calendarApi.unselect();
    if (title) {
      calendarApi.addEvent({
        id: `${selected.dateStr}-${title}`,
        title,
        start: selected.startStr,
        end: selected.endStr,
        allDay: selected.allDay,
      });
    }
  };

  const handleEventClick = (selected) => {
    if (window.confirm(`¿Eliminar '${selected.event.title}'?`)) {
      selected.event.remove();
    }
  };

  return (
    <Box m="20px">
      <Header title="Calendario" subtitle="Página Interactiva de Calendario Completo" />
      <Box display="flex" justifyContent="space-between">
        <Box flex="1 1 20%" backgroundColor={colors.primary[400]} p="15px" borderRadius="4px">
          <Typography variant="h5">Eventos</Typography>
          <List>
            {currentEvents.map((event) => (
              <ListItem key={event.id} sx={{ backgroundColor: colors.greenAccent[500], m: "10px 0", borderRadius: "2px" }}>
                <ListItemText
                  primary={event.title}
                  secondary={<Typography>{event.start?.toLocaleDateString("es-AR")}</Typography>}
                />
              </ListItem>
            ))}
          </List>
        </Box>

        <Box flex="1 1 100%" ml="15px">
          <FullCalendar
            locale={esLocale}
            height="75vh"
            plugins={[dayGridPlugin, timeGridPlugin, interactionPlugin, listPlugin]}
            headerToolbar={{ left: "prev,next today", center: "title", right: "dayGridMonth,timeGridWeek,timeGridDay,listMonth" }}
            initialView="dayGridMonth"
            editable
            selectable
            selectMirror
            dayMaxEvents
            select={handleDateClick}
            eventClick={handleEventClick}
            eventsSet={(events) => setCurrentEvents(events)}
            initialEvents={[{ id: "1", title: "Evento inicial", date: new Date().toISOString().slice(0, 10) }]}
          />
        </Box>
      </Box>
    </Box>
  );
}
