"use client";

import { useState } from "react";

import {
  Alert,
  Button,
  Checkbox,
  EmptyState,
  FoodBadge,
  LiveNotification,
  Modal,
  OnboardingProgress,
  Panel,
  Radio,
  RecipeCard,
  SelectField,
  Skeleton,
  TextareaField,
  TextField,
} from "@/components/ui";

export function DesignSystemGallery() {
  const [modalOpen, setModalOpen] = useState(false);

  return (
    <main
      className="mx-auto w-full max-w-6xl px-5 py-12 sm:px-8"
      id="contenu-principal"
    >
      <header className="max-w-3xl">
        <p className="font-semibold uppercase tracking-[0.16em] text-brand">
          Goustia · environnement de développement
        </p>
        <h1 className="mt-3 text-4xl font-semibold tracking-tight sm:text-5xl">
          Design system web
        </h1>
        <p className="mt-4 text-lg text-muted">
          Inventaire visuel des composants, états et règles d’accessibilité.
        </p>
      </header>

      <div className="mt-12 grid gap-10">
        <section aria-labelledby="buttons-title">
          <h2 className="text-2xl font-semibold" id="buttons-title">
            Boutons et badges
          </h2>
          <div className="mt-5 flex flex-wrap gap-3">
            <Button>Continuer</Button>
            <Button variant="secondary">Remplacer</Button>
            <Button variant="ghost">Passer</Button>
            <Button variant="danger">Supprimer</Button>
            <Button disabled>Indisponible</Button>
            <FoodBadge tone="positive">Végétarien</FoodBadge>
            <FoodBadge tone="warning">Contient du lait</FoodBadge>
          </div>
        </section>

        <section aria-labelledby="forms-title">
          <h2 className="text-2xl font-semibold" id="forms-title">
            Formulaires
          </h2>
          <div className="mt-5 grid gap-5 rounded-xl border bg-surface p-6 md:grid-cols-2">
            <TextField
              hint="Ce prénom sera utilisé dans l’application."
              label="Prénom"
              placeholder="Camille"
              required
            />
            <SelectField label="Objectif">
              <option>Alimentation équilibrée</option>
              <option>Perte de poids</option>
            </SelectField>
            <TextareaField
              error="Décris ta demande en quelques mots."
              label="Demande ponctuelle"
            />
            <fieldset className="grid gap-3">
              <legend className="font-semibold">Préférences</legend>
              <Checkbox label="J’ai un four" />
              <Radio label="Budget modéré" name="budget-demo" />
              <Radio label="Petit budget" name="budget-demo" />
            </fieldset>
          </div>
        </section>

        <section aria-labelledby="feedback-title">
          <h2 className="text-2xl font-semibold" id="feedback-title">
            Retours et chargement
          </h2>
          <div className="mt-5 grid gap-4 md:grid-cols-2">
            <Alert title="Contraintes enregistrées" tone="success">
              Elles seront contrôlées avant chaque proposition.
            </Alert>
            <LiveNotification>
              La recette a été ajoutée à tes favoris.
            </LiveNotification>
            <div aria-busy="true" aria-label="Chargement d’une recette">
              <span className="sr-only">Chargement en cours</span>
              <Skeleton className="h-40 w-full" />
              <Skeleton className="mt-4 h-6 w-2/3" />
            </div>
            <OnboardingProgress
              currentStep={2}
              label="Ton profil essentiel"
              totalSteps={4}
            />
          </div>
        </section>

        <section aria-labelledby="cards-title">
          <h2 className="text-2xl font-semibold" id="cards-title">
            Cartes et panneaux
          </h2>
          <div className="mt-5 grid gap-5 md:grid-cols-2">
            <RecipeCard
              badges={<FoodBadge tone="positive">Rapide</FoodBadge>}
              description="Un dîner simple, frais et généreux."
              difficulty="Facile"
              durationMinutes={25}
              href="#recipe-demo"
              reason="Tu apprécies les plats végétariens rapides."
              title="Bowl de pois chiches rôtis"
            />
            <div className="grid content-start gap-5">
              <Panel title="Affiner tes propositions">
                <p className="text-muted">
                  Une question courte, toujours facultative.
                </p>
              </Panel>
              <EmptyState
                action={
                  <Button variant="secondary">Découvrir des recettes</Button>
                }
                description="Ajoute une recette pour la retrouver rapidement."
                title="Aucun favori pour le moment"
              />
            </div>
          </div>
        </section>

        <section aria-labelledby="modal-title-demo">
          <h2 className="text-2xl font-semibold" id="modal-title-demo">
            Fenêtre modale
          </h2>
          <Button className="mt-5" onClick={() => setModalOpen(true)}>
            Ouvrir la démonstration
          </Button>
          <Modal
            description="Tu peux modifier ce choix plus tard."
            onClose={() => setModalOpen(false)}
            open={modalOpen}
            title="Remplacer cette recette ?"
          >
            <div className="flex justify-end gap-3">
              <Button onClick={() => setModalOpen(false)} variant="secondary">
                Annuler
              </Button>
              <Button onClick={() => setModalOpen(false)}>Confirmer</Button>
            </div>
          </Modal>
        </section>
      </div>
    </main>
  );
}
