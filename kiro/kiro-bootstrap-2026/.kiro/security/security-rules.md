# SECURITY RULES

## Autenticación

### JWT
- Access token: expiración corta (15 min)
- Refresh token: expiración larga (7 días), rotación en cada uso
- Almacenar refresh token en DB (tabla `sessions`) para revocación
- Nunca almacenar tokens en localStorage — usar httpOnly cookies

### Contraseñas
- Hash con **Argon2id** (no bcrypt, no MD5, no SHA)
- Parámetros mínimos: `memoryCost: 65536`, `timeCost: 3`, `parallelism: 4`
- Nunca loggear contraseñas ni tokens

## Autorización

### RBAC (Role-Based Access Control)
- Roles definidos a nivel sistema: `SUPER_ADMIN`, `ADMIN`, `LEADER`, `MEMBER`, `GUEST`
- Roles contextuales por grupo/ministerio (un usuario puede ser líder en un grupo y miembro en otro)

### ABAC (Attribute-Based Access Control)
- Permisos granulares por recurso y acción
- Formato: `resource:action` (ej: `users:read`, `groups:write`, `reports:delete`)
- Evaluación: rol + atributos del recurso + contexto

## Protecciones HTTP

### Rate Limiting
- Login: 5 intentos / 15 min por IP
- API general: 100 req / min por usuario autenticado
- Endpoints públicos: 30 req / min por IP

### Headers de Seguridad (CSP)
```
Content-Security-Policy: default-src 'self'
X-Frame-Options: DENY
X-Content-Type-Options: nosniff
Referrer-Policy: strict-origin-when-cross-origin
```

### CSRF
- Tokens CSRF en formularios stateful
- SameSite=Strict en cookies de sesión

### Sanitización
- Sanitizar todo input de usuario antes de persistir
- Usar Zod para validación en frontend y backend
- Nunca confiar en datos del cliente

## Audit Logs

- Registrar toda acción crítica: login, logout, cambio de rol, eliminación, acceso a datos sensibles
- Formato: `{ userId, action, resource, resourceId, ip, userAgent, timestamp }`
- Audit logs son **inmutables** — nunca actualizar ni eliminar

## Secrets Management

- Todas las credenciales en variables de entorno
- Nunca hardcodear secrets en código
- Usar `.env.example` con placeholders, nunca `.env` en git
- En producción: usar secrets manager (AWS Secrets Manager, Vault, etc.)

## Checklist por Feature

Antes de mergear cualquier feature con datos sensibles:
- [ ] Validación de input con Zod
- [ ] Autorización verificada (no solo autenticación)
- [ ] Rate limiting aplicado
- [ ] Audit log registrado
- [ ] Datos sensibles no loggeados
- [ ] Tests de seguridad básicos
