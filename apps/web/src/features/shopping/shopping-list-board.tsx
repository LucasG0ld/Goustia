"use client";

import { shoppingListToText } from "@recettes/domain";
import { useEffect, useMemo, useState, useTransition } from "react";
import { useRouter } from "next/navigation";

import { Button, EmptyState } from "../../components/ui";
import type {
  ShoppingItemView,
  ShoppingListView,
} from "../../lib/shopping/shopping-list";

async function requestJson(url: string, body: Record<string, unknown>) {
  const response = await fetch(url, {
    method: "POST",
    headers: { "content-type": "application/json" },
    body: JSON.stringify(body),
  });
  const payload = await response.json().catch(() => ({}));
  if (!response.ok) throw new Error(payload.message ?? "Action impossible.");
  return payload;
}

export function ShoppingListBoard({
  initialList,
  mealPlanId,
  planChanged,
}: {
  initialList: ShoppingListView | null;
  mealPlanId: string | null;
  planChanged: boolean;
}) {
  const router = useRouter();
  const [items, setItems] = useState(initialList?.items ?? []);
  const [hideChecked, setHideChecked] = useState(false);
  const [message, setMessage] = useState<string | null>(null);
  const [online, setOnline] = useState(true);
  const [isPending, startTransition] = useTransition();
  const storageKey = initialList
    ? `goustia:shopping:${initialList.id}`
    : "goustia:shopping:draft";

  useEffect(() => {
    const update = () => setOnline(navigator.onLine);
    window.addEventListener("online", update);
    window.addEventListener("offline", update);
    queueMicrotask(update);
    return () => {
      window.removeEventListener("online", update);
      window.removeEventListener("offline", update);
    };
  }, []);
  useEffect(() => {
    localStorage.setItem(storageKey, JSON.stringify(items));
  }, [items, storageKey]);

  const grouped = useMemo(() => {
    const visible = hideChecked ? items.filter((item) => !item.checked) : items;
    return Object.groupBy(visible, (item) => item.aisle);
  }, [hideChecked, items]);

  const generate = () => {
    if (!mealPlanId) return;
    startTransition(async () => {
      try {
        await requestJson("/api/v1/shopping-lists/generate", {
          idempotencyKey: crypto.randomUUID(),
          mealPlanId,
        });
        setMessage("Liste générée depuis le planning.");
        router.refresh();
      } catch (error) {
        setMessage(
          error instanceof Error ? error.message : "Erreur inattendue.",
        );
      }
    });
  };

  const mutate = async (
    body: Record<string, unknown>,
    optimistic: (current: ShoppingItemView[]) => ShoppingItemView[],
  ) => {
    if (!initialList) return;
    const previous = items;
    setItems(optimistic(previous));
    setMessage(null);
    try {
      await requestJson(`/api/v1/shopping-lists/${initialList.id}/items`, {
        ...body,
        idempotencyKey: crypto.randomUUID(),
      });
      if (body.action === "add") router.refresh();
    } catch (error) {
      setItems(previous);
      setMessage(
        `${error instanceof Error ? error.message : "Erreur."} La liste locale a été conservée.`,
      );
    }
  };

  if (!initialList) {
    return (
      <EmptyState
        action={
          <Button disabled={!mealPlanId || isPending} onClick={generate}>
            {isPending ? "Génération…" : "Générer depuis mon planning"}
          </Button>
        }
        description={
          mealPlanId
            ? "Les ingrédients seront regroupés et adaptés aux portions."
            : "Crée d’abord un planning contenant des recettes."
        }
        title="Aucune liste générée"
      />
    );
  }

  const exportItems = items.map((item) => ({
    aisle: item.aisle,
    label: item.label,
    quantity: item.quantity,
    unit: item.unit,
  }));
  return (
    <div>
      {!online ? (
        <p className="mb-4 rounded-lg bg-warning-soft p-3 font-semibold text-warning">
          Hors ligne : ta liste reste consultable. Les modifications seront
          annulées si elles ne peuvent pas être enregistrées.
        </p>
      ) : null}
      {planChanged ? (
        <p className="mb-4 rounded-lg bg-brand-soft p-3 text-brand">
          Le planning a changé depuis la dernière génération.
          <Button className="ml-3" onClick={generate} size="sm">
            Mettre à jour
          </Button>
        </p>
      ) : null}
      <div className="print:hidden flex flex-wrap gap-2">
        <Button onClick={generate} variant="secondary">
          Régénérer
        </Button>
        <Button
          onClick={async () => {
            await navigator.clipboard.writeText(
              shoppingListToText(exportItems),
            );
            setMessage("Liste copiée.");
          }}
          variant="secondary"
        >
          Copier
        </Button>
        {"share" in navigator ? (
          <Button
            onClick={() =>
              void navigator.share({
                title: initialList.title,
                text: shoppingListToText(exportItems),
              })
            }
            variant="secondary"
          >
            Partager
          </Button>
        ) : null}
        <Button onClick={() => window.print()} variant="secondary">
          Imprimer
        </Button>
        <a
          className="inline-flex min-h-12 items-center rounded-md border px-4 font-semibold"
          href={`/api/v1/shopping-lists/${initialList.id}/export?format=csv`}
        >
          Export CSV
        </a>
        <label className="flex min-h-12 items-center gap-2 px-2 font-semibold">
          <input
            checked={hideChecked}
            onChange={(event) => setHideChecked(event.target.checked)}
            type="checkbox"
          />
          Masquer les cochés
        </label>
      </div>
      <p aria-live="polite" className="my-3 min-h-6 text-sm text-muted">
        {message}
      </p>
      <form
        className="print:hidden mb-6 grid gap-2 rounded-xl border p-4 sm:grid-cols-[1fr_8rem_8rem_auto]"
        onSubmit={(event) => {
          event.preventDefault();
          const form = event.currentTarget;
          const data = new FormData(form);
          void mutate(
            {
              action: "add",
              manualLabel: data.get("label"),
              quantity: data.get("quantity")
                ? Number(data.get("quantity"))
                : null,
              unit: data.get("unit") || null,
              aisle: data.get("aisle") || "Autres",
            },
            (current) => current,
          ).then(() => form.reset());
        }}
      >
        <input
          aria-label="Produit à ajouter"
          className="min-h-12 rounded-md border px-3"
          name="label"
          placeholder="Ajouter un produit"
          required
        />
        <input
          aria-label="Quantité"
          className="min-h-12 rounded-md border px-3"
          min="0.001"
          name="quantity"
          step="0.001"
          type="number"
        />
        <select
          aria-label="Unité"
          className="min-h-12 rounded-md border px-3"
          name="unit"
        >
          <option value="">Sans unité</option>
          <option value="g">g</option>
          <option value="kg">kg</option>
          <option value="ml">ml</option>
          <option value="l">l</option>
          <option value="piece">pièce</option>
        </select>
        <Button type="submit">Ajouter</Button>
        <input
          aria-label="Rayon"
          className="min-h-12 rounded-md border px-3 sm:col-span-4"
          defaultValue="Autres"
          name="aisle"
        />
      </form>
      <div className="grid gap-7">
        {Object.entries(grouped).map(([aisle, aisleItems]) => (
          <section aria-labelledby={`aisle-${aisle}`} key={aisle}>
            <h2 className="text-xl font-semibold" id={`aisle-${aisle}`}>
              {aisle}
            </h2>
            <ul className="mt-3 grid gap-2">
              {aisleItems?.map((item) => (
                <ShoppingRow item={item} key={item.id} mutate={mutate} />
              ))}
            </ul>
          </section>
        ))}
      </div>
      <Button
        className="print:hidden mt-8"
        onClick={() => {
          if (!window.confirm("Réinitialiser tous les états de la liste ?"))
            return;
          void mutate(
            { action: "reset", confirmation: "REINITIALISER" },
            (current) =>
              current.map((item) => ({
                ...item,
                checked: false,
                available: false,
              })),
          );
        }}
        variant="ghost"
      >
        Réinitialiser la liste
      </Button>
    </div>
  );
}

