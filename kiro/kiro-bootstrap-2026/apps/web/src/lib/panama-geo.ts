export const PANAMA_GEO = {
  provinces: [
    { name: 'Panamá', districts: [
      { name: 'Panamá', corregimientos: ['Juan Díaz', 'Bethania', 'Bella Vista', 'Calidonia', 'San Francisco', 'Pueblo Nuevo', 'Río Abajo', 'Parque Lefevre', 'Ancón', 'Curundú', 'El Chorrillo', 'Santa Ana', 'Las Cumbres', 'Chilibre', 'Tocumen', 'Pedregal', 'Las Mañanitas', 'Pacora', '24 de Diciembre'] },
      { name: 'San Miguelito', corregimientos: ['Amelia Denis de Icaza', 'Belisario Porras', 'José Domingo Espinar', 'Mateo Iturralde', 'Victoriano Lorenzo', 'Arnulfo Arias', 'Belisario Frías', 'Omar Torrijos'] },
    ]},
    { name: 'Panamá Oeste', districts: [
      { name: 'Arraiján', corregimientos: ['Arraiján Cabecera', 'Juan Demóstenes Arosemena', 'Nuevo Emperador', 'Santa Clara', 'Vista Alegre', 'Burunga'] },
      { name: 'La Chorrera', corregimientos: ['Barrio Balboa', 'Barrio Colón', 'Guadalupe', 'Herrera', 'Obaldía', 'Playa Leona', 'Puerto Caimito'] },
    ]},
    { name: 'Colón', districts: [
      { name: 'Colón', corregimientos: ['Barrio Norte', 'Barrio Sur', 'Cativá', 'Cristóbal', 'Sabanitas', 'Limón'] },
    ]},
    { name: 'Chiriquí', districts: [
      { name: 'David', corregimientos: ['David Cabecera', 'Pedregal', 'Las Lomas', 'San Pablo Nuevo', 'San Pablo Viejo'] },
    ]},
    { name: 'Veraguas', districts: [
      { name: 'Santiago', corregimientos: ['Santiago Cabecera', 'La Peña', 'San Martín de Porres', 'Urracá'] },
    ]},
    { name: 'Coclé', districts: [
      { name: 'Penonomé', corregimientos: ['Penonomé Cabecera', 'El Coco', 'Río Grande'] },
    ]},
    { name: 'Herrera', districts: [
      { name: 'Chitré', corregimientos: ['Chitré Cabecera', 'La Arena', 'Monagrillo', 'San Juan Bautista'] },
    ]},
    { name: 'Los Santos', districts: [
      { name: 'Las Tablas', corregimientos: ['Las Tablas Cabecera', 'El Manantial', 'La Laja'] },
    ]},
    { name: 'Bocas del Toro', districts: [
      { name: 'Bocas del Toro', corregimientos: ['Bocas del Toro Cabecera', 'Bastimentos', 'Cauchero'] },
    ]},
    { name: 'Darién', districts: [
      { name: 'Chepigana', corregimientos: ['La Palma', 'Garachiné', 'Sambú'] },
    ]},
  ],
};

export function getDistricts(province: string) {
  const prov = PANAMA_GEO.provinces.find(p => p.name === province);
  return prov?.districts.map(d => d.name) ?? [];
}

export function getCorregimientos(province: string, district: string) {
  const prov = PANAMA_GEO.provinces.find(p => p.name === province);
  const dist = prov?.districts.find(d => d.name === district);
  return dist?.corregimientos ?? [];
}
