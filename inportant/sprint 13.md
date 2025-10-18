

# 🔷 SPRINT 13: Audio + Configuración + Polish (Semanas 25-26)

## 🎯 Objetivos

* Sistema de audio completo
* Configuración de usuario
* Polish general de UX
* Optimización de performance

---

## 📦 Backend Tasks

### **User Settings**

* [ ] Tabla/campos en user_profiles para settings
  * audio_master_volume: 0-100
  * audio_music_volume: 0-100
  * audio_sfx_volume: 0-100
  * audio_voice_volume: 0-100
  * notifications_enabled: boolean
  * email_notifications: boolean
  * theme: 'light' | 'dark' | 'auto'
  * accessibility_high_contrast: boolean
  * accessibility_reduce_motion: boolean
* [ ] `PUT /api/users/settings` - Actualizar configuración
  * Validar rangos (0-100)
  * Guardar en user_profiles
  * Return: settings actualizadas
* [ ] `GET /api/users/settings` - Obtener configuración
  * Return: todas las settings del usuario

### **Audio Assets Management**

* [ ] Endpoint para listar audio assets
  * `GET /api/assets/sounds` - Lista de SFX
  * `GET /api/assets/music` - Lista de música
  * Metadata: name, url, duration, category
* [ ] CDN/Storage para audio
  * Subir archivos a Cloudflare R2 / S3
  * Optimizar formatos (MP3 + OGG)
  * Compression adecuada

### **Testing Backend**

* [ ] Tests de save/load settings
* [ ] Tests de validación de rangos

---

## 🎨 Frontend Tasks

### **Audio System (Howler.js)**

* [ ] AudioManager singleton
  * Cargar todos los SFX al inicio
  * Preload música de fondo
  * Gestión de volúmenes por categoría
  * Mute/unmute global
* [ ] Sound Effects
  * Correct answer: "ding.mp3"
  * Wrong answer: "buzzer.mp3"
  * Combo: "combo.mp3" (pitch increase)
  * Level up: "levelup.mp3"
  * Coin collect: "coin.mp3"
  * Achievement unlock: "achievement.mp3"
  * Button click: "click.mp3"
  * Notification: "notification.mp3"
* [ ] Background Music
  * Lobby music: "lobby_theme.mp3" (loop)
  * Gameplay music: "game_theme.mp3" (loop)
  * Boss battle: "boss_theme.mp3" (loop)
  * Victory: "victory.mp3"
  * Defeat: "defeat.mp3"
  * Smooth transitions (crossfade)
* [ ] Integración con gameplay
  * Play SFX en eventos clave
  * Cambiar música según contexto
  * Fade out/in entre screens
  * Respect user settings

### **Settings Page**

* [ ] SettingsMain page (/settings)
  * Tabs: Audio, Notifications, Accessibility, Account
* [ ] AudioSettings tab
  * **Sliders con iconos:**
    * 🔊 Master Volume (0-100)
    * 🎵 Music Volume (0-100)
    * 🎧 Sound Effects Volume (0-100)
    * 💬 Voice Volume (0-100, futuro)
  * Preview button (test sound)
  * Mute all checkbox
  * Save button
* [ ] NotificationSettings tab
  * Toggle: In-app notifications
  * Toggle: Email notifications
  * Toggle: Friend requests
  * Toggle: Achievement unlocks
  * Toggle: Event reminders
* [ ] AccessibilitySettings tab
  * Toggle: High contrast mode
  * Toggle: Reduce motion (disable animations)
  * Toggle: Larger text
  * Toggle: Screen reader support
  * Color blind mode selector
* [ ] AccountSettings tab
  * Change username
  * Change email
  * Change password
  * Privacy: profile visibility
  * Privacy: stats visibility
  * Logout button
  * Delete account button

### **Avatar Customization (Completar)**

* [ ] AvatarEditor page (/avatar-editor)
  * Canvas grande con avatar preview
  * **Categorías:**
    * Skin tone (6 opciones)
    * Hair style (10 opciones)
    * Hair color (8 colores)
    * Eyes (5 estilos)
    * Mouth (5 expresiones)
    * Clothes (10 outfits)
    * Accessories (hats, glasses, badges)
  * Botón "Randomize"
  * Botón "Save Avatar"
  * Botón "Buy More Items" (link a shop)

### **Performance Optimization**

* [ ] Code splitting por rutas
  * Lazy load de páginas
  * React.lazy + Suspense
  * Separate bundles por feature
* [ ] Image optimization
  * WebP format
  * Lazy loading de imágenes
  * Placeholder mientras carga
* [ ] Animation optimization
  * Use transform/opacity (GPU)
  * Avoid layout thrashing
  * RequestAnimationFrame para custom animations
* [ ] Bundle size reduction
  * Tree shaking
  * Remove unused dependencies
  * Analyze bundle con webpack-bundle-analyzer

### **UX Polish**

* [ ] Loading states everywhere
  * Skeleton loaders
  * Spinners apropiados
  * Progress bars
* [ ] Empty states
  * Friendly illustrations
  * Clear CTAs
  * Helpful messages
* [ ] Error states
  * Clear error messages
  * Retry buttons
  * Support links
* [ ] Success feedback
  * Toast notifications
  * Confetti celebrations
  * Clear confirmations
* [ ] Tooltips y hints
  * Hover tooltips en iconos
  * First-time user hints
  * Keyboard shortcuts hints

### **Testing Frontend**

* [ ] E2E tests con Playwright
* [ ] Visual regression tests
* [ ] Performance profiling
* [ ] Accessibility audit

---

## ✅ Criterios de Aceptación

* [ ] Sistema de audio completo funciona
* [ ] Todos los SFX se reproducen en eventos correctos
* [ ] Música de fondo cambia según contexto
* [ ] Volúmenes se pueden ajustar independientemente
* [ ] Settings se guardan y persisten
* [ ] Avatar editor completo y funcional
* [ ] Notificaciones respetan preferencias
* [ ] Accessibility options funcionan
* [ ] Performance es óptimo (\<3s carga inicial)
* [ ] No hay errores en consola
* [ ] Mobile responsive en todos los screens

---

# 📊 RESUMEN GENERAL

**Total: 7 sprints (14 semanas ≈ 3.5 meses)**

1. ✅ Sprint 7: Tienda + Avatares + Inventario
2. ✅ Sprint 8: Mascotas + Colección (con habilidades activas)
3. ✅ Sprint 9: Sistema de Logros
4. ✅ Sprint 10: Amigos + Social
5. ✅ Sprint 11: Board Mode RPG
6. ✅ Sprint 12: Survival Mode Battle Royale
7. ✅ Sprint 13: Audio + Configuración + Polish

**Funcionalidades cubiertas:**
- ✅ Tienda llamativa (mix Gacha + Catalog)
- ✅ Mascotas con animaciones (sprite/Lottie/Rive/3D)
- ✅ Mascotas dan bonuses reales (+XP, +coins)
- ✅ Vista "Yo + Mi Mascota"
- ✅ Logros con tracking automático
- ✅ Amigos + Social
- ✅ Board Mode (tablero RPG)
- ✅ Survival Mode (battle royale)
- ✅ Audio completo (Howler.js)
- ✅ Configuración + Avatar editor
- ✅ Polish general

**Próximos pasos:**
1. Aprobar este plan
2. Empezar Sprint 7
3. Iterar según feedback

¿Apruebas este roadmap completo?