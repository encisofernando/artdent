# Componente de Contacto - ARTDENT

## 📋 Descripción

Componente completo de contacto que incluye:
- ✅ Formulario de contacto con validación
- ✅ Información de la empresa (teléfono, email, dirección, horarios)
- ✅ Mapa de Google Maps embebido
- ✅ Estados de envío (loading, success, error)
- ✅ Diseño responsive
- ✅ Accesibilidad completa

---

## 🎨 Características

### Formulario de contacto
- **Campos**: Nombre, Email, Teléfono, Asunto, Mensaje
- **Validaciones**: Campos obligatorios, formato de email, longitud mínima
- **Estados visuales**: Loading spinner, mensajes de éxito/error
- **UX mejorada**: Los errores se limpian al editar los campos

### Información de contacto
- **Teléfono**: Link directo para llamar
- **WhatsApp**: Link que abre WhatsApp Web/App
- **Email**: Link mailto
- **Dirección**: Con ícono de ubicación
- **Horarios**: Horario de atención

### Mapa interactivo
- **Google Maps embebido**: Ubicación visual de la empresa
- **Efecto hover**: Pasa de escala de grises a color
- **Link externo**: Botón para abrir en Google Maps

---

## 🔧 Instalación y configuración

### 1. Agregar al proyecto

```bash
# Copiar el archivo a tu proyecto
cp Contacto.tsx src/pages/
```

### 2. Agregar la ruta en React Router

```typescript
// En tu archivo de rutas (App.tsx o routes.tsx)
import Contacto from './pages/Contacto'

// Agregar la ruta
<Route path="/contacto" element={<Contacto />} />
```

### 3. Personalizar la información de contacto

En el componente `Contacto.tsx`, busca el objeto `contactInfo`:

```typescript
const contactInfo = {
  phone: '+54 11 XXXX-XXXX',           // ⚠️ Reemplazar con tu teléfono
  email: 'info@artdent.com.ar',        // ⚠️ Reemplazar con tu email
  address: 'Av. Ejemplo 1234, CABA, Buenos Aires, Argentina', // ⚠️ Tu dirección
  hours: 'Lunes a Viernes: 9:00 - 18:00 hs', // ⚠️ Tus horarios
  whatsapp: '+54 9 11 XXXX-XXXX',      // ⚠️ Tu WhatsApp (con código de país)
}
```

### 4. Configurar el mapa de Google Maps

#### Opción A: Usando el generador de Google Maps

1. Ve a [Google Maps](https://www.google.com/maps)
2. Busca tu dirección
3. Click en "Compartir" → "Incorporar un mapa"
4. Copia el URL del iframe
5. Reemplaza `mapLocation.embedUrl` con tu URL

#### Opción B: Usando coordenadas

1. Obtén las coordenadas de tu ubicación (lat, lng)
2. Actualiza el objeto `mapLocation`:

```typescript
const mapLocation = {
  lat: -34.6037,  // ⚠️ Tu latitud
  lng: -58.3816,  // ⚠️ Tu longitud
  embedUrl: 'TU_URL_DE_GOOGLE_MAPS_EMBED', // ⚠️ URL del iframe
}
```

**Cómo obtener la URL del embed:**
```
https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d13135.924489655104!2d[TU_LONGITUD]!3d[TU_LATITUD]!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x0%3A0x0!2z[CODIFICADO]!5e0!3m2!1ses!2sar!4v1234567890123!5m2!1ses!2sar
```

---

## 🔌 Integración con el backend

### Configurar el endpoint de envío

En el método `handleSubmit`, descomenta y configura la llamada al backend:

```typescript
const handleSubmit = async (e: React.FormEvent) => {
  e.preventDefault()

  if (!validateForm()) {
    return
  }

  setStatus('loading')

  try {
    // Implementar llamada real al backend
    const response = await fetch('/api/contact', {
      method: 'POST',
      headers: { 
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}` // Si requiere auth
      },
      body: JSON.stringify(formData),
    })

    if (!response.ok) {
      throw new Error('Error al enviar')
    }

    setStatus('success')
    setFormData({
      name: '',
      email: '',
      phone: '',
      subject: '',
      message: '',
    })

    setTimeout(() => setStatus('idle'), 5000)
  } catch (error) {
    console.error('Error:', error)
    setStatus('error')
    setTimeout(() => setStatus('idle'), 5000)
  }
}
```

### Ejemplo de endpoint Laravel

```php
// routes/api.php
Route::post('/contact', [ContactController::class, 'store']);

