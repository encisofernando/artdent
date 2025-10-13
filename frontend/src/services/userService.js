// 📁 src/services/userService.js
import api from "./api";
import { unwrap } from "./utils";

export const getUser = async (id) => unwrap(await api.get(`/users/${id}`));
