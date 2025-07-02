# Claude Code - Requerimientos Completos: Loan Tracker UI

## 📋 CONTEXTO DEL PROYECTO

Estás desarrollando un **Loan Tracker UI** - una aplicación web para gestión de préstamos personales donde usuarios pueden registrar, monitorear y gestionar préstamos de objetos a terceros.

## 🎯 OBJETIVO PRINCIPAL

Construir la interfaz web completa aplicando todas las historias de usuario del backlog y el esquema de base de datos provisto. El reto evalúa principalmente **UI/UX**, **calidad de código** y **arquitectura front-end**.

## ⚙️ STACK TECNOLÓGICO OBLIGATORIO

| Capa | Tecnología |
|------|------------|
| Framework | **Next.js 15.3** (App Router + RSC) |
| Estilos | **Tailwind CSS 4.0** |
| UI Kit | **shadcn/ui** |
| Base de datos | **SQLite + Prisma ORM** (schema derivado de migration.sql) |
| Lenguaje | **TypeScript** |

> **Tip importante**: Expón consultas mediante Route Handlers (`/api/**`) o Server Actions; no se requiere servidor aparte.

## 📖 HISTORIAS DE USUARIO (BACKLOG COMPLETO)

### REQ-001: Registro de usuario
**Historia**: Como nuevo usuario, quiero registrarme con mi email y contraseña para acceder a la plataforma.

**Comportamiento esperado**: Permite crear cuenta y luego iniciar sesión.

**Validaciones clave**:
- Email válido y requerido
- Contraseña ≥8 caracteres con mayúscula, minúscula y número

### REQ-002: Login
**Historia**: Como usuario registrado, quiero iniciar sesión para gestionar mis préstamos.

**Comportamiento esperado**: Valida credenciales y redirige al dashboard.

**Validaciones clave**:
- Email y contraseña requeridos
- Credenciales correctas

### REQ-003: Registrar préstamo
**Historia**: Como usuario, quiero registrar un préstamo con detalles, condición, cantidad, fechas y fotos.

**Comportamiento esperado**: Guarda el préstamo y lo marca como activo.

**Validaciones clave**:
- Nombre ítem y destinatario (≤100 chars)
- Cantidad > 0
- Fecha préstamo ≤ hoy; devolución después de préstamo
- Condición inicial requerida
- Fotos JPG/PNG ≤ 5 MB

### REQ-004: Dashboard
**Historia**: Como usuario, quiero un resumen visual de mis préstamos para entender su estado.

**Comportamiento esperado**: Muestra préstamos activos, vencidos y devueltos con filtros.

**Validaciones clave**:
- Solo usuarios autenticados
- Filtros por estado y fecha válidos

### REQ-005: Marcar devolución
**Historia**: Como usuario, quiero marcar un ítem como devuelto e incluir condición final y fotos.

**Comportamiento esperado**: Actualiza el préstamo con fecha y condición final.

**Validaciones clave**:
- Solo préstamos activos
- Condición final ≤ 200 chars
- Fotos JPG/PNG ≤ 5 MB

## 🗄️ ESQUEMA DE BASE DE DATOS

```sql
-- Esquema completo basado en migration.sql

-- Tabla de usuarios
CREATE TABLE User (
    id VARCHAR PRIMARY KEY,
    email VARCHAR UNIQUE NOT NULL,
    password_hash VARCHAR NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Tabla principal de préstamos
CREATE TABLE Loan (
    id VARCHAR PRIMARY KEY,
    user_id VARCHAR NOT NULL,
    recipient_name VARCHAR NOT NULL,
    item_name VARCHAR NOT NULL,
    description TEXT,
    quantity INTEGER NOT NULL,
    borrowed_at TIMESTAMP NOT NULL,
    return_by TIMESTAMP NOT NULL,
    returned_at TIMESTAMP NULL,
    state_start VARCHAR NOT NULL,  -- Condición inicial del objeto
    state_end VARCHAR NULL,        -- Condición final del objeto
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES User(id) ON DELETE CASCADE
);

-- Tabla de fotos de préstamos
CREATE TABLE LoanPhoto (
    id VARCHAR PRIMARY KEY,
    loan_id VARCHAR NOT NULL,
    url VARCHAR NOT NULL,
    uploaded_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    type VARCHAR NOT NULL,  -- "initial" para préstamo, "return" para devolución
    FOREIGN KEY (loan_id) REFERENCES Loan(id) ON DELETE CASCADE
);

-- Tabla de logs de recordatorios
CREATE TABLE ReminderLog (
    id VARCHAR PRIMARY KEY,
    loan_id VARCHAR NOT NULL,
    sent_to VARCHAR NOT NULL,
    subject VARCHAR NOT NULL,
    sent_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (loan_id) REFERENCES Loan(id) ON DELETE CASCADE
);

-- Tabla de reset de contraseñas
CREATE TABLE PasswordReset (
    id VARCHAR PRIMARY KEY,
    user_id VARCHAR NOT NULL,
    token VARCHAR UNIQUE NOT NULL,
    expires_at TIMESTAMP NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    used_at TIMESTAMP NULL,
    FOREIGN KEY (user_id) REFERENCES User(id) ON DELETE CASCADE
);
```

