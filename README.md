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
```
---
## 📊 Esquemas de la base de datos
Para manejar la base de datos de plannify se usara MongoDB para una mejor organizacion gracias a su flexibilidad con estructuras dinámicas. 

### `schedule`
```bash
|----------------------------------------------------------------------------|
| Columna     | Tipo      | Descripcion                                      |
|-------------|-----------|--------------------------------------------------|
| schedule_id | ObjectId  | Identificador del horario                        |
|-------------|-----------|--------------------------------------------------|
| start_time  | Date      | Fecha de inicio del horario                      |
|-------------|-----------|--------------------------------------------------|
| end_time    | Date      | Fecha de termino del horario                     |
|-------------|-----------|--------------------------------------------------|
| subject_ids | ObjectId  | Identificador de las materias que se asocian     |
|----------------------------------------------------------------------------|
```
### `subject`
```bash
|----------------------------------------------------------------------------|
| Columna     | Tipo      | Descripcion                                      |
|-------------|-----------|--------------------------------------------------|
| subject_id  | ObjectId  | Identificador del materia                        |
|-------------|-----------|--------------------------------------------------|
| name        | String    | Nombre de la materia                             |
|-------------|-----------|--------------------------------------------------|
| teacher     | String    | Nombre del profesor que imparte la mteria        |
|-------------|-----------|--------------------------------------------------|
| classroom   | String    | Salón en donde se tomará la clase                |
|-------------|-----------|--------------------------------------------------|
| color       | String    | Color para identificar la materia                |
|-------------|-----------|--------------------------------------------------|
| emoji       | String    | Emoji para identificar la materia                |
|-------------|-----------|--------------------------------------------------|
| day         | Date      | Día de la semana en el que se toma la clase      |
|-------------|-----------|--------------------------------------------------|
| start_time  | Date      | Hora de inicio de la clase                       |
|-------------|-----------|--------------------------------------------------|
| end_time    | Date      | Hora de termino de la clase                      |
|-------------|-----------|--------------------------------------------------|
| task_ids    | ObjectId  | Tareas asociadas a esa materia                   |
|----------------------------------------------------------------------------|
```
### `task`
```bash
|----------------------------------------------------------------------------|
| Columna     | Tipo      | Descripcion                                      |
|-------------|-----------|--------------------------------------------------|
| task_id     | ObjectId  | Identificador de la tarea                        |
|-------------|-----------|--------------------------------------------------|
| title       | String    | TItulo de la tarea                               |
|-------------|-----------|--------------------------------------------------|
| dueDate     | Date      | Fecha de vencimiento de la tarea                 |
|-------------|-----------|--------------------------------------------------|
| description | String    | Descipción de la tarea a realizar                |
|-------------|-----------|--------------------------------------------------|
| subject_id  | ObjectId  | Identificador de la materia a la que se asocia   |
|----------------------------------------------------------------------------|
```
 