// app/Http/Controllers/ContactController.php
public function store(Request $request)
{
    $validated = $request->validate([
        'name' => 'required|string|max:255',
        'email' => 'required|email',
        'phone' => 'required|string',
        'subject' => 'required|string',
        'message' => 'required|string|min:10',
    ]);

    // Guardar en BD
    ContactMessage::create($validated);

    // Enviar email de notificación
    Mail::to('info@artdent.com.ar')->send(
        new ContactFormSubmitted($validated)
    );

    return response()->json([
        'message' => 'Mensaje enviado correctamente'
    ], 200);
}
```

---

## 🎯 Personalización

### Agregar más campos al formulario

```typescript
// 1. Agregar al tipo FormData
type FormData = {
  name: string
  email: string
  phone: string
  subject: string
  message: string
  company: string  // ⬅️ Nuevo campo
}

// 2. Agregar al estado inicial
const [formData, setFormData] = useState<FormData>({
  // ... campos existentes
  company: '',
})

// 3. Agregar la validación
const validateForm = (): boolean => {
  // ... validaciones existentes
  if (!formData.company.trim()) {
    newErrors.company = 'La empresa es obligatoria'
  }
}

// 4. Agregar el input en el formulario
<div>
  <label htmlFor="company" className="block text-sm font-medium text-gray-700">
    Empresa <span className="text-red-500">*</span>
  </label>
  <input
    type="text"
    id="company"
    name="company"
    value={formData.company}
    onChange={handleChange}
    className="input mt-1"
    placeholder="Nombre de tu empresa"
  />
</div>
```

### Cambiar los asuntos del select

```typescript
<select id="subject" name="subject" /* ... */>
  <option value="">Seleccionar asunto</option>
  <option value="consulta-producto">Consulta sobre producto</option>
  <option value="cotizacion">Solicitud de cotización</option>
  {/* Agregar más opciones aquí */}
  <option value="capacitacion">Capacitación</option>
  <option value="distribuidor">Ser distribuidor</option>
</select>
```

### Personalizar colores

El componente usa las variables CSS de ARTDENT:
- `var(--brand-primary)` para el color principal
- Clases de Tailwind para el resto

Para cambiar colores específicos, busca y reemplaza:
- `bg-[var(--brand-primary)]` → Tu color personalizado
- `text-[var(--brand-primary)]` → Tu color personalizado

---

## 📱 Responsive Design

El componente es completamente responsive:

- **Mobile**: Formulario e info en columna única
- **Tablet**: Grid 1 columna, mejor distribución
- **Desktop**: Grid 2 columnas (formulario + info)

### Breakpoints utilizados:
- `sm:` - 640px
- `md:` - 768px
- `lg:` - 1024px

---

## ♿ Accesibilidad

- ✅ Labels asociados a inputs con `htmlFor`
- ✅ Mensajes de error descriptivos
- ✅ Estados visuales claros (loading, success, error)
- ✅ Contraste de colores WCAG AA
- ✅ Foco visible en elementos interactivos
- ✅ Campos requeridos marcados con asterisco

---

## 🧪 Testing

### Checklist de pruebas:

**Formulario:**
- [ ] Validación de campos vacíos funciona
- [ ] Validación de email funciona
- [ ] Validación de mensaje (min 10 caracteres) funciona
- [ ] Loading spinner aparece al enviar
- [ ] Mensaje de éxito se muestra correctamente
- [ ] Mensaje de error se muestra en caso de fallo
- [ ] Formulario se resetea después del envío exitoso
- [ ] Los errores desaparecen al editar campos

**Información de contacto:**
- [ ] Link de teléfono abre marcador
- [ ] Link de WhatsApp funciona correctamente
- [ ] Link de email abre cliente de correo
- [ ] Todos los datos son correctos

**Mapa:**
- [ ] El mapa carga correctamente
- [ ] La ubicación mostrada es correcta
- [ ] El efecto hover funciona (grayscale → color)
- [ ] El link "Ver en Google Maps" abre Google Maps

**Responsive:**
- [ ] Se ve bien en móvil (< 640px)
- [ ] Se ve bien en tablet (640px - 1024px)
- [ ] Se ve bien en desktop (> 1024px)
- [ ] No hay scroll horizontal

---

## 🎨 Variaciones de diseño

### Variante: Contacto minimalista

Si preferís un diseño más simple sin el mapa:

```typescript
// Comentar o eliminar toda la sección del mapa
{/* Mapa */}
// ... código del mapa ...
```

### Variante: Solo información de contacto

Si solo necesitás mostrar la info sin formulario:

```typescript
// Cambiar el grid de lg:grid-cols-2 a lg:grid-cols-1
<div className="grid gap-8 lg:grid-cols-1 max-w-3xl mx-auto">
  {/* Solo la sección de información */}