## 🎨 REQUISITOS DE UI/UX

### Diseño y Responsividad
- **Responsive design**: Mobile-first approach
- **Dark mode**: Implementación completa con shadcn/ui
- **Componentes shadcn/ui**: Uso correcto y consistente
- **Accesibilidad**: Cumplir estándares básicos de a11y

### Funcionalidades de Interfaz
1. **Landing page** con opciones de login/registro
2. **Formularios de autenticación** con validación en tiempo real
3. **Dashboard principal** con:
   - Resumen visual de préstamos (activos, vencidos, devueltos)
   - Filtros por estado (activo, vencido, devuelto)
   - Filtros por fecha
   - Cards/lista de préstamos
4. **Formulario de nuevo préstamo** con:
   - Upload de múltiples fotos
   - Validación de campos obligatorios
   - Preview de imágenes
5. **Vista de detalle de préstamo** con opción de marcar devolución
6. **Formulario de devolución** con upload de fotos de estado final

## 🔒 REQUISITOS DE SEGURIDAD Y VALIDACIÓN

### Validación de Formularios
- **Client-side**: Validación inmediata con feedback visual
- **Server-side**: Validación en API routes/Server Actions
- **Sanitización**: Input sanitization para prevenir XSS
- **File upload**: Validación de tipo y tamaño de archivos

### Autenticación
- **Hash de contraseñas**: Usar bcrypt para password hashing
- **JWT tokens**: Para manejo de sesiones
- **Middleware**: Protección de rutas autenticadas
- **Logout**: Funcionalidad de cierre de sesión

## 📊 CRITERIOS DE EVALUACIÓN (PESOS)

### 🏆 35% - Código Limpio TypeScript
- **TypeScript strict mode** habilitado
- **Type safety** en toda la aplicación
- **ESLint + Prettier** configurados y aplicados
- **Tests básicos** (unit tests para componentes críticos)
- **Arquitectura limpia** con separación de responsabilidades

### 🎨 25% - UI/UX Excellence
- **Responsive design** perfecto en móvil/desktop
- **Dark mode** implementación completa
- **shadcn/ui components** usados correctamente
- **Navegación intuitiva** y flujos de usuario optimizados
- **Loading states** y feedback visual apropiado

### 🏗️ 20% - Arquitectura Sólida
- **Carpetas por feature** (auth, loans, dashboard)
- **Separación client/server** components apropiada
- **Prisma bien utilizado** con types generados
- **API routes** o Server Actions bien estructurados
- **Reutilización** de componentes y lógica

### ⚡ 10% - Performance & Developer Experience
- **Lazy loading** donde sea apropiado
- **Bundle optimization** sin librerías innecesarias
- **ESLint/Prettier** configuración perfecta
- **TypeScript paths** para imports limpios
- **Error boundaries** para manejo de errores

### 📚 10% - Claridad de Entrega
- **README.md** claro (<500 palabras) con pasos de instalación
- **Build exitoso** sin errores ni warnings
- **Decisiones técnicas** documentadas
- **Scripts npm** bien configurados

## ⏱️ RESTRICCIONES DE TIEMPO

- **8 horas efectivas** dentro de 7 días
- Priorizar funcionalidades core sobre features avanzadas
- Entrega debe ser funcional y deployable

## 🚀 FLUJOS DE USUARIO CRÍTICOS

### 1. Flujo de Registro/Login
```
Usuario nuevo → Registro → Email/Password → Validación → Login → Dashboard
Usuario existente → Login → Credenciales → Dashboard
```

### 2. Flujo de Crear Préstamo
```
Dashboard → "Nuevo Préstamo" → Formulario → Upload fotos → Validación → Guardar → Lista préstamos
```

### 3. Flujo de Devolución
```
Lista préstamos → Seleccionar préstamo activo → "Marcar devolución" → Condición final + fotos → Actualizar estado
```

### 4. Flujo de Dashboard
```
Login → Dashboard → Ver resumen → Aplicar filtros → Ver detalles préstamo → Acciones disponibles
```

## 📱 ESTADOS DE PRÉSTAMO

Un préstamo puede tener los siguientes estados:
- **Activo**: `returned_at` es NULL y `return_by` > fecha actual
- **Vencido**: `returned_at` es NULL y `return_by` < fecha actual  
- **Devuelto**: `returned_at` tiene valor

## 🎯 ENTREGABLES FINALES

1. **Repositorio GitHub** público con código fuente completo
2. **README.md** con:
   - Pasos de instalación claros
   - Comandos para setup local
   - Decisiones técnicas tomadas
   - Screenshots o GIF de funcionalidades
3. **Build funcional** que se pueda deployar
4. **Base de datos** con schema aplicado y datos de prueba (opcional)

## ⚠️ NOTAS IMPORTANTES

- **No usar librerías externas** no especificadas en el stack obligatorio
- **Priorizar funcionalidad** sobre diseño elaborado
- **Validar todos los inputs** tanto client como server side
- **Manejar errores** apropiadamente con feedback al usuario
- **Implementar loading states** para mejor UX
- **Seguir convenciones** de Next.js 15 App Router

Tu tarea es implementar TODAS estas funcionalidades siguiendo las mejores prácticas y cumpliendo con los criterios de evaluación especificados.