function ShoppingRow({
  item,
  mutate,
}: {
  item: ShoppingItemView;
  mutate: (
    body: Record<string, unknown>,
    optimistic: (current: ShoppingItemView[]) => ShoppingItemView[],
  ) => Promise<void>;
}) {
  const [editing, setEditing] = useState(false);
  return (
    <li
      className={`rounded-lg border bg-surface p-3 ${
        item.checked || item.available ? "opacity-60" : ""
      }`}
    >
      <div className="flex flex-wrap items-center gap-3">
        <label className="flex min-h-11 flex-1 items-center gap-3 font-semibold">
          <input
            checked={item.checked}
            className="size-6"
            onChange={(event) =>
              void mutate(
                {
                  action: "toggle",
                  itemId: item.id,
                  checked: event.target.checked,
                },
                (current) =>
                  current.map((entry) =>
                    entry.id === item.id
                      ? { ...entry, checked: event.target.checked }
                      : entry,
                  ),
              )
            }
            type="checkbox"
          />
          <span className={item.checked ? "line-through" : ""}>
            {item.label}
            {item.quantity !== null
              ? ` — ${item.quantity}${item.unit ? ` ${item.unit}` : ""}`
              : ""}
          </span>
        </label>
        <label className="flex min-h-11 items-center gap-2 text-sm">
          <input
            checked={item.available}
            onChange={(event) =>
              void mutate(
                {
                  action: "toggle",
                  itemId: item.id,
                  available: event.target.checked,
                },
                (current) =>
                  current.map((entry) =>
                    entry.id === item.id
                      ? { ...entry, available: event.target.checked }
                      : entry,
                  ),
              )
            }
            type="checkbox"
          />
          Déjà disponible
        </label>
        <Button
          className="print:hidden"
          onClick={() => setEditing((current) => !current)}
          size="sm"
          variant="secondary"
        >
          Modifier
        </Button>
        <Button
          className="print:hidden"
          onClick={() =>
            void mutate({ action: "delete", itemId: item.id }, (current) =>
              current.filter((entry) => entry.id !== item.id),
            )
          }
          size="sm"
          variant="ghost"
        >
          Supprimer
        </Button>
      </div>
      {item.sources.length > 0 ? (
        <p className="mt-1 text-xs text-muted">
          Pour :{" "}
          {[...new Set(item.sources.map((source) => source.title))].join(", ")}
        </p>
      ) : (
        <p className="mt-1 text-xs text-muted">Ajout manuel</p>
      )}
      {editing ? (
        <form
          className="print:hidden mt-3 grid gap-2 border-t pt-3 sm:grid-cols-[1fr_8rem_8rem_auto]"
          onSubmit={(event) => {
            event.preventDefault();
            const data = new FormData(event.currentTarget);
            void mutate(
              {
                action: "update",
                itemId: item.id,
                manualLabel: data.get("label"),
                quantity: data.get("quantity")
                  ? Number(data.get("quantity"))
                  : null,
                unit: data.get("unit") || null,
                aisle: data.get("aisle"),
              },
              (current) =>
                current.map((entry) =>
                  entry.id === item.id
                    ? {
                        ...entry,
                        label: String(data.get("label")),
                        quantity: data.get("quantity")
                          ? Number(data.get("quantity"))
                          : null,
                        unit: (data.get("unit") || null) as typeof entry.unit,
                        aisle: String(data.get("aisle")),
                      }
                    : entry,
                ),
            ).then(() => setEditing(false));
          }}
        >
          <input
            aria-label="Nom du produit"
            className="min-h-11 rounded-md border px-3"
            defaultValue={item.label}
            name="label"
            required
          />
          <input
            aria-label="Nouvelle quantité"
            className="min-h-11 rounded-md border px-3"
            defaultValue={item.quantity ?? ""}
            min="0.001"
            name="quantity"
            step="0.001"
            type="number"
          />
          <select
            aria-label="Nouvelle unité"
            className="min-h-11 rounded-md border px-3"
            defaultValue={item.unit ?? ""}
            name="unit"
          >
            <option value="">Sans unité</option>
            <option value="g">g</option>
            <option value="kg">kg</option>
            <option value="ml">ml</option>
            <option value="l">l</option>
            <option value="piece">pièce</option>
            <option value="teaspoon">c. à café</option>
            <option value="tablespoon">c. à soupe</option>
          </select>
          <Button type="submit">Enregistrer</Button>
          <input
            aria-label="Nouveau rayon"
            className="min-h-11 rounded-md border px-3 sm:col-span-4"
            defaultValue={item.aisle}
            name="aisle"
            required
          />
        </form>
      ) : null}
    </li>
  );
}
