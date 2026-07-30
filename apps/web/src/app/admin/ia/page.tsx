import { AdminActionButton } from "@/features/admin/admin-action-button";
import { createClient } from "@/lib/supabase/server";

export default async function AdminAiPage() {
  const supabase = await createClient();
  const [
    jobsResult,
    attemptsResult,
    usageResult,
    settingsResult,
    promptsResult,
  ] = await Promise.all([
    supabase
      .from("ai_generation_jobs")
      .select(
        "id,kind,status,provider,model,prompt_version,attempt_count,progress_stage,user_error_code,created_at,completed_at",
      )
      .order("created_at", { ascending: false })
      .limit(100),
    supabase
      .from("admin_ai_attempts")
      .select(
        "provider,duration_ms,estimated_cost_usd,technical_error_code,created_at",
      )
      .order("created_at", { ascending: false })
      .limit(500),
    supabase.from("admin_ai_usage_daily").select("*").limit(30),
    supabase
      .from("ai_runtime_settings")
      .select("provider,kind,enabled,active_model,allowed_models,updated_at")
      .order("kind"),
    supabase
      .from("ai_prompt_registry")
      .select("version,kind,content_hash,status,created_at")
      .order("created_at", { ascending: false }),
  ]);
  if (jobsResult.error || settingsResult.error) {
    throw new Error("Administration IA indisponible.");
  }
  const jobs = jobsResult.data ?? [];
  const attempts = attemptsResult.data ?? [];
  const averageLatency =
    attempts.reduce((total, item) => total + (item.duration_ms ?? 0), 0) /
    Math.max(1, attempts.filter((item) => item.duration_ms !== null).length);
  const totalCost = attempts.reduce(
    (total, item) => total + (item.estimated_cost_usd ?? 0),
    0,
  );
  const errorsByProvider = Object.entries(
    Object.groupBy(
      attempts.filter((item) => item.technical_error_code),
      (item) => item.provider ?? "inconnu",
    ),
  );
  const jobsByDay = Object.entries(
    Object.groupBy(jobs, (job) => job.created_at.slice(0, 10)),
  );

  return (
    <main className="mx-auto max-w-7xl px-4 py-8" id="contenu-principal">
      <h1 className="text-3xl font-semibold">IA, quotas et coûts</h1>
      <p className="mt-2 text-muted">
        Aucun secret ni contenu de prompt n’est exposé dans cette interface.
      </p>
      <div className="mt-4">
        <AdminActionButton
          body={{ action: "recover_stale", staleMinutes: 15 }}
          confirmation="RECUPERER LES TACHES"
          endpoint="/api/v1/admin/ai"
        >
          Marquer les tâches bloquées
        </AdminActionButton>
      </div>
      <section className="mt-6 grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <Metric label="Générations récentes" value={jobs.length.toString()} />
        <Metric
          label="Échecs récents"
          value={jobs
            .filter((job) => job.status === "failed")
            .length.toString()}
        />
        <Metric
          label="Latence moyenne"
          value={`${Math.round(averageLatency)} ms`}
        />
        <Metric
          label="Coût estimé observé"
          value={`${totalCost.toFixed(4)} $`}
        />
      </section>

      <section className="mt-10 rounded-xl border bg-surface p-5">
        <h2 className="text-2xl font-semibold">
          Fournisseurs et modèles autorisés
        </h2>
        <div className="mt-4 grid gap-3">
          {(settingsResult.data ?? []).map((setting) => (
            <article
              className="rounded-lg border p-4"
              key={`${setting.provider}:${setting.kind}`}
            >
              <div className="flex flex-wrap items-center justify-between gap-3">
                <div>
                  <h3 className="font-semibold">
                    {setting.provider} · {setting.kind}
                  </h3>
                  <p className="text-sm text-muted">
                    {setting.active_model} —{" "}
                    {setting.enabled ? "actif" : "désactivé"}
                  </p>
                </div>
                <AdminActionButton
                  body={{
                    action: "configure",
                    provider: setting.provider,
                    kind: setting.kind,
                    enabled: !setting.enabled,
                    model: setting.active_model,
                  }}
                  confirmation="CONFIGURER IA"
                  endpoint="/api/v1/admin/ai"
                >
                  {setting.enabled ? "Désactiver" : "Activer"}
                </AdminActionButton>
              </div>
              <div className="mt-3 flex flex-wrap gap-2">
                {setting.allowed_models.map((model: string) => (
                  <AdminActionButton
                    body={{
                      action: "configure",
                      provider: setting.provider,
                      kind: setting.kind,
                      enabled: setting.enabled,
                      model,
                    }}
                    confirmation="CONFIGURER IA"
                    endpoint="/api/v1/admin/ai"
                    key={model}
                    variant="ghost"
                  >
                    Utiliser {model}
                  </AdminActionButton>
                ))}
              </div>
            </article>
          ))}
        </div>
      </section>

      <section className="mt-10 grid gap-6 lg:grid-cols-2">
        <div className="rounded-xl border bg-surface p-5">
          <h2 className="text-xl font-semibold">Générations par jour</h2>
          <ul className="mt-3 grid gap-2">
            {jobsByDay.map(([day, dailyJobs]) => (
              <li key={day}>
                {day}: {dailyJobs?.length ?? 0}
              </li>
            ))}
            {jobsByDay.length === 0 ? (
              <li>Aucune génération récente.</li>
            ) : null}
          </ul>
        </div>
        <div className="rounded-xl border bg-surface p-5">
          <h2 className="text-xl font-semibold">Quotas globaux</h2>
          <ul className="mt-3 grid gap-2">
            {(usageResult.data ?? []).map((usage) => (
              <li
                className="rounded-lg border p-3"
                key={`${usage.usage_date}:${usage.quota_key}`}
              >
                {usage.usage_date} · {usage.quota_key}: {usage.used_count ?? 0}/
                {usage.limit_count ?? 0} ({usage.usage_percent ?? 0} %), reste{" "}
                {Math.max(
                  0,
                  (usage.limit_count ?? 0) - (usage.used_count ?? 0),
                )}{" "}
                · {usage.estimated_cost_usd ?? 0} $
              </li>
            ))}
          </ul>
        </div>
        <div className="rounded-xl border bg-surface p-5">
          <h2 className="text-xl font-semibold">Erreurs par fournisseur</h2>
          <ul className="mt-3 grid gap-2">
            {errorsByProvider.map(([provider, errors]) => (
              <li key={provider}>
                {provider}: {errors?.length ?? 0}
              </li>
            ))}
            {errorsByProvider.length === 0 ? (
              <li>Aucune erreur récente.</li>
            ) : null}
          </ul>
        </div>
      </section>

      <section className="mt-10 rounded-xl border bg-surface p-5">
        <h2 className="text-2xl font-semibold">Versions de prompts</h2>
        <ul className="mt-3 grid gap-2">
          {(promptsResult.data ?? []).map((prompt) => (
            <li className="rounded-lg border p-3" key={prompt.version}>
              <strong>{prompt.version}</strong> · {prompt.kind} ·{" "}
              {prompt.status}
              <br />
              <span className="font-mono text-xs text-muted">
                Empreinte {prompt.content_hash.slice(0, 12)}…
              </span>
            </li>
          ))}
        </ul>
      </section>

      <section className="mt-10">
        <h2 className="text-2xl font-semibold">Tâches récentes</h2>
        <div className="mt-4 overflow-x-auto rounded-xl border bg-surface">
          <table className="w-full min-w-[900px] text-left">
            <thead>
              <tr className="border-b">
                <th className="p-3">Créée</th>
                <th className="p-3">Type</th>
                <th className="p-3">État</th>
                <th className="p-3">Fournisseur / modèle</th>
                <th className="p-3">Erreur</th>
                <th className="p-3">Actions</th>
              </tr>
            </thead>
            <tbody>
              {jobs.map((job) => (
                <tr className="border-b align-top" key={job.id}>
                  <td className="p-3 text-sm">
                    {new Date(job.created_at).toLocaleString("fr-FR")}
                  </td>
                  <td className="p-3">{job.kind}</td>
                  <td className="p-3">
                    {job.status} · {job.progress_stage}
                  </td>
                  <td className="p-3">
                    {job.provider ?? "—"} / {job.model ?? "—"}
                  </td>
                  <td className="p-3">{job.user_error_code ?? "—"}</td>
                  <td className="flex gap-2 p-3">
                    {job.status === "failed" ? (
                      <AdminActionButton
                        body={{ action: "retry", jobId: job.id }}
                        confirmation="RELANCER"
                        endpoint="/api/v1/admin/ai"
                      >
                        Relancer
                      </AdminActionButton>
                    ) : null}
                    {["succeeded", "failed", "cancelled"].includes(
                      job.status,
                    ) ? (
                      <AdminActionButton
                        body={{ action: "purge", jobId: job.id }}
                        confirmation="PURGER"
                        endpoint="/api/v1/admin/ai"
                        variant="ghost"
                      >
                        Purger les données
                      </AdminActionButton>
                    ) : null}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>
    </main>
  );
}

function Metric({ label, value }: { label: string; value: string }) {
  return (
    <article className="rounded-xl border bg-surface p-5">
      <p className="text-sm text-muted">{label}</p>
      <p className="mt-1 text-2xl font-semibold">{value}</p>
    </article>
  );
}
