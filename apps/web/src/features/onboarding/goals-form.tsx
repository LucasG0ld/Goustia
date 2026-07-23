"use client";

import { useActionState } from "react";

import { Alert, Button, SelectField, TextField } from "@/components/ui";
import { initialActionState } from "@/features/auth/state";

import { saveGoalsAction } from "./actions";
import { markOnboardingStepSubmitted } from "./step-tracker";

export function GoalsForm({
  defaults,
}: {
  defaults: {
    nutritionGoal: string;
    mealsPerWeek: number;
    servingsPerMeal: number;
  };
}) {
  const [state, action, pending] = useActionState(
    saveGoalsAction,
    initialActionState,
  );
  return (
    <form
      action={action}
      className="grid gap-6"
      onSubmit={markOnboardingStepSubmitted}
    >
      {state.message ? (
        <Alert title="Vérification nécessaire" tone="danger">
          {state.message}
        </Alert>
      ) : null}
      <SelectField
        defaultValue={defaults.nutritionGoal}
        error={state.errors?.nutritionGoal?.[0]}
        label="Objectif"
        name="nutritionGoal"
        required
      >
        <option value="weight_loss">
          Perte de poids — repas rassasiants et équilibrés
        </option>
        <option value="balanced">
          Équilibre — variété sans objectif médical
        </option>
        <option value="muscle_gain">
          Prise de masse — portions et protéines adaptées
        </option>
        <option value="no_specific_goal">Aucun objectif particulier</option>
      </SelectField>
      <div className="grid gap-5 sm:grid-cols-2">
        <TextField
          defaultValue={defaults.mealsPerWeek}
          error={state.errors?.mealsPerWeek?.[0]}
          label="Repas par semaine"
          max={14}
          min={1}
          name="mealsPerWeek"
          type="number"
          required
        />
        <TextField
          defaultValue={defaults.servingsPerMeal}
          error={state.errors?.servingsPerMeal?.[0]}
          label="Personnes par repas"
          max={8}
          min={1}
          name="servingsPerMeal"
          type="number"
          required
        />
      </div>
      <Button disabled={pending} type="submit">
        {pending ? "Enregistrement…" : "Continuer"}
      </Button>
    </form>
  );
}
