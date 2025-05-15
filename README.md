# 📚 Plannify API

Plannify es una aplicación diseñada para ayudar a estudiantes a organizar sus pendientes y mejorar su rendimiento académico. Esta API está estructurada siguiendo una arquitectura por capas: **Controladores**, **Servicios** y **Repositorios**.

---

## 📁 Estructura del Proyecto

```bash
├── src/
│   ├── auth.ts            # Maneja login y registro
│   ├── user.ts            # Perfil del usuario
│   ├── schedule.ts        # Horarios escaneados
│   ├── task.ts            # Gestión de tareas
│   ├── subject.ts        # Materias del usuario
│   ├── notification.ts    # Notificaciones automáticas
│   └── progress.ts        # Progreso por materia
│
├── services/
│   ├── auth.service.ts
│   ├── user.service.ts
│   ├── schedule.service.ts
│   ├── task.service.ts
│   ├── subject.service.ts
│   ├── notification.service.ts
│   └── progress.service.ts
│
├── repositories/
│   ├── user.repository.ts
│   ├── schedule.repository.ts
│   ├── task.repository.ts
│   ├── subject.repository.ts
│   ├── notification.repository.ts
│   └── progress.repository.ts
````
## 📊 Esquemas de la base de datos

### `schedule`
```bash
|------------------------------------------------------------------------|
| Columna | Tipo      | Descripcion                                      |
|---------|-----------|--------------------------------------------------|
|   id    |ObjectId   | Identificador de la materia (Clave primaria)     |
|---------|-----------|--------------------------------------------------| 
 
