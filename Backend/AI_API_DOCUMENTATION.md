# 🤖 AI API Documentation

## Descripción General

API para generar preguntas de quiz usando inteligencia artificial. Soporta múltiples providers (Claude, Gemini, OpenAI) y generación desde texto plano o archivos PDF.

## Autenticación

Todas las rutas requieren autenticación con JWT token en el header:
```
Authorization: Bearer <access_token>
```

## Roles Permitidos

- **teacher**: Puede generar preguntas y ver providers
- **admin**: Acceso completo, incluyendo comparación de providers

---

## Provider API Keys via Headers or Body (optional)

You can override provider API keys per-request using headers or body. Supported on `/api/v1/ai/generate`, `/api/v1/ai/generate-from-pdf`, and `/api/v1/ai/providers`.

```http
x-anthropic-key: sk-ant-...   # Claude (Anthropic)
x-google-ai-key: ...          # Gemini (Google)
x-openai-key: sk-...          # OpenAI
```

Compatibility alias:

```http
x-api-key: sk-ant-...         # treated as Claude key if provided
```

Notes:
- Only used if provided; otherwise `.env` keys are used.
- Keep keys without spaces/newlines; Claude keys start with `sk-ant-`.
- Prefer `.env` in production; headers are handy for testing.

Body override example (JSON body):

```json
{
  "apiKeys": {
    "claude": "sk-ant-...",
    "gemini": "...",
    "openai": "sk-..."
  }
}
```

## Endpoints

### 1. Generar Preguntas desde Texto

**POST** `/api/v1/ai/generate`

Genera preguntas desde texto plano usando IA.

#### Request Body

```json
{
  "text": "La fotosíntesis es el proceso mediante el cual las plantas convierten la luz solar en energía química...",
  "numQuestions": 10,
  "difficulty": "medium",
  "topic": "Biología - Fotosíntesis",
  "language": "español",
  "bloomLevel": 3,
  "includeExplanations": true,
  "timePerQuestion": 30,
  "provider": "claude"
}
```
#### Headers (opcional - override por-request)

```http
x-anthropic-key: sk-ant-...
x-google-ai-key: ...
x-openai-key: sk-...
x-api-key: sk-ant-...   # alias para Claude
```

#### Parámetros

| Campo | Tipo | Requerido | Default | Descripción |
|-------|------|-----------|---------|-------------|
| `text` | string | ✅ Sí | - | Contenido educativo (mín. 100 caracteres) |
| `numQuestions` | number | No | 10 | Número de preguntas (1-50) |
| `difficulty` | string | No | "medium" | Dificultad: "easy", "medium", "hard" |
| `topic` | string | No | - | Tema específico (máx. 200 chars) |
| `language` | string | No | "español" | Idioma de las preguntas |
| `bloomLevel` | number | No | 3 | Nivel de Bloom's Taxonomy (1-6) |
| `includeExplanations` | boolean | No | true | Incluir explicaciones en opciones |
| `timePerQuestion` | number | No | 30 | Tiempo sugerido en segundos (10-300) |
| `provider` | string | No | auto | Provider a usar: "claude", "gemini", "openai" |

#### Response Success (200)

```json
{
  "success": true,
  "message": "Questions generated successfully",
  "data": {
    "questions": [
      {
        "question_text": "¿Cuál es la función principal de la clorofila en la fotosíntesis?",
        "question_type": "multiple_choice",
        "difficulty": "medium",
        "bloom_level": 3,
        "time_limit": 30,
        "points": 1500,
        "options": [
          {
            "option_text": "Absorber luz solar",
            "is_correct": true,
            "explanation": "La clorofila es el pigmento que absorbe la energía lumínica..."
          },
          {
            "option_text": "Transportar oxígeno",
            "is_correct": false,
            "explanation": "El oxígeno es un producto de la fotosíntesis, no transportado por clorofila..."
          }
        ]
      }
    ],
    "metadata": {
      "provider": "claude",
      "model": "claude-3-sonnet-20240229",
      "processingTime": 4523
    }
  }
}
```

#### Errores

- **400**: Texto muy corto o parámetros inválidos
- **401**: No autenticado
- **403**: Rol no autorizado (requiere teacher o admin)
- **500**: Error del provider de IA

---

### 2. Generar Preguntas desde PDF

**POST** `/api/v1/ai/generate-from-pdf`

Genera preguntas extrayendo texto de un archivo PDF.

#### Request

**Content-Type**: `multipart/form-data`

**Form Fields**:
- `pdf` (file): Archivo PDF (máx. 10 MB)
- `numQuestions` (string): "10"
- `difficulty` (string): "medium"
- `topic` (string): "Tema opcional"
- `language` (string): "español"
- `bloomLevel` (string): "3"
- `includeExplanations` (string): "true"
- `timePerQuestion` (string): "30"
- `provider` (string): "claude"

#### Ejemplo cURL

```bash
curl -X POST http://localhost:4000/api/v1/ai/generate-from-pdf \
  -H "Authorization: Bearer <token>" \
  -H "x-anthropic-key: sk-ant-..." \
  -H "x-google-ai-key: ..." \
  -F "pdf=@/path/to/document.pdf" \
  -F "numQuestions=10" \
  -F "difficulty=medium" \
  -F "topic=Historia Antigua"

#### Gemini Notes

- Usa modelos: `gemini-1.5-flash-002` (recomendado) o `gemini-1.5-pro-002`.
- Evita `models/gemini-pro` en v1beta: provoca 404.
```

#### Response Success (200)

