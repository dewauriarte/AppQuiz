# 🧪 Testing Avatar System - Guía de Pruebas

## 🔧 Preparación

1. **Asegurar que el servidor esté corriendo:**
```bash
cd Backend
npm run dev
```

2. **Asegurar que tienes un usuario autenticado con token JWT**

---

## 📋 Tests Manuales con cURL/Postman

### 1. Obtener Avatar Actual
```bash
curl -X GET http://localhost:3000/api/users/1/avatar \
  -H "Authorization: Bearer YOUR_JWT_TOKEN"
```

**Respuesta esperada:**
```json
{
  "success": true,
  "data": {
    "user_id": 1,
    "avatar_parts": null,
    "avatar_frame_url": null,
    "composed_url": "/avatars/default.png"
  }
}
```

---

### 2. Actualizar Avatar (Caso Exitoso)

**Prerequisito:** El usuario debe tener items en su inventario

```bash
curl -X PUT http://localhost:3000/api/users/avatar \
  -H "Authorization: Bearer YOUR_JWT_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "avatar_parts": {
      "base_skin": 1,
      "hair": 2,
      "clothes": 3,
      "accessories": [4, 5]
    },
    "avatar_frame_id": 6
  }'
```

**Respuesta esperada:**
```json
{
  "success": true,
  "data": {
    "user_id": 1,
    "avatar_url": "/avatars/composed/HASH.png",
    "avatar_parts": {
      "base_skin": 1,
      "hair": 2,
      "clothes": 3,
      "accessories": [4, 5]
    },
    "avatar_frame_url": "/frames/frame.png",
    "updated_at": "2024-10-13T..."
  },
  "message": "Avatar updated successfully"
}
```

---

### 3. Actualizar Avatar (Caso Error - Item no en inventario)

```bash
curl -X PUT http://localhost:3000/api/users/avatar \
  -H "Authorization: Bearer YOUR_JWT_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "avatar_parts": {
      "base_skin": 99999
    }
  }'
```

**Respuesta esperada:**
```json
{
  "success": false,
  "message": "Validation failed: base_skin: Item 99999 not found in user inventory"
}
```

---

### 4. Resetear Avatar

```bash
curl -X DELETE http://localhost:3000/api/users/avatar \
  -H "Authorization: Bearer YOUR_JWT_TOKEN"
```

**Respuesta esperada:**
```json
{
  "success": true,
  "data": {
    "user_id": 1,
    "avatar_url": "/avatars/default.png",
    "avatar_parts": null,
    "avatar_frame_url": null,
    "updated_at": "2024-10-13T..."
  },
  "message": "Avatar reset to default"
}
```

---

## 🗃️ Preparar Datos de Prueba

### 1. Agregar Items al Shop
```sql
-- Agregar items de prueba al shop
INSERT INTO shop_items (name, description, item_type, rarity, image_url, price_coins, is_available)
VALUES 
  ('Skin Base Clara', 'Piel base color claro', 'skin', 'common', '/items/skin-base-1.png', 100, true),
  ('Cabello Negro', 'Cabello negro largo', 'accessory', 'common', '/items/hair-1.png', 150, true),
  ('Outfit Casual', 'Ropa casual', 'accessory', 'uncommon', '/items/clothes-1.png', 300, true),
  ('Gafas de Sol', 'Gafas oscuras', 'accessory', 'rare', '/items/glasses-1.png', 500, true),
  ('Gorro Rojo', 'Gorro deportivo rojo', 'accessory', 'uncommon', '/items/hat-1.png', 250, true),
  ('Marco Dorado', 'Marco de perfil dorado', 'badge', 'epic', '/frames/golden.png', 1000, true);
```

### 2. Agregar Items al Inventario del Usuario
```sql
-- Agregar items al inventario del usuario con ID 1
INSERT INTO user_inventory (user_id, item_id, quantity, acquired_source)
VALUES 
  (1, 1, 1, 'shop_purchase'),  -- Skin base
  (1, 2, 1, 'shop_purchase'),  -- Cabello
  (1, 3, 1, 'shop_purchase'),  -- Outfit
  (1, 4, 1, 'shop_purchase'),  -- Gafas
  (1, 5, 1, 'shop_purchase'),  -- Gorro
  (1, 6, 1, 'shop_purchase');  -- Marco
```

---

## ✅ Checklist de Pruebas

- [ ] GET avatar devuelve null para usuario nuevo
- [ ] PUT avatar con items válidos actualiza correctamente
- [ ] PUT avatar actualiza `is_equipped` en inventario
- [ ] PUT avatar con item inválido devuelve error 400
- [ ] PUT avatar con item no en inventario devuelve error
- [ ] DELETE avatar resetea a default
- [ ] Solo el usuario puede actualizar su avatar (403 para otros)
- [ ] Admin puede actualizar avatar de cualquier usuario
- [ ] Frame se actualiza correctamente con avatar_frame_id
- [ ] Accessories array funciona con múltiples items

---

## 🐛 Troubleshooting

### Error: "User not authenticated"
→ Verificar que el token JWT es válido y está en el header Authorization

### Error: "Item X not found in user inventory"
→ Verificar que el item existe en user_inventory para ese usuario

### Error: "Item type X cannot be equipped on avatar"
→ El tipo de item no es válido para avatar (debe ser 'skin' o 'accessory')

### Error: "Permission denied"
→ El usuario intenta acceder/modificar avatar de otro usuario sin ser admin

---

## 📊 Verificar en Base de Datos

### Ver avatar actual de un usuario
```sql
SELECT 
  user_id, 
  avatar_url, 
  avatar_parts, 
  avatar_frame_url,
  updated_at
FROM user_profiles 
WHERE user_id = 1;
```

### Ver items equipados
```sql
SELECT 
  ui.user_id,
  ui.item_id,
  si.name,
  si.item_type,
  ui.is_equipped
FROM user_inventory ui
JOIN shop_items si ON ui.item_id = si.item_id
WHERE ui.user_id = 1 AND ui.is_equipped = true;
```

---

## 🎯 Casos de Uso Completos

### Caso 1: Usuario equipa avatar completo
1. Usuario compra items de la tienda
2. Items se agregan a user_inventory
3. Usuario llama PUT /api/users/avatar con todas las partes
4. Sistema valida cada item
5. Sistema actualiza avatar_parts en user_profiles
6. Sistema marca items como is_equipped = true
7. Sistema genera avatar_url
8. Response incluye nuevo avatar completo

### Caso 2: Usuario cambia solo accesorios
1. Usuario tiene avatar configurado
2. Usuario compra nuevo accesorio
3. Usuario llama PUT /api/users/avatar cambiando solo accessories
4. Sistema mantiene otras partes y actualiza accesorios
5. Sistema desequipa accesorios anteriores
6. Sistema equipa nuevos accesorios

### Caso 3: Usuario resetea avatar
1. Usuario llama DELETE /api/users/avatar
2. Sistema limpia avatar_parts (null)
3. Sistema desequipa todos los items de avatar
4. Sistema restaura avatar_url a default
5. Usuario vuelve a tener avatar por defecto

