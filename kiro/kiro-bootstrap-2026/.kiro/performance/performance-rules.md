# PERFORMANCE RULES

## Frontend

### Lazy Loading
- Usar `dynamic()` de Next.js para componentes pesados (tablas, charts, modales)
- Lazy load de imágenes con `next/image`
- Code splitting por ruta automático con App Router

### Virtualized Tables
- Usar **TanStack Table** + virtualización para listas > 100 items
- Nunca renderizar listas completas sin paginación o virtualización

### SSR Híbrido
- Server Components por defecto en Next.js 15
- Client Components solo cuando se necesite interactividad
- Prefetch de datos críticos en Server Components

### React Query
- Cache de queries con staleTime apropiado por dominio
- Invalidación selectiva — no invalidar todo el cache
- Optimistic updates para acciones de usuario frecuentes

## Backend

### Paginación
- Toda query que retorne listas debe soportar paginación
- Cursor-based pagination para listas grandes (mejor performance que offset)
- Offset pagination aceptable para listas < 10k registros
- Respuesta estándar:
```json
{
  "data": [],
  "meta": {
    "total": 0,
    "page": 1,
    "pageSize": 20,
    "hasNextPage": false
  }
}
```

### Redis Caching
- Cache de sesiones y tokens
- Cache de queries frecuentes (dashboards, analytics)
- Cache de permisos por usuario (TTL: 5 min)
- Invalidación por evento (cuando cambia un rol, invalidar cache de permisos)

### Queue Workers (BullMQ)
- Procesar en background: emails, notificaciones, analytics, reportes pesados
- Nunca bloquear el request con operaciones lentas
- Reintentos con backoff exponencial
- Dead letter queue para jobs fallidos

### Optimized Queries
- Usar `select` explícito en Prisma — nunca `findMany()` sin select
- Evitar N+1 queries — usar `include` o `DataLoader`
- Índices en campos de filtro frecuente
- Explain analyze en queries lentas (> 100ms)

## Métricas de Performance Objetivo

| Métrica | Objetivo |
|---------|----------|
| TTFB (Time to First Byte) | < 200ms |
| LCP (Largest Contentful Paint) | < 2.5s |
| API response (p95) | < 300ms |
| DB query (p95) | < 50ms |
| Cache hit rate | > 80% |

## Monitoreo

- Logs estructurados con duración de requests
- Alertas en queries > 500ms
- Dashboard de métricas (Prometheus + Grafana o similar)
