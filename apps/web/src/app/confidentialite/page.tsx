import { LegalPage } from "@/components/legal-page";

export default function PrivacyPage() {
  return (
    <LegalPage title="Politique de confidentialité">
      <section>
        <h2>1. Responsable et contact</h2>
        <p>
          Responsable de traitement :{" "}
          <strong>[identité juridique à compléter]</strong>, adresse{" "}
          <strong>[à compléter]</strong>. Contact pour les droits :
          <strong> [adresse e-mail dédiée à compléter]</strong>. Aucun délégué à
          la protection des données n’est désigné à ce stade.
        </p>
      </section>
      <section>
        <h2>2. Données et finalités</h2>
        <ul>
          <li>
            compte et sécurité : identité, e-mail, date de naissance et journaux
            d’accès ;
          </li>
          <li>
            personnalisation : contraintes alimentaires, goûts, objectifs,
            portions et équipements ;
          </li>
          <li>
            service : plannings, réactions, favoris, listes et demandes de
            génération ;
          </li>
          <li>
            support et sécurité : signalements, erreurs techniques et audit
            administratif ;
          </li>
          <li>
            mesure produit : événements fermés sans texte libre ni donnée
            alimentaire.
          </li>
        </ul>
        <p>
          Les allergies ou informations permettant de déduire un état de santé
          peuvent relever d’un régime renforcé. Leur base légale et les
          garanties adaptées doivent être confirmées par un professionnel avant
          production.
        </p>
      </section>
      <section>
        <h2>3. Bases légales proposées</h2>
        <p>
          Exécution du service demandé pour le compte et les fonctionnalités ;
          consentement explicite envisagé pour les données potentiellement
          sensibles et les traceurs non nécessaires ; intérêt légitime envisagé
          pour la sécurité et l’amélioration strictement mesurée. Ces choix sont
          provisoires et documentés dans le registre interne.
        </p>
      </section>
      <section>
        <h2>4. Destinataires et transferts</h2>
        <p>
          Accès limité aux personnes habilitées et aux prestataires nécessaires
          : hébergement/base de données, e-mail transactionnel, observabilité et
          fournisseurs IA configurés. La liste, les régions, contrats et
          mécanismes de transfert doivent être vérifiés avant activation.
        </p>
      </section>
      <section>
        <h2>5. Conservation</h2>
        <p>
          Les données actives sont conservées pendant la vie du compte. Après
          suppression, les données liées sont effacées ; une preuve
          pseudonymisée de suppression ou de consentement peut être conservée
          jusqu’à six ans. Les détails de tentative IA sont prévus pour 14
          jours, les tâches IA 30 jours, les événements d’onboarding 90 jours et
          l’audit administratif 365 jours, sous réserve de validation.
        </p>
      </section>
      <section>
        <h2>6. Vos droits</h2>
        <p>
          Accès, rectification, effacement, limitation, opposition, portabilité
          lorsque applicable et retrait du consentement sans effet rétroactif.
          L’espace compte permet déjà rectification, export et suppression. Une
          réclamation peut être adressée à la CNIL.
        </p>
      </section>
      <section>
        <h2>7. Mineurs et décisions automatisées</h2>
        <p>
          Goustia est actuellement réservé aux personnes de 18 ans ou plus et
          bloque l’inscription en dessous de cet âge. Il n’effectue aucune
          décision médicale. Les recommandations automatisées sont corrigibles
          et leurs signaux principaux sont accessibles dans le profil.
        </p>
      </section>
    </LegalPage>
  );
}
