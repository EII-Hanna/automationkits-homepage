'use server';

import { revalidatePath } from "next/cache";
import { createSupabaseServerClient } from "@/lib/supabase/server";

async function getAuthedClient() {
  const supabase = await createSupabaseServerClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) throw new Error("Nicht eingeloggt");
  return supabase;
}

function revalidateOperations() {
  revalidatePath("/internal");
  revalidatePath("/internal/customers");
  revalidatePath("/internal/onboarding");
  revalidatePath("/internal/delivery");
}

export async function setTaskStatus(formData: FormData) {
  const supabase = await getAuthedClient();
  const taskId = String(formData.get("task_id"));
  const status = String(formData.get("status"));
  const { error } = await supabase.rpc("set_task_status", { p_task_id: taskId, p_status: status });
  if (error) throw error;
  revalidateOperations();
}

export async function setRoadmapStatus(formData: FormData) {
  const supabase = await getAuthedClient();
  const phaseId = String(formData.get("phase_id"));
  const status = String(formData.get("status"));
  const { error } = await supabase.rpc("set_roadmap_status", { p_phase_id: phaseId, p_status: status });
  if (error) throw error;
  revalidateOperations();
}

export async function setPortalStatus(formData: FormData) {
  const supabase = await getAuthedClient();
  const customerId = String(formData.get("customer_id"));
  const status = String(formData.get("status"));
  const { error } = await supabase.rpc("set_portal_status", { p_customer_id: customerId, p_status: status });
  if (error) throw error;
  revalidateOperations();
}

export async function completeOnboarding(formData: FormData) {
  const supabase = await getAuthedClient();
  const customerId = String(formData.get("customer_id"));
  const args = {
    p_customer_id: customerId,
    p_company_name: String(formData.get("company_name") || ""),
    p_contact_name: String(formData.get("contact_name") || ""),
    p_phone: String(formData.get("phone") || ""),
    p_website: String(formData.get("website") || ""),
    p_team_size: String(formData.get("team_size") || ""),
    p_primary_goal: String(formData.get("primary_goal") || ""),
    p_biggest_bottleneck: String(formData.get("biggest_bottleneck") || ""),
    p_current_tools: String(formData.get("current_tools") || ""),
    p_priority_processes: String(formData.get("priority_processes") || ""),
    p_notes: String(formData.get("notes") || "")
  };
  const { error } = await supabase.rpc("complete_customer_onboarding", args);
  if (error) throw error;
  revalidateOperations();
  revalidatePath(`/internal/customers/${customerId}`);
  revalidatePath("/portal");
}
