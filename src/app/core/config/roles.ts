/**
 * Los roles y permisos viven en la base de datos (tablas roles / permisos). En el cliente el rol es
 * solo una etiqueta: lo que decide qué se puede ver es el `alcance` y el menú que devuelve el servidor.
 */
export type Role = string;

/** plataforma = equipo de la plataforma · hotel = personal de un alojamiento · cliente = huésped */
export type Alcance = 'plataforma' | 'hotel' | 'cliente';