</div>
```

---

## 🚨 Troubleshooting

### El mapa no carga
- Verifica que la URL del embed sea correcta
- Asegúrate de que Google Maps no esté bloqueado
- Revisa la consola para errores de iframe

### El formulario no envía
- Verifica la URL del endpoint en el fetch
- Revisa la consola para errores de red
- Asegúrate de que el backend acepte JSON
- Verifica los CORS si es necesario

### Los links no funcionan
- Verifica que los datos de contacto no tengan espacios extra
- Para WhatsApp, asegúrate de incluir el código de país
- Para teléfonos, usa el formato internacional

---

## 📦 Dependencias

El componente usa:
- `lucide-react` (iconos)
- `react-router-dom` (para navegación interna)
- Tailwind CSS (estilos)

Asegúrate de tenerlas instaladas:
```bash
npm install lucide-react react-router-dom
```

---

## 🔐 Seguridad

### Recomendaciones:

1. **Rate limiting**: Limita las solicitudes por IP en el backend
2. **CAPTCHA**: Considera agregar reCAPTCHA para evitar spam
3. **Validación backend**: SIEMPRE valida en el servidor
4. **Sanitización**: Limpia los datos antes de guardarlos
5. **Notificaciones**: Envía emails de confirmación

### Ejemplo de validación Laravel:

```php
$request->validate([
    'name' => 'required|string|max:255',
    'email' => 'required|email|max:255',
    'phone' => 'required|string|max:20',
    'subject' => 'required|string|in:consulta-producto,cotizacion,pedido,facturacion,soporte-tecnico,otro',
    'message' => 'required|string|min:10|max:2000',
]);
```

---

## 📊 Analytics

Para trackear envíos de formulario:

```typescript
const handleSubmit = async (e: React.FormEvent) => {
  // ... código existente ...

  try {
    // ... envío al backend ...

    // Trackear en Google Analytics
    if (window.gtag) {
      window.gtag('event', 'form_submit', {
        event_category: 'Contact',
        event_label: formData.subject,
      })
    }

    setStatus('success')
  } catch (error) {
    // Trackear errores
    if (window.gtag) {
      window.gtag('event', 'form_error', {
        event_category: 'Contact',
        event_label: 'Submission failed',
      })
    }
    setStatus('error')
  }
}
```

---

## 📝 Notas finales

- **Personaliza los datos**: Actualiza teléfono, email, dirección y horarios
- **Configura el mapa**: Usa tu ubicación real en Google Maps
- **Conecta el backend**: Implementa el endpoint de contacto
- **Prueba todo**: Verifica que todos los links y el formulario funcionen
- **Considera agregar CAPTCHA**: Para evitar spam

---

**Versión**: 1.0.0  
**Última actualización**: Febrero 2026  
**Compatibilidad**: React 18+, TypeScript 5+
