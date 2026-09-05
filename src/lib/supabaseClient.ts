import { createClient } from "@supabase/supabase-js";

// =============================================================================
//  Cliente Supabase
//  A URL e a chave "anon" são PÚBLICAS por design — podem ficar no código do
//  navegador sem problema. Quem protege os dados é o RLS (segurança por linha)
//  configurado no banco: visitante só lê o que é público e não edita nada;
//  só o admin logado altera oficinas e depoimentos.
// =============================================================================

const SUPABASE_URL = "https://rnifwxyvpreomizryohj.supabase.co";
const SUPABASE_ANON_KEY =
  "sb_publishable_glmh2bJJEQ-m17SUvbk9nQ_7vitKd6I";

export const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY, {
  auth: {
    persistSession: true,
    autoRefreshToken: true,
  },
});
