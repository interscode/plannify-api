# 📚 Plannify API

Plannify es una aplicación diseñada para ayudar a estudiantes a organizar sus pendientes y mejorar su rendimiento académico. Esta API está estructurada siguiendo una arquitectura por capas: **Controladores**, **Servicios** y **Repositorios**.

---

## 📁 Estructura del Proyecto

```bash
src/
├── controllers/
│   ├── auth.controller.ts            # Maneja login y registro
│   ├── user.controller.ts            # Perfil del usuario
│   ├── schedule.controller.ts        # Horarios escaneados
│   ├── task.controller.ts            # Gestión de tareas
│   ├── subject.controller.ts         # Materias del usuario
│   ├── notification.controller.ts    # Notificaciones automáticas
│   └── progress.controller.ts        # Progreso por materia
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

