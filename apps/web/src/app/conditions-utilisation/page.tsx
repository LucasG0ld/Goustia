import { LegalPage } from "@/components/legal-page";

export default function TermsPage() {
  return (
    <LegalPage title="Conditions générales d’utilisation">
      <section>
        <h2>1. Objet et accès</h2>
        <p>
          Goustia propose des idées de repas personnalisées. Le service est
          réservé aux adultes disposant d’une adresse e-mail valide. Le compte
          est personnel ; l’utilisateur protège ses identifiants et signale tout
          accès suspect.
        </p>
      </section>
      <section>
        <h2>2. Nature du service</h2>
        <p>
          Les recettes sont informatives et peuvent être produites ou adaptées
          par un système automatisé. Elles ne constituent ni diagnostic, ni
          prescription, ni suivi médical ou diététique professionnel.
        </p>
      </section>
      <section>
        <h2>3. Sécurité alimentaire</h2>
        <p>
          L’utilisateur doit renseigner et vérifier ses contraintes, contrôler
          les étiquettes et adapter la préparation à sa situation. En cas
          d’allergie sévère, de maladie, de grossesse ou de doute, il doit
          demander conseil à un professionnel compétent avant utilisation.
        </p>
      </section>
      <section>
        <h2>4. Usage acceptable</h2>
        <p>
          Sont interdits : contournement des protections, automatisation
          abusive, atteinte aux autres comptes, extraction massive du
          référentiel, introduction de contenu illicite et revente non autorisée
          du service.
        </p>
      </section>
      <section>
        <h2>5. Disponibilité, propriété et évolution</h2>
        <p>
          Le service peut évoluer, être interrompu pour maintenance ou corriger
          une recette. Les marques, interfaces et contenus éditoriaux restent
          protégés. Les sources publiques conservent leurs licences propres.
        </p>
      </section>
      <section>
        <h2>6. Suspension, suppression et droit applicable</h2>
        <p>
          Un compte peut être suspendu en cas d’abus ou de risque. L’utilisateur
          peut supprimer son compte depuis ses paramètres. Le droit et les
          modalités de règlement des litiges restent à compléter après choix de
          la structure éditrice et validation professionnelle.
        </p>
      </section>
    </LegalPage>
  );
}
