'use server';

import { revalidatePath } from "next/cache";
import { createSupabaseServerClient } from "@/lib/supabase/server";

async function getPortalCustomer() {
  const supabase = await createSupabaseServerClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user?.email) throw new Error("Nicht eingeloggt");

  const { data: customer, error } = await supabase
    .from("customers")
    .select("id,email")
    .eq("email", user.email)
    .maybeSingle();

  if (error || !customer) throw new Error("Kein Kundenaccount gefunden");
  return { supabase, customer };
}

export async function updatePortalTask(formData: FormData) {
  const { supabase, customer } = await getPortalCustomer();
  const taskId = String(formData.get("task_id") || "");
  const status = String(formData.get("status") || "open");

  const { error } = await supabase
    .from("tasks")
    .update({ status })
    .eq("id", taskId)
    .eq("customer_id", customer.id);

  if (error) throw error;
  revalidatePath("/portal");
}

export async function createSupportTicket(formData: FormData) {
  const { supabase, customer } = await getPortalCustomer();
  const subject = String(formData.get("subject") || "").trim();
  const message = String(formData.get("message") || "").trim();
  if (!subject || !message) throw new Error("Betreff und Nachricht sind erforderlich");

  const { error } = await supabase.from("support_tickets").insert({
    customer_id: customer.id,
    subject,
    message,
    status: "open"
  });

  if (error) throw error;
  revalidatePath("/portal");
}