```json
{
  "success": true,
  "message": "Questions generated from PDF successfully",
  "data": {
    "questions": [...],
    "metadata": {
      "provider": "claude",
      "model": "claude-3-sonnet-20240229",
      "processingTime": 8234
    }
  },
  "fileInfo": {
    "originalName": "capitulo-5-biologia.pdf",
    "size": 2048576,
    "mimeType": "application/pdf"
  }
}
```

#### Errores

- **400**: Archivo no es PDF, muy grande, o contenido vacío
- **401**: No autenticado
- **403**: Rol no autorizado

---

### 3. Listar Providers Disponibles

**GET** `/api/v1/ai/providers`

Obtiene información de todos los providers de IA configurados.

#### Response Success (200)

```json
{
  "success": true,
  "message": "Available AI providers",
  "data": [
    {
      "name": "claude",
      "displayName": "Claude 3 (Anthropic)",
      "available": true,
      "configured": true,
      "costPerQuestion": 0.01,
      "maxTokens": 4096,
      "supportsPDF": true
    },
    {
      "name": "gemini",
      "displayName": "Gemini Pro (Google)",
      "available": true,
      "configured": true,
      "costPerQuestion": 0.008,
      "maxTokens": 8192,
      "supportsPDF": true
    },
    {
      "name": "openai",
      "displayName": "GPT-4 (OpenAI)",
      "available": false,
      "configured": false,
      "error": "Not configured"
    }
  ]
}
```

---

### 4. Estimar Costo

**POST** `/api/v1/ai/estimate-cost`

Estima el costo de generar N preguntas con un provider.

#### Request Body

```json
{
  "numQuestions": 50,
  "provider": "gemini"
}
```

#### Response Success (200)

```json
{
  "success": true,
  "message": "Cost estimated successfully",
  "data": {
    "provider": "gemini",
    "numQuestions": 50,
    "estimatedCost": 0.4,
    "currency": "USD"
  }
}
```

---

### 5. Comparar Providers (Solo Admin)

**POST** `/api/v1/ai/compare-providers`

Genera preguntas con TODOS los providers configurados y compara resultados.

⚠️ **ADVERTENCIA**: Consume créditos de API de todos los providers.

#### Request Body

```json
{
  "text": "Texto educativo para comparar...",
  "numQuestions": 5,
  "difficulty": "medium"
}
```

#### Response Success (200)

```json
{
  "success": true,
  "message": "Providers compared successfully",
  "data": [
    {
      "provider": "claude",
      "questions": [...],
      "cost": 0.05
    },
    {
      "provider": "gemini",
      "questions": [...],
      "cost": 0.04
    }
  ],
  "warning": "This operation consumed API credits from multiple providers"
}
```

---

## Bloom's Taxonomy Levels

| Nivel | Descripción | Ejemplo |
|-------|-------------|---------|
| 1 | Recordar (memorización) | "¿Qué es...?" |
| 2 | Comprender (explicar) | "Explica cómo..." |
| 3 | Aplicar (usar conocimiento) | "¿Cómo usarías...?" |
| 4 | Analizar (conexiones) | "¿Cuál es la relación...?" |
| 5 | Evaluar (justificar) | "¿Por qué es mejor...?" |
| 6 | Crear (producir) | "Diseña un..." |

---

## Niveles de Dificultad

- **easy**: Preguntas básicas, conceptos simples, 1000 puntos
- **medium**: Preguntas intermedias, análisis moderado, 1500 puntos
- **hard**: Preguntas avanzadas, pensamiento crítico, 2000 puntos

---

## Variables de Entorno Requeridas

```env
# Al menos una API key es requerida
ANTHROPIC_API_KEY=sk-ant-...
GOOGLE_AI_API_KEY=...
OPENAI_API_KEY=sk-...

# Provider por defecto
DEFAULT_AI_PROVIDER=claude  # o gemini, openai
```

---

## Ejemplos de Uso

### JavaScript/TypeScript (Axios)

```typescript
import axios from 'axios';

const api = axios.create({
  baseURL: 'http://localhost:4000/api/v1',
  headers: {
    Authorization: `Bearer ${accessToken}`,
  },
});

// Generar desde texto
const response = await api.post('/ai/generate', {
  text: 'La Segunda Guerra Mundial...',
  numQuestions: 10,
  difficulty: 'medium',
  topic: 'Historia - WW2',
  provider: 'claude',
});

console.log(response.data.data.questions);
```

### Python (requests)

```python
import requests

headers = {
    'Authorization': f'Bearer {access_token}',
    'Content-Type': 'application/json'
}

response = requests.post(
    'http://localhost:4000/api/v1/ai/generate',
    headers=headers,
    json={
        'text': 'El sistema solar...',
        'numQuestions': 10,
        'difficulty': 'easy',
        'provider': 'gemini'
    }
)

questions = response.json()['data']['questions']
```

---

## Rate Limiting

- Límite general: 100 requests / 15 minutos por IP
- Generación de preguntas: Recomendado máximo 10 requests / minuto
- PDF processing: Recomendado máximo 5 requests / minuto

---

## Códigos de Estado HTTP

| Código | Significado |
|--------|-------------|
| 200 | Éxito |
| 400 | Datos inválidos |
| 401 | No autenticado |
| 403 | No autorizado (rol) |
| 413 | Archivo muy grande |
| 429 | Demasiadas peticiones |
| 500 | Error del servidor |
| 503 | Provider de IA no disponible |

---

## Soporte

Para reportar problemas o sugerencias:
- Email: support@appquiz.com
- GitHub: https://github.com/appquiz/issues

