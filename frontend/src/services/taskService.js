// 📁 src/services/taskService.js
import api from "./api";
import { unwrap } from "./utils";

export const listTasks = async () => {
  try { return unwrap(await api.get("/tasks")); } 
  catch (e) {
    // fallback si el recurso se llama /tareas
    return unwrap(await api.get("/tareas"));
  }
};
