import { Box, useTheme } from "@mui/material";
import Header from "../../components/Header";
import Accordion from "@mui/material/Accordion";
import AccordionSummary from "@mui/material/AccordionSummary";
import AccordionDetails from "@mui/material/AccordionDetails";
import Typography from "@mui/material/Typography";
import ExpandMoreIcon from "@mui/icons-material/ExpandMore";
import { tokens } from "../../theme";

const FAQ = () => {
  const theme = useTheme();
  const colors = tokens(theme.palette.mode);

  // Arreglo de preguntas y respuestas
  const faqData = [
    {
      question: "Una Pregunta Importante",
      answer:
        "Lorem ipsum dolor sit amet, consectetur adipiscing elit. Suspendisse malesuada lacus ex, sit amet blandit leo lobortis eget.",
    },
    {
      question: "Otra Pregunta Importante",
      answer:
        "Lorem ipsum dolor sit amet, consectetur adipiscing elit. Suspendisse malesuada lacus ex, sit amet blandit leo lobortis eget.",
    },
    {
      question: "Tu Pregunta Favorita",
      answer:
        "Lorem ipsum dolor sit amet, consectetur adipiscing elit. Suspendisse malesuada lacus ex, sit amet blandit leo lobortis eget.",
    },
    {
      question: "Alguna Pregunta Aleatoria",
      answer:
        "Lorem ipsum dolor sit amet, consectetur adipiscing elit. Suspendisse malesuada lacus ex, sit amet blandit leo lobortis eget.",
    },
    {
      question: "La Pregunta Final",
      answer:
        "Lorem ipsum dolor sit amet, consectetur adipiscing elit. Suspendisse malesuada lacus ex, sit amet blandit leo lobortis eget.",
    },
  ];

  return (
    <Box m="20px">
      <Header title="FAQ" subtitle="Página de Preguntas Frecuentes" />

      {faqData.map((item, index) => (
        <Accordion key={index} defaultExpanded>
          <AccordionSummary expandIcon={<ExpandMoreIcon />}>
            <Typography color={colors.greenAccent[500]} variant="h5">
              {item.question}
            </Typography>
          </AccordionSummary>
          <AccordionDetails>
            <Typography>{item.answer}</Typography>
          </AccordionDetails>
        </Accordion>
      ))}
    </Box>
  );
};

export default FAQ;
