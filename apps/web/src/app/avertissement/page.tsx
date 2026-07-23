import { LegalPage } from "@/components/legal-page";

export default function DisclaimerPage() {
  return (
    <LegalPage title="Avertissement nutritionnel et sécurité alimentaire">
      <section>
        <h2>Pas de conseil médical</h2>
        <p>
          Goustia fournit des suggestions générales de repas. Il ne remplace
          jamais un médecin, allergologue, diététicien ou autre professionnel de
          santé et ne doit pas servir à diagnostiquer ou traiter une maladie.
        </p>
      </section>
      <section>
        <h2>Allergies et contaminations croisées</h2>
        <p>
          Le filtrage réduit les incompatibilités connues mais ne garantit pas
          l’absence d’erreur, de trace ou de contamination croisée. Vérifiez les
          emballages, les changements de composition, les ustensiles et les
          conditions de préparation. En cas d’allergie sévère, n’utilisez une
          suggestion qu’après validation professionnelle adaptée.
        </p>
      </section>
      <section>
        <h2>Valeurs nutritionnelles et alcool</h2>
        <p>
          Les valeurs nutritionnelles sont des estimations dépendant des
          ingrédients et portions. Les recettes contenant de l’alcool sont
          identifiées lorsque le référentiel le permet ; la cuisson ne garantit
          pas son élimination totale.
        </p>
      </section>
      <section>
        <h2>Urgence</h2>
        <p>
          En cas de réaction ou de symptômes, cessez la consommation et
          contactez immédiatement les services d’urgence ou un professionnel de
          santé selon la situation.
        </p>
      </section>
    </LegalPage>
  );
}
