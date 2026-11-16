// Script para crear un usuario administrador directamente en la base de datos.
// Uso: node scripts/create-admin.mjs <email> <password> [nombre]

import { createClient } from "@supabase/supabase-js";
import { readFileSync, existsSync } from "node:fs";

// Cargar variables de .env.local
let envUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
let envKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (existsSync(".env.local")) {
  const content = readFileSync(".env.local", "utf8");
  for (const line of content.split("\n")) {
    const m = line.match(/^([A-Z0-9_]+)=(.*)/);
    if (m) {
      const k = m[1].trim();
      const v = m[2].trim();
      if (k === "NEXT_PUBLIC_SUPABASE_URL" && !envUrl) envUrl = v;
      if (k === "SUPABASE_SERVICE_ROLE_KEY" && !envKey) envKey = v;
    }
  }
}

const email = process.argv[2];
const password = process.argv[3];
const nombre = process.argv[4] || "Administrador";

if (!email || !password) {
  console.log("Uso: node scripts/create-admin.mjs <email> <password> [nombre]");
  console.log("Ejemplo: node scripts/create-admin.mjs admin@dulcetentacion.com Secreto123 'Carlos Gomez'");
  process.exit(1);
}

if (!envUrl) {
  console.error("Error: Falta NEXT_PUBLIC_SUPABASE_URL en .env.local");
  process.exit(1);
}

if (!envKey) {
  console.error("Error: Falta SUPABASE_SERVICE_ROLE_KEY en .env.local");
  console.error("Para crear usuarios desde la terminal se necesita la clave de servicio (service_role).");
  console.error("La encuentras en: Supabase Dashboard -> Project Settings -> API -> service_role (secret).");
  console.error("Cópiala en .env.local como SUPABASE_SERVICE_ROLE_KEY=tu_clave_aqui y vuelve a ejecutar.");
  process.exit(1);
}

const supabase = createClient(envUrl, envKey, {
  auth: { autoRefreshToken: false, persistSession: false },
});

async function main() {
  console.log(`Creando usuario ${email}...`);
  const { data, error } = await supabase.auth.admin.createUser({
    email,
    password,
    email_confirm: true,
  });

  let userId;
  if (error) {
    if (error.message.includes("already registered") || error.code === "email_exists") {
      console.log("El usuario ya existe en Supabase Auth, buscando ID...");
      const { data: usersData, error: listError } = await supabase.auth.admin.listUsers();
      if (listError) {
        console.error("No se pudo obtener la lista de usuarios:", listError.message);
        process.exit(1);
      }
      const existing = usersData.users.find((u) => u.email?.toLowerCase() === email.toLowerCase());
      if (!existing) {
        console.error("No se encontró el ID del usuario existente.");
        process.exit(1);
      }
      userId = existing.id;
      // Actualizar contraseña si ya existe
      await supabase.auth.admin.updateUserById(userId, { password });
    } else {
      console.error("Error creando usuario en Auth:", error.message);
      process.exit(1);
    }
  } else {
    userId = data.user.id;
  }

  // Insertar o actualizar en public.profiles
  const { error: profileError } = await supabase.from("profiles").upsert({
    id: userId,
    nombre,
    rol: "admin",
    activo: true,
  });

  if (profileError) {
    console.error("Error asignando rol en profiles:", profileError.message);
    process.exit(1);
  }

  console.log("\n========================================================");
  console.log(" ¡Usuario Administrador listo para usar en la Web!");
  console.log("========================================================");
  console.log(`URL de login: http://localhost:3000/admin/login`);
  console.log(`Correo:       ${email}`);
  console.log(`Contraseña:   ${password}`);
  console.log(`Nombre:       ${nombre}`);
  console.log("========================================================\n");
}

main();
