// Datos de BaseDeDatos/vrb_artistapp_muestra.sql convertidos para la demo estática.
/* eslint-disable */
export const DEMO_SEED: Record<string, Record<string, any>[]> = {
 "avisos": [
  {
   "id": 77,
   "titulo": "Encuentro creativo de primavera",
   "aviso": "Visítanos en el espacio de muestra y descubre nuevas obras.",
   "fecha_publicacion": "2023-05-21",
   "id_usuario": 13,
   "hora": "00:51:20"
  },
  {
   "id": 83,
   "titulo": "Novedades del taller Aurora",
   "aviso": "Compartiremos ilustraciones y proyectos de la comunidad.",
   "fecha_publicacion": "2023-05-27",
   "id_usuario": 77,
   "hora": "11:42:58"
  }
 ],
 "categoria": [
  {
   "id": 1,
   "nombre": "Anime"
  },
  {
   "id": 2,
   "nombre": "Manga"
  },
  {
   "id": 3,
   "nombre": "Cosplay"
  },
  {
   "id": 4,
   "nombre": "Cartoon"
  },
  {
   "id": 6,
   "nombre": "Realismo"
  },
  {
   "id": 23,
   "nombre": "Yuri"
  },
  {
   "id": 24,
   "nombre": "Yaoi"
  },
  {
   "id": 26,
   "nombre": "Diseños 3D"
  },
  {
   "id": 29,
   "nombre": "Comic"
  }
 ],
 "detalles_pedido": [
  {
   "id": 286,
   "id_pedido": 180,
   "id_producto": 335
  },
  {
   "id": 295,
   "id_pedido": 183,
   "id_producto": 335
  },
  {
   "id": 300,
   "id_pedido": 184,
   "id_producto": 333
  },
  {
   "id": 301,
   "id_pedido": 185,
   "id_producto": 333
  },
  {
   "id": 302,
   "id_pedido": 186,
   "id_producto": 357
  },
  {
   "id": 304,
   "id_pedido": 187,
   "id_producto": 332
  },
  {
   "id": 305,
   "id_pedido": 187,
   "id_producto": 333
  },
  {
   "id": 306,
   "id_pedido": 188,
   "id_producto": 333
  },
  {
   "id": 308,
   "id_pedido": 189,
   "id_producto": 336
  }
 ],
 "eventos": [
  {
   "id": 119,
   "nombre": "Encuentro de Tinta y Color",
   "ubicacion": "Centro Cultural Bruma",
   "link": "https://example.test/eventos/119",
   "fecha_inicio": "2027-05-15",
   "fecha_fin": "2027-05-16",
   "id_usuario": 13,
   "imagen": "imgevento/94b30312664f1ef70d956a0fb244aace.png"
  },
  {
   "id": 120,
   "nombre": "Mercado Creativo Aurora",
   "ubicacion": "Plaza del Taller",
   "link": "https://example.test/eventos/120",
   "fecha_inicio": "2027-06-12",
   "fecha_fin": "2027-06-13",
   "id_usuario": 13,
   "imagen": "imgevento/aa54573b4430b47078c75716a55cfe83.png"
  },
  {
   "id": 121,
   "nombre": "Feria de Mundos de Papel",
   "ubicacion": "Pabellón Nube",
   "link": "https://example.test/eventos/121",
   "fecha_inicio": "2027-07-03",
   "fecha_fin": "2027-07-04",
   "id_usuario": 13,
   "imagen": "imgevento/c5be3b319a0a59ccc829aebac02c9555.png"
  },
  {
   "id": 136,
   "nombre": "Jornada Ilustrada del Río",
   "ubicacion": "Espacio Lumen",
   "link": "https://example.test/eventos/136",
   "fecha_inicio": "2027-08-21",
   "fecha_fin": "2027-08-22",
   "id_usuario": 69,
   "imagen": "imgevento/f5f329f0ccfc148a8784cff1815c5db3.jpg"
  },
  {
   "id": 148,
   "nombre": "Festival de Arte Independiente",
   "ubicacion": "Galería Horizonte",
   "link": "https://example.test/eventos/148",
   "fecha_inicio": "2027-09-18",
   "fecha_fin": "2027-09-19",
   "id_usuario": 13,
   "imagen": "imgevento/60cfe467fc696f62d6adfe7a9faa44a2.png"
  }
 ],
 "favoritos": [
  {
   "id": 32,
   "id_usuario": 67,
   "id_usuariopin": 13
  },
  {
   "id": 33,
   "id_usuario": 67,
   "id_usuariopin": 69
  },
  {
   "id": 39,
   "id_usuario": 13,
   "id_usuariopin": 44
  },
  {
   "id": 40,
   "id_usuario": 69,
   "id_usuariopin": 13
  },
  {
   "id": 41,
   "id_usuario": 69,
   "id_usuariopin": 44
  },
  {
   "id": 43,
   "id_usuario": 13,
   "id_usuariopin": 77
  },
  {
   "id": 44,
   "id_usuario": 2,
   "id_usuariopin": 13
  },
  {
   "id": 45,
   "id_usuario": 2,
   "id_usuariopin": 44
  },
  {
   "id": 48,
   "id_usuario": 44,
   "id_usuariopin": 13
  },
  {
   "id": 50,
   "id_usuario": 80,
   "id_usuariopin": 44
  },
  {
   "id": 51,
   "id_usuario": 80,
   "id_usuariopin": 13
  },
  {
   "id": 52,
   "id_usuario": 13,
   "id_usuariopin": 13
  }
 ],
 "informes": [
  {
   "id": 98,
   "id_usuario": 44,
   "informe": "Contenido de muestra pendiente de revisión",
   "id_usuarioreferenciado": 13,
   "estado": "resuelta"
  }
 ],
 "listado_evento": [
  {
   "id": 265,
   "id_evento": 120,
   "id_usuario": 13,
   "estado": "aceptado"
  },
  {
   "id": 267,
   "id_evento": 119,
   "id_usuario": 13,
   "estado": "aceptado"
  },
  {
   "id": 281,
   "id_evento": 136,
   "id_usuario": 2,
   "estado": "aceptado"
  },
  {
   "id": 283,
   "id_evento": 119,
   "id_usuario": 44,
   "estado": "aceptado"
  },
  {
   "id": 284,
   "id_evento": 121,
   "id_usuario": 44,
   "estado": "aceptado"
  },
  {
   "id": 285,
   "id_evento": 148,
   "id_usuario": 2,
   "estado": "pendiente"
  },
  {
   "id": 286,
   "id_evento": 121,
   "id_usuario": 2,
   "estado": "pendiente"
  },
  {
   "id": 287,
   "id_evento": 120,
   "id_usuario": 2,
   "estado": "pendiente"
  }
 ],
 "megusta": [
  {
   "id": 81,
   "id_usuario": 13,
   "id_publicacion": 109,
   "megusta": 1
  },
  {
   "id": 82,
   "id_usuario": 44,
   "id_publicacion": 109,
   "megusta": 1
  },
  {
   "id": 83,
   "id_usuario": 13,
   "id_publicacion": 107,
   "megusta": 0
  },
  {
   "id": 84,
   "id_usuario": 44,
   "id_publicacion": 113,
   "megusta": 1
  },
  {
   "id": 85,
   "id_usuario": 13,
   "id_publicacion": 110,
   "megusta": 1
  },
  {
   "id": 86,
   "id_usuario": 13,
   "id_publicacion": 113,
   "megusta": 1
  },
  {
   "id": 87,
   "id_usuario": 13,
   "id_publicacion": 108,
   "megusta": 1
  },
  {
   "id": 88,
   "id_usuario": 69,
   "id_publicacion": 109,
   "megusta": 0
  },
  {
   "id": 89,
   "id_usuario": 13,
   "id_publicacion": 126,
   "megusta": 1
  },
  {
   "id": 90,
   "id_usuario": 2,
   "id_publicacion": 110,
   "megusta": 1
  },
  {
   "id": 91,
   "id_usuario": 44,
   "id_publicacion": 110,
   "megusta": 1
  },
  {
   "id": 93,
   "id_usuario": 44,
   "id_publicacion": 107,
   "megusta": 1
  },
  {
   "id": 94,
   "id_usuario": 44,
   "id_publicacion": 129,
   "megusta": 1
  },
  {
   "id": 95,
   "id_usuario": 44,
   "id_publicacion": 126,
   "megusta": 1
  },
  {
   "id": 96,
   "id_usuario": 67,
   "id_publicacion": 110,
   "megusta": 1
  },
  {
   "id": 97,
   "id_usuario": 80,
   "id_publicacion": 109,
   "megusta": 1
  },
  {
   "id": 98,
   "id_usuario": 2,
   "id_publicacion": 109,
   "megusta": 1
  },
  {
   "id": 99,
   "id_usuario": 13,
   "id_publicacion": 136,
   "megusta": 1
  },
  {
   "id": 100,
   "id_usuario": 2,
   "id_publicacion": 135,
   "megusta": 1
  }
 ],
 "pedidos": [
  {
   "id": 180,
   "id_usuario": 13,
   "nombre": "Nora Luz",
   "estado": "preparando",
   "direccion": "Calle de Muestra 1",
   "telefono": "600000001",
   "pago": 34
  },
  {
   "id": 183,
   "id_usuario": 13,
   "nombre": "Nora Luz",
   "estado": "enviado",
   "direccion": "Calle de Muestra 1",
   "telefono": "600000001",
   "pago": 72
  },
  {
   "id": 184,
   "id_usuario": 77,
   "nombre": "Lía Color",
   "estado": "enviado",
   "direccion": "Avenida Demo 2",
   "telefono": "600000002",
   "pago": 34
  },
  {
   "id": 185,
   "id_usuario": 44,
   "nombre": "Ariadna Tinta",
   "estado": "entregado",
   "direccion": "Plaza Ficticia 3",
   "telefono": "600000003",
   "pago": 8
  },
  {
   "id": 186,
   "id_usuario": 44,
   "nombre": "Ariadna Tinta",
   "estado": "enviado",
   "direccion": "Plaza Ficticia 3",
   "telefono": "600000003",
   "pago": 6
  },
  {
   "id": 187,
   "id_usuario": 2,
   "nombre": "Admin ArtistApp",
   "estado": "entregado",
   "direccion": "Calle de Muestra 4",
   "telefono": "600000004",
   "pago": 34
  },
  {
   "id": 188,
   "id_usuario": 80,
   "nombre": "Sol Demo",
   "estado": "preparando",
   "direccion": "Paseo Inventado 5",
   "telefono": "600000005",
   "pago": 32
  },
  {
   "id": 189,
   "id_usuario": 13,
   "nombre": "Nora Luz",
   "estado": "preparando",
   "direccion": "Calle de Muestra 1",
   "telefono": "600000001",
   "pago": 24
  }
 ],
 "productos": [
  {
   "id": 332,
   "nombre": "Lámina Bosque de Bruma",
   "descripcion": "Ilustración original impresa en papel artístico.",
   "precio": 10,
   "cantidad": 5,
   "imagen": "img/283b139a336ca84c0c4227309bdde29a.jpg",
   "id_tipo": 1,
   "id_usuario": 13,
   "archivos": "Sin archivos"
  },
  {
   "id": 333,
   "nombre": "Dúo bajo la luna",
   "descripcion": "Ilustración digital disponible para descarga.",
   "precio": 8,
   "cantidad": 996,
   "imagen": "img/1a98c3bf7b45ff3147d192d0aa0b4ffc.png",
   "id_tipo": 2,
   "id_usuario": 44,
   "archivos": "archivos/1a98c3bf7b45ff3147d192d0aa0b4ffc.png"
  },
  {
   "id": 334,
   "nombre": "Print Horizonte",
   "descripcion": "Lámina tamaño A3 de una escena fantástica original.",
   "precio": 12,
   "cantidad": 1000,
   "imagen": "img/9a56edfd750b9edf420884ce6cd46a15.png",
   "id_tipo": 1,
   "id_usuario": 13,
   "archivos": "Sin archivos"
  },
  {
   "id": 335,
   "nombre": "Postal Recuerdos",
   "descripcion": "Ilustración digital lista para descargar.",
   "precio": 6,
   "cantidad": 998,
   "imagen": "img/0f765b9ffa14fb0f5171a48d618d180a.png",
   "id_tipo": 2,
   "id_usuario": 69,
   "archivos": "archivos/0f765b9ffa14fb0f5171a48d618d180a.png"
  },
  {
   "id": 336,
   "nombre": "Estudio de personajes",
   "descripcion": "Dibujo original realizado a mano en formato A4.",
   "precio": 20,
   "cantidad": 0,
   "imagen": "img/a0695c25349c47f7805ab2b3818557de.jpeg",
   "id_tipo": 1,
   "id_usuario": 13,
   "archivos": "Sin archivos"
  },
  {
   "id": 337,
   "nombre": "Habitante del bosque",
   "descripcion": "Dibujo original hecho a mano, pieza única.",
   "precio": 12,
   "cantidad": 1,
   "imagen": "img/59dd47d0a2fed4d79353d101542af930.jpeg",
   "id_tipo": 1,
   "id_usuario": 13,
   "archivos": "Sin archivos"
  },
  {
   "id": 356,
   "nombre": "Póster Noche Estelar",
   "descripcion": "Póster físico tamaño A3 de una obra original.",
   "precio": 3,
   "cantidad": 100,
   "imagen": "img/c3a33fa124542949a15e8376347bcc2e.jpeg",
   "id_tipo": 1,
   "id_usuario": 13,
   "archivos": "Sin archivos"
  },
  {
   "id": 357,
   "nombre": "Retrato fantástico digital",
   "descripcion": "Ilustración digital original disponible para descarga.",
   "precio": 6,
   "cantidad": 999,
   "imagen": "img/b0b7eb4ec05d351c74b4d2a43110e43b.png",
   "id_tipo": 2,
   "id_usuario": 44,
   "archivos": "archivos/b0b7eb4ec05d351c74b4d2a43110e43b.png"
  },
  {
   "id": 384,
   "nombre": "Boceto de tinta",
   "descripcion": "Dibujo único realizado con tinta sobre papel.",
   "precio": 10,
   "cantidad": 1,
   "imagen": "img/fa95c94b587b853c1c5a72a2e154248d.jpeg",
   "id_tipo": 1,
   "id_usuario": 44,
   "archivos": "Sin archivos"
  },
  {
   "id": 385,
   "nombre": "Personajes del jardín",
   "descripcion": "Ilustración digital de personajes originales.",
   "precio": 10,
   "cantidad": 1000,
   "imagen": "img/2f3ec9247a5f0815bb781ecb4d4eaa5a.jpeg",
   "id_tipo": 2,
   "id_usuario": 44,
   "archivos": "archivos/2f3ec9247a5f0815bb781ecb4d4eaa5a.jpeg"
  },
  {
   "id": 386,
   "nombre": "Criatura de papel",
   "descripcion": "Ilustración original disponible en formato digital.",
   "precio": 6,
   "cantidad": 1000,
   "imagen": "img/1e1d89ae9a112babdca89c9d8d6dcc60.jpeg",
   "id_tipo": 2,
   "id_usuario": 2,
   "archivos": "archivos/1e1d89ae9a112babdca89c9d8d6dcc60.jpeg"
  },
  {
   "id": 387,
   "nombre": "Viñeta urbana",
   "descripcion": "Dibujo original de una escena de cómic.",
   "precio": 10,
   "cantidad": 10,
   "imagen": "img/563e7dc8a52dc8819c1645480ace5ea3.jpeg",
   "id_tipo": 1,
   "id_usuario": 44,
   "archivos": "Sin archivos"
  }
 ],
 "publicaciones": [
  {
   "id": 107,
   "titulo": "Viaje entre nubes",
   "descripcion": "Boceto a lápiz de dos viajeros imaginarios.",
   "tipo": "public",
   "id_categoria": 4,
   "id_usuario": 77,
   "megusta": 5,
   "imagen": "publicaciones/124500c9ef2d3d13f1d05146ea31190e.jpeg"
  },
  {
   "id": 108,
   "titulo": "La ciudad sumergida",
   "descripcion": "Estudio de color inspirado en una ciudad fantástica.",
   "tipo": "public",
   "id_categoria": 2,
   "id_usuario": 44,
   "megusta": 1,
   "imagen": "publicaciones/5875208657ffa1732ffdf0097c2bdb65.jpeg"
  },
  {
   "id": 109,
   "titulo": "Prueba de luz",
   "descripcion": "Exploración visual para una nueva serie de ilustraciones.",
   "tipo": "public",
   "id_categoria": 2,
   "id_usuario": 13,
   "megusta": 5,
   "imagen": "publicaciones/7a2be83ad37506fb35370adc2f050c08.jpg"
  },
  {
   "id": 110,
   "titulo": "Retrato en azul",
   "descripcion": "Retrato original con una paleta de tonos fríos.",
   "tipo": "public",
   "id_categoria": 1,
   "id_usuario": 44,
   "megusta": 4,
   "imagen": "publicaciones/d8a0ef2956a0b10b6eb15018e58823ec.jpeg"
  },
  {
   "id": 111,
   "titulo": "Cuaderno de criaturas",
   "descripcion": "Algunos bocetos para una historia fantástica.",
   "tipo": "public",
   "id_categoria": 29,
   "id_usuario": 13,
   "megusta": 0,
   "imagen": "publicaciones/912d21a8a6567e5600be0f433d060f87.jpeg"
  },
  {
   "id": 113,
   "titulo": "Cazadores del alba",
   "descripcion": "Dibujo a lápiz de una escena de aventura.",
   "tipo": "public",
   "id_categoria": 29,
   "id_usuario": 44,
   "megusta": 2,
   "imagen": "publicaciones/87dda27588b0e4289b4abd59d56de357.jpeg"
  },
  {
   "id": 126,
   "titulo": "Pequeño recuerdo",
   "descripcion": "Estudio breve de una escena cotidiana.",
   "tipo": "public",
   "id_categoria": 29,
   "id_usuario": 77,
   "megusta": 2,
   "imagen": "publicaciones/54fbe75e441d19a797338cf25c852ea2.jpg"
  },
  {
   "id": 129,
   "titulo": "Guardián de piedra",
   "descripcion": "Boceto a lápiz de un personaje fantástico.",
   "tipo": "public",
   "id_categoria": 2,
   "id_usuario": 44,
   "megusta": 1,
   "imagen": "publicaciones/5a2dc6e843de47f863423cb6eaa44664.jpeg"
  },
  {
   "id": 134,
   "titulo": "El viajero",
   "descripcion": "Ilustración de un personaje original.",
   "tipo": "public",
   "id_categoria": 1,
   "id_usuario": 44,
   "megusta": 0,
   "imagen": "publicaciones/11b9d8b3a4815e3a3e234c5481465e1a.png"
  },
  {
   "id": 135,
   "titulo": "Voces del escenario",
   "descripcion": "Retrato original de un músico imaginario.",
   "tipo": "public",
   "id_categoria": 6,
   "id_usuario": 44,
   "megusta": 1,
   "imagen": "publicaciones/aa9184da79e00a386b996a1b4c013393.jpg"
  },
  {
   "id": 136,
   "titulo": "Noche en la ciudad",
   "descripcion": "Ilustración disponible en el encuentro creativo de muestra.",
   "tipo": "public",
   "id_categoria": 6,
   "id_usuario": 13,
   "megusta": 1,
   "imagen": "publicaciones/dc78e4c5dfef98031a54a47d0a6e9569.jpg"
  }
 ],
 "tipo_producto": [
  {
   "id": 1,
   "nombre": "Físico"
  },
  {
   "id": 2,
   "nombre": "Digital"
  }
 ],
 "tipo_usuario": [
  {
   "id": 1,
   "nombre": "Administrador"
  },
  {
   "id": 3,
   "nombre": "Organizador Eventos"
  },
  {
   "id": 5,
   "nombre": "Artista"
  },
  {
   "id": 7,
   "nombre": "Visitante"
  }
 ],
 "usuarios": [
  {
   "id": 2,
   "nombre": "Admin",
   "apellidos": "ArtistApp",
   "usuario": "admin-demo",
   "correo": "admin@example.test",
   "id_tipo": 1,
   "imagen": "usuarios/4a66c8b206a0ee894d0fd5befade9354.jpg",
   "biografia": "Cuenta de administración de muestra"
  },
  {
   "id": 13,
   "nombre": "Nora",
   "apellidos": "Luz",
   "usuario": "organizador-demo",
   "correo": "organizador@example.test",
   "id_tipo": 3,
   "imagen": "usuarios/f9a15cb62ac50fa9be779804d72993d6.png",
   "biografia": "Organiza encuentros creativos."
  },
  {
   "id": 44,
   "nombre": "Ariadna",
   "apellidos": "Tinta",
   "usuario": "artista-uno",
   "correo": "artista1@example.test",
   "id_tipo": 5,
   "imagen": "usuarios/183c856d3b5ee50e87a88c583eb3e9df.jpg",
   "biografia": "Ilustradora de mundos imaginarios."
  },
  {
   "id": 67,
   "nombre": "Vera",
   "apellidos": "Demo",
   "usuario": "visitante-uno",
   "correo": "visitante1@example.test",
   "id_tipo": 7,
   "imagen": "usuarios/4a66c8b206a0ee894d0fd5befade9354.jpg",
   "biografia": "Cuenta visitante de muestra."
  },
  {
   "id": 69,
   "nombre": "Kai",
   "apellidos": "Papel",
   "usuario": "organizador-dos",
   "correo": "organizador2@example.test",
   "id_tipo": 3,
   "imagen": "media/no-user.png",
   "biografia": "Organiza actividades culturales."
  },
  {
   "id": 76,
   "nombre": "Río",
   "apellidos": "Demo",
   "usuario": "visitante-dos",
   "correo": "visitante2@example.test",
   "id_tipo": 7,
   "imagen": "media/no-user.png",
   "biografia": "Cuenta visitante de muestra."
  },
  {
   "id": 77,
   "nombre": "Lía",
   "apellidos": "Color",
   "usuario": "artista-dos",
   "correo": "artista2@example.test",
   "id_tipo": 5,
   "imagen": "usuarios/720bd4b872090d2b794112497b22a6bf.jpg",
   "biografia": "Artista visual de la comunidad."
  },
  {
   "id": 78,
   "nombre": "Teo",
   "apellidos": "Trazo",
   "usuario": "artista-tres",
   "correo": "artista3@example.test",
   "id_tipo": 5,
   "imagen": "media/no-user.png",
   "biografia": "Crea ilustraciones originales."
  },
  {
   "id": 80,
   "nombre": "Sol",
   "apellidos": "Demo",
   "usuario": "visitante-tres",
   "correo": "visitante3@example.test",
   "id_tipo": 7,
   "imagen": "usuarios/cca0c207edb7aadea626a84bea369aff.png",
   "biografia": "Cuenta visitante de muestra."
  }
 ]
};